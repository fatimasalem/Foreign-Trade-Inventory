/**
 * Reads BEC List.xlsx and writes src/app/data/bec-nomenclature.json
 * Hierarchy: BEC1 -> BEC2 -> BEC3 leaves.
 *
 * Usage: node scripts/build-bec-nomenclature.mjs [path-to-BEC-List.xlsx]
 * Default: BEC List.xlsx next to the Cursor project folder
 * (…/FT Native Marketplace/BEC List.xlsx when repo lives under
 * …/Cursor Project/Foreign-Trade-Inventory).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultInput = resolve(__dirname, "../../../BEC List.xlsx");
const outPath = resolve(__dirname, "../src/app/data/bec-nomenclature.json");
const inputPath = resolve(process.argv[2] || process.env.BEC_LIST_XLSX || defaultInput);

const trim = (s) => String(s ?? "").trim();

function findSheetWithHeaders(wb) {
  const required = ["BEC1_CODE", "BEC1_Desc", "BEC2_CODE", "BEC2_Desc", "BEC3_CODE", "BEC3_Desc"];
  for (const name of wb.SheetNames) {
    const sh = wb.Sheets[name];
    if (!sh || !sh["!ref"]) continue;
    const rows = XLSX.utils.sheet_to_json(sh, { defval: "" });
    if (rows.length === 0) continue;
    const headers = Object.keys(rows[0]).map((h) => trim(h));
    if (required.every((k) => headers.includes(k))) {
      return { name, rows };
    }
  }
  return null;
}

const wb = XLSX.readFile(inputPath, { type: "file" });
const found = findSheetWithHeaders(wb);
if (!found) {
  console.error("No sheet with BEC hierarchy headers found in", inputPath);
  process.exit(1);
}

const { name: sheetName, rows: raw } = found;
const byBec1 = new Map();

for (const row of raw) {
  const b1 = trim(row.BEC1_CODE);
  const d1 = trim(row.BEC1_Desc);
  const b2 = trim(row.BEC2_CODE);
  const d2 = trim(row.BEC2_Desc);
  const b3 = trim(row.BEC3_CODE);
  const d3 = trim(row.BEC3_Desc);

  if (
    b1 === "" ||
    b2 === "" ||
    b3 === "" ||
    b1.toUpperCase() === "BEC1_CODE" ||
    b2.toUpperCase() === "BEC2_CODE" ||
    b3.toUpperCase() === "BEC3_CODE"
  ) {
    continue;
  }

  if (!byBec1.has(b1)) {
    byBec1.set(b1, { code: b1, desc: d1, bec2: new Map() });
  }
  const n1 = byBec1.get(b1);
  if (d1 && !n1.desc) n1.desc = d1;

  if (!n1.bec2.has(b2)) {
    n1.bec2.set(b2, { code: b2, desc: d2, bec3: [] });
  }
  const n2 = n1.bec2.get(b2);
  if (d2 && !n2.desc) n2.desc = d2;

  const already = n2.bec3.find((x) => x.code === b3);
  if (!already) {
    n2.bec3.push({ code: b3, desc: d3 || d2 || d1 });
  } else if (!already.desc && d3) {
    already.desc = d3;
  }
}

function sortCodeAsc(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

const roots = [...byBec1.values()]
  .map((n1) => ({
    code: n1.code,
    desc: n1.desc,
    bec2: [...n1.bec2.values()]
      .map((n2) => ({
        code: n2.code,
        desc: n2.desc,
        bec3: [...n2.bec3].sort((a, b) => sortCodeAsc(a.code, b.code)),
      }))
      .sort((a, b) => sortCodeAsc(a.code, b.code)),
  }))
  .sort((a, b) => sortCodeAsc(a.code, b.code));

const payload = {
  version: 1,
  source: `BEC List.xlsx (${sheetName})`,
  roots,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(payload) + "\n", "utf8");
console.log("Wrote", outPath, "roots:", roots.length);
