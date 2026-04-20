import { HS_SECTIONS, type HsSection } from "../../lib/hs-sections";

export type ClassificationKind = "HS" | "BEC" | "SITC";

export type ArticleMetric = {
  label: string;
  risk: "High" | "Medium" | "Low";
  weight: string;
  mom: string;
  yoy: string;
};

export type CategoryAnalysisRow = {
  sectionNumber: number;
  category: string;
  mom: string;
  yoy: string;
  volume: string;
  type: "export" | "import";
  risk: "High" | "Medium" | "Low";
  weight: string;
  hsArticles: ArticleMetric[];
  becArticles: ArticleMetric[];
  sitcArticles: ArticleMetric[];
};

function strSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pctFromRand(r: number, base: number, spread: number): string {
  const v = base + (r - 0.5) * spread;
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

function riskFromRand(r: number): "High" | "Medium" | "Low" {
  if (r > 0.66) return "High";
  if (r > 0.33) return "Medium";
  return "Low";
}

function articleMetrics(
  sectionNum: number,
  index: number,
  kind: ClassificationKind,
  label: string,
): ArticleMetric {
  const rand = mulberry32(strSeed(`${sectionNum}|${index}|${kind}|${label}`));
  const r = rand();
  const r2 = rand();
  const r3 = rand();
  const mom = pctFromRand(r, (sectionNum % 5) - 2, 28);
  const yoy = pctFromRand(r2, (sectionNum % 7) - 1, 35);
  const w = (1.8 + r3 * 6.5).toFixed(1);
  return {
    label,
    risk: riskFromRand(rand()),
    weight: `${w}%`,
    mom,
    yoy,
  };
}

/** Short HS chapter descriptor for table rows (demo labels). */
function hsChapterDescriptor(chapterCode: string): string {
  const n = parseInt(chapterCode.replace(/^HS/i, ""), 10);
  const map: Record<number, string> = {
    1: "Live animals",
    2: "Meat and edible meat offal",
    3: "Fish, crustaceans, molluscs",
    4: "Dairy produce; birds' eggs; honey",
    5: "Products of animal origin n.e.s.",
    15: "Animal or vegetable fats and oils",
    39: "Plastics and articles thereof",
    71: "Natural or cultured pearls, precious stones and metals",
    84: "Nuclear reactors, boilers, machinery",
    87: "Vehicles other than railway or tramway",
  };
  return map[n] ?? `Goods classified in chapter ${n}`;
}

function hsArticlesForSection(sec: HsSection): ArticleMetric[] {
  return sec.chapterCodes.map((code, i) => {
    const label = `${code} — ${hsChapterDescriptor(code)}`;
    return articleMetrics(sec.number, i, "HS", label);
  });
}

/** BEC (Broad Economic Categories) style lines aligned to each HS section theme. */
function becLabelsForSection(sec: HsSection): string[] {
  const t = sec.title.toLowerCase();
  const n = sec.number;
  const lines: string[] = [];
  if (t.includes("live animal") || t.includes("vegetable product") || t.includes("foodstuff")) {
    lines.push(
      "BEC111 — Primary food and beverages mainly for industry",
      "BEC121 — Processed food and beverages mainly for industry",
      "BEC211 — Primary industrial supplies n.e.s.",
      "BEC22 — Processed industrial supplies n.e.s.",
      "BEC41 — Capital goods (except transport equipment)",
    );
  } else if (t.includes("mineral") || t.includes("fuel")) {
    lines.push(
      "BEC31 — Primary fuels and lubricants",
      "BEC32 — Processed fuels and lubricants",
      "BEC42 — Parts and accessories of capital goods",
      "BEC51 — Transport equipment",
      "BEC61 — Durable consumer goods",
    );
  } else if (t.includes("chemical")) {
    lines.push(
      "BEC21 — Primary industrial supplies n.e.s.",
      "BEC22 — Processed industrial supplies n.e.s.",
      "BEC42 — Parts and accessories of capital goods",
      "BEC52 — Parts and accessories of transport equipment",
      "BEC63 — Non-durable consumer goods",
    );
  } else if (t.includes("machinery") || t.includes("electrical")) {
    lines.push(
      "BEC41 — Capital goods (except transport equipment)",
      "BEC42 — Parts and accessories of capital goods",
      "BEC51 — Transport equipment",
      "BEC52 — Parts and accessories of transport equipment",
      "BEC22 — Processed industrial supplies n.e.s.",
    );
  } else if (t.includes("vehicle") || t.includes("aircraft") || t.includes("vessel")) {
    lines.push(
      "BEC51 — Transport equipment",
      "BEC52 — Parts and accessories of transport equipment",
      "BEC41 — Capital goods (except transport equipment)",
      "BEC42 — Parts and accessories of capital goods",
      "BEC62 — Semi-durable consumer goods",
    );
  } else {
    lines.push(
      `BEC21 — Industrial supplies (BEC alignment S${n})`,
      `BEC22 — Processed supplies (BEC alignment S${n})`,
      `BEC41 — Capital goods (BEC alignment S${n})`,
      `BEC61 — Consumer goods (BEC alignment S${n})`,
      `BEC111 — Food-related BEC line (S${n})`,
    );
  }
  return lines.slice(0, Math.min(6, Math.max(4, sec.chapterCodes.length)));
}

/** SITC Rev.4 style lines per HS section. */
function sitcLabelsForSection(sec: HsSection): string[] {
  const n = sec.number;
  const t = sec.title.toLowerCase();
  const lines: string[] = [];
  if (t.includes("live animal") || t.includes("vegetable") || t.includes("food")) {
    lines.push(
      "SITC 00 — Live animals other than animals of division 03",
      "SITC 04 — Cereals and cereal preparations",
      "SITC 07 — Coffee, tea, cocoa, spices",
      "SITC 08 — Feeding stuff for animals",
      "SITC 22 — Oil seeds and oleaginous fruits",
    );
  } else if (t.includes("mineral")) {
    lines.push(
      "SITC 27 — Crude fertilizers and crude minerals",
      "SITC 28 — Metalliferous ores and metal scrap",
      "SITC 32 — Coal, coke and briquettes",
      "SITC 33 — Petroleum and petroleum products",
      "SITC 34 — Gas, natural and manufactured",
    );
  } else if (t.includes("chemical")) {
    lines.push(
      "SITC 51 — Organic chemicals",
      "SITC 52 — Inorganic chemicals",
      "SITC 53 — Dyeing, tanning and colouring materials",
      "SITC 54 — Medicinal and pharmaceutical products",
      "SITC 59 — Chemical materials and products n.e.s.",
    );
  } else if (t.includes("textile")) {
    lines.push(
      "SITC 65 — Textile yarn, fabrics, made-up articles",
      "SITC 84 — Articles of apparel and clothing accessories",
      "SITC 26 — Textile fibres and their wastes",
      "SITC 61 — Leather, leather manufactures, dressed furskins",
      "SITC 83 — Travel goods, handbags and similar",
    );
  } else if (t.includes("machinery") || t.includes("electrical")) {
    lines.push(
      "SITC 71 — Power generating machinery and equipment",
      "SITC 72 — Machinery specialized for particular industries",
      "SITC 73 — Metalworking machinery",
      "SITC 75 — Office machines and automatic data-processing equipment",
      "SITC 77 — Electrical machinery and equipment n.e.s.",
    );
  } else {
    lines.push(
      `SITC ${10 + n} — Goods class SITC group (HS Section ${n})`,
      `SITC ${20 + n} — Intermediate manufactures (SITC / HS S${n})`,
      `SITC ${50 + n} — Manufactured goods by material (S${n})`,
      `SITC ${70 + n} — Machinery and transport (where applicable S${n})`,
      `SITC ${80 + n} — Miscellaneous manufactured articles (S${n})`,
    );
  }
  return lines.slice(0, Math.min(6, Math.max(4, sec.chapterCodes.length)));
}

function becArticlesForSection(sec: HsSection): ArticleMetric[] {
  return becLabelsForSection(sec).map((label, i) => articleMetrics(sec.number, i, "BEC", label));
}

function sitcArticlesForSection(sec: HsSection): ArticleMetric[] {
  return sitcLabelsForSection(sec).map((label, i) => articleMetrics(sec.number, i, "SITC", label));
}

function categoryAggregateMetrics(sectionNum: number, title: string): {
  mom: string;
  yoy: string;
  volume: string;
  risk: "High" | "Medium" | "Low";
  weight: string;
} {
  const rand = mulberry32(strSeed(`cat|${sectionNum}|${title}`));
  const mom = pctFromRand(rand(), (sectionNum % 6) - 1, 22);
  const yoy = pctFromRand(rand(), (sectionNum % 8), 30);
  const vol = (0.8 + rand() * 11.5).toFixed(1);
  const risk = riskFromRand(rand());
  const w = (2.5 + rand() * 9).toFixed(1);
  return { mom, yoy, volume: `${vol}B AED`, risk, weight: `${w}%` };
}

export function buildAllCategoryAnalysisRows(): CategoryAnalysisRow[] {
  return HS_SECTIONS.map((sec, idx) => {
    const { mom, yoy, volume, risk, weight } = categoryAggregateMetrics(sec.number, sec.title);
    const category = `Section ${sec.number}: ${sec.title}`;
    const type: "export" | "import" = idx % 2 === 0 ? "export" : "import";
    return {
      sectionNumber: sec.number,
      category,
      mom,
      yoy,
      volume,
      type,
      risk,
      weight,
      hsArticles: hsArticlesForSection(sec),
      becArticles: becArticlesForSection(sec),
      sitcArticles: sitcArticlesForSection(sec),
    };
  });
}

export function articlesForClassification(row: CategoryAnalysisRow, kind: ClassificationKind): ArticleMetric[] {
  if (kind === "HS") return row.hsArticles;
  if (kind === "BEC") return row.becArticles;
  return row.sitcArticles;
}

export function parseClassificationParam(v: string | null): ClassificationKind {
  if (v === "BEC" || v === "SITC" || v === "HS") return v;
  return "HS";
}

export const ALL_CATEGORY_ANALYSIS_ROWS = buildAllCategoryAnalysisRows();

export function findCategoryAnalysisRowByName(name: string): CategoryAnalysisRow | undefined {
  return ALL_CATEGORY_ANALYSIS_ROWS.find((r) => r.category === name);
}
