/**
 * Reads HS List.xlsx (Sheet1) and writes src/app/data/hs-nomenclature.json
 * Hierarchy: HS1 (21 sections) → HS2 (chapter) → HS4 → HS6 → HS8 (tariff line leaves).
 *
 * Usage: node scripts/build-hs-nomenclature.mjs [path-to-HS-List.xlsx]
 * Default: HS List.xlsx next to the Cursor project folder (…/FT Native Marketplace/HS List.xlsx
 * when the repo lives under …/Cursor Project/Foreign-Trade-Inventory).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultInput = resolve(__dirname, "../../../HS List.xlsx");
const outPath = resolve(__dirname, "../src/app/data/hs-nomenclature.json");
const inputPath = resolve(process.argv[2] || process.env.HS_LIST_XLSX || defaultInput);

const wb = XLSX.readFile(inputPath, { type: "file" });
const sh = wb.Sheets["Sheet1"] || wb.Sheets[wb.SheetNames[0]];
if (!sh) {
  console.error("No sheet found in", inputPath);
  process.exit(1);
}
const raw = XLSX.utils.sheet_to_json(sh, { defval: "" });

const trim = (s) => String(s ?? "").trim();
const h1key = (r) => trim(r.HS1_CODE);
const h2k = (r) => trim(r.HS2_CODE);
const h4k = (r) => trim(r.HS4_Code);
const h6k = (r) => trim(r.HS6_CODE);
const h8k = (r) => trim(r.HS8_CODE);

/** @type {Map<string, { hs1: string, hs1Desc: string, hs2: Map<string, { code: string, desc: string, h4: Map<...> }> }>} */
const byH1 = new Map();

for (const row of raw) {
  if (h1key(row) === "HS1_CODE" || h1key(row) === "" || h8k(row) === "") continue;
  const hs1 = h1key(row);
  const d1 = trim(row.HS1_Desc);
  if (!byH1.has(hs1)) {
    byH1.set(hs1, { hs1, hs1Desc: d1, hs2: new Map() });
  }
  const s1 = byH1.get(hs1);
  if (d1 && !s1.hs1Desc) s1.hs1Desc = d1;

  const c2 = h2k(row);
  const d2 = trim(row.HS2_Desc);
  if (!s1.hs2.has(c2)) {
    s1.hs2.set(c2, { code: c2, desc: d2, h4: new Map() });
  }
  const n2 = s1.hs2.get(c2);
  if (d2 && !n2.desc) n2.desc = d2;

  const c4 = h4k(row);
  const d4 = trim(row.HS4_Desc);
  if (!n2.h4.has(c4)) {
    n2.h4.set(c4, { code: c4, desc: d4, h6: new Map() });
  }
  const n4 = n2.h4.get(c4);
  if (d4 && !n4.desc) n4.desc = d4;

  const c6 = h6k(row);
  const d6 = trim(row.HS6_Desc);
  if (!n4.h6.has(c6)) {
    n4.h6.set(c6, { code: c6, desc: d6, leaves: [] });
  }
  const n6 = n4.h6.get(c6);
  if (d6 && !n6.desc) n6.desc = d6;

  const c8 = h8k(row);
  const d8 = trim(row.HS8_Desc);
  n6.leaves.push({ code: c8, desc: d8 || d6 });
}

function sortStr(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

const sections = {};
for (const [h1, block] of byH1) {
  const n = parseInt(h1, 10);
  if (Number.isNaN(n) || n < 1 || n > 21) {
    console.warn("Unexpected HS1_CODE:", h1);
    continue;
  }
  const hs2Arr = [...block.hs2.values()]
    .map((c2) => {
      const hs4Arr = [...c2.h4.values()]
        .map((c4) => {
          const hs6Arr = [...c4.h6.values()]
            .map((c6) => ({
              code: c6.code,
              desc: c6.desc,
              leaves: [...c6.leaves].sort((a, b) => sortStr(a.code, b.code)),
            }))
            .sort((a, b) => sortStr(a.code, b.code));
          return { code: c4.code, desc: c4.desc, hs6: hs6Arr };
        })
        .sort((a, b) => sortStr(a.code, b.code));
      return { code: c2.code, desc: c2.desc, hs4: hs4Arr };
    })
    .sort((a, b) => sortStr(a.code, b.code));

  sections[String(n)] = { hs1: h1, hs1Desc: block.hs1Desc, hs2: hs2Arr };
}

const payload = { version: 1, source: "HS List.xlsx (Sheet1)", sections };

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(payload) + "\n", "utf8");
console.log("Wrote", outPath, "sections:", Object.keys(sections).length);
