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

/** 4-digit heading label under a chapter (demo). */
function hsHeadingLabel(chapterNum: number, headingIdx: number): string {
  const four = `${String(chapterNum).padStart(2, "0")}${String(headingIdx).padStart(2, "0")}`;
  return `HS${four} — Heading ${headingIdx} (chapter ${chapterNum})`;
}

/**
 * HS: WCO section → chapters → 4-digit headings → 6-digit subheading leaves (metrics).
 * Leaves are deterministic for a given section so detail views stay aligned.
 */
function buildHsSectionArticlesAndTree(sec: HsSection): { articles: ArticleMetric[]; roots: HierarchyTreeNode[] } {
  const sectionRoot: HierarchyTreeNode = {
    id: `hs-sec-${sec.number}`,
    label: `HS Section ${sec.number} — ${sec.title}`,
    children: [],
  };
  const leaves: ArticleMetric[] = [];
  let leafSeq = 0;

  const sortedCodes = [...sec.chapterCodes].sort(
    (a, b) => parseHsChapterSortKey(`${a} —`) - parseHsChapterSortKey(`${b} —`),
  );

  for (const code of sortedCodes) {
    const chNum = parseInt(code.replace(/^HS/i, ""), 10);
    const chapterNode: HierarchyTreeNode = {
      id: `hs-ch-${sec.number}-${code}`,
      label: `${code} — ${hsChapterDescriptor(code)}`,
      children: [],
    };

    const nHeadings = 2;
    for (let h = 1; h <= nHeadings; h++) {
      const fourDigit = `${String(chNum).padStart(2, "0")}${String(h).padStart(2, "0")}`;
      const headingNode: HierarchyTreeNode = {
        id: `hs-hd-${sec.number}-${fourDigit}`,
        label: hsHeadingLabel(chNum, h),
        children: [],
      };
      const nSubs = 2;
      for (let s = 1; s <= nSubs; s++) {
        const sixDigit = `${fourDigit}${String(s).padStart(2, "0")}`;
        const subLabel = `HS${sixDigit} — ${hsChapterDescriptor(code)} (subheading ${s})`;
        const metric = articleMetrics(sec.number, leafSeq++, "HS", subLabel);
        leaves.push(metric);
        headingNode.children.push({
          id: `hs-sub-${sec.number}-${sixDigit}-${s}`,
          label: subLabel,
          metric,
          children: [],
        });
      }
      chapterNode.children.push(headingNode);
    }
    sectionRoot.children.push(chapterNode);
  }

  return { articles: leaves, roots: [sectionRoot] };
}

function hsArticlesForSection(sec: HsSection): ArticleMetric[] {
  return buildHsSectionArticlesAndTree(sec).articles;
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

function getArticlesRaw(row: CategoryAnalysisRow, kind: ClassificationKind): ArticleMetric[] {
  if (kind === "HS") return row.hsArticles;
  if (kind === "BEC") return row.becArticles;
  return row.sitcArticles;
}

export function articlesForClassification(row: CategoryAnalysisRow, kind: ClassificationKind): ArticleMetric[] {
  return getArticlesRaw(row, kind);
}

/** Rows under an expanded HS section: hierarchy headers (no metrics) vs leaves (with metrics). */
export type ClassificationDisplayRow =
  | { kind: "node"; depth: number; label: string }
  | { kind: "leaf"; depth: number; metric: ArticleMetric };

type HierarchyTreeNode = {
  id: string;
  label: string;
  metric?: ArticleMetric;
  children: HierarchyTreeNode[];
};

const BEC_MAIN_LABEL: Record<string, string> = {
  "1": "BEC 1 — Food, beverages and tobacco",
  "2": "BEC 2 — Industrial supplies not elsewhere specified",
  "3": "BEC 3 — Fuels and lubricants",
  "4": "BEC 4 — Capital goods (except transport equipment)",
  "5": "BEC 5 — Transport equipment",
  "6": "BEC 6 — Consumer goods",
};

/** BEC 2-digit subgroup titles (UN BEC structure). */
const BEC_SUBGROUP_LABEL: Record<string, string> = {
  "11": "BEC 11 — Primary food and beverages, mainly for industry",
  "12": "BEC 12 — Processed food and beverages, mainly for industry",
  "21": "BEC 21 — Primary industrial supplies n.e.s.",
  "22": "BEC 22 — Processed industrial supplies n.e.s.",
  "31": "BEC 31 — Primary fuels and lubricants",
  "32": "BEC 32 — Processed fuels and lubricants",
  "41": "BEC 41 — Capital goods (except transport equipment)",
  "42": "BEC 42 — Parts and accessories of capital goods",
  "51": "BEC 51 — Transport equipment",
  "52": "BEC 52 — Parts and accessories of transport equipment",
  "61": "BEC 61 — Durable consumer goods",
  "62": "BEC 62 — Semi-durable consumer goods",
  "63": "BEC 63 — Non-durable consumer goods",
};

const SITC_SECTION_TITLE: Record<number, string> = {
  0: "Food and live animals",
  1: "Beverages and tobacco",
  2: "Crude materials, inedible, except fuels",
  3: "Mineral fuels, lubricants and related materials",
  4: "Animal and vegetable oils, fats and waxes",
  5: "Chemicals and related products n.e.s.",
  6: "Manufactured goods classified chiefly by material",
  7: "Machinery and transport equipment",
  8: "Miscellaneous manufactured articles",
  9: "Commodities and transactions not classified elsewhere",
};

function parseBecDigits(label: string): string | null {
  const m = /^BEC\s*(\d{2,3})\b/i.exec(label.trim());
  return m ? m[1] : null;
}

function parseSitcDivisionCode(label: string): string | null {
  const m = /^SITC\s*(\d{1,3})\b/i.exec(label.trim());
  return m ? m[1] : null;
}

function parseHsChapterSortKey(label: string): number {
  const m = /^HS(\d{2})\b/i.exec(label.trim());
  return m ? parseInt(m[1], 10) : 999;
}

function ensureChild(nodes: HierarchyTreeNode[], id: string, label: string): HierarchyTreeNode {
  let n = nodes.find((c) => c.id === id);
  if (!n) {
    n = { id, label, children: [] };
    nodes.push(n);
  }
  return n;
}

function sortBecTree(nodes: HierarchyTreeNode[]): HierarchyTreeNode[] {
  const key = (id: string) => {
    const m = /(\d+)$/.exec(id);
    return m ? parseInt(m[1], 10) : 0;
  };
  return [...nodes]
    .sort((a, b) => key(a.id) - key(b.id))
    .map((n) => ({
      ...n,
      children: sortBecTree(n.children),
    }));
}

function buildBecHierarchy(articles: ArticleMetric[]): HierarchyTreeNode[] {
  const roots: HierarchyTreeNode[] = [];
  const orphans: ArticleMetric[] = [];

  for (const article of articles) {
    const digits = parseBecDigits(article.label);
    if (!digits) {
      orphans.push(article);
      continue;
    }
    const d1 = digits[0];
    const mainLabel = BEC_MAIN_LABEL[d1] ?? `BEC ${d1} — BEC category`;
    const root = ensureChild(roots, `bec-${d1}`, mainLabel);

    if (digits.length === 2) {
      root.children.push({
        id: `bec-${digits}-leaf-${strSeed(article.label)}`,
        label: article.label,
        metric: article,
        children: [],
      });
    } else {
      const d2 = digits.slice(0, 2);
      const midLabel = BEC_SUBGROUP_LABEL[d2] ?? `BEC ${d2} — BEC subgroup`;
      const mid = ensureChild(root.children, `bec-${d1}-${d2}`, midLabel);
      mid.children.push({
        id: `bec-${digits}-leaf-${strSeed(article.label)}`,
        label: article.label,
        metric: article,
        children: [],
      });
    }
  }

  const sorted = sortBecTree(roots);
  for (const a of orphans) {
    sorted.push({
      id: `bec-orphan-${strSeed(a.label)}`,
      label: a.label,
      metric: a,
      children: [],
    });
  }
  return sorted;
}

/** BEC: nomenclature root → main category → subgroup → product line (leaf). */
function buildBecHierarchyWrapped(articles: ArticleMetric[]): HierarchyTreeNode[] {
  const inner = buildBecHierarchy(articles);
  if (inner.length === 0) return [];
  return [
    {
      id: "bec-nomenclature-root",
      label: "BEC — Broad Economic Categories (Rev.4)",
      children: inner,
    },
  ];
}

function sitcGroupCodeFromArticle(div2: string, article: ArticleMetric): string {
  const d = div2.padStart(2, "0");
  const extra = (strSeed(article.label) % 7) + 1;
  return `${d.slice(0, 2)}${extra}`.slice(0, 3);
}

/** SITC Rev.4: section (1-digit) → division (2-digit) → group (3-digit) → line (leaf). */
function buildSitcHierarchy(articles: ArticleMetric[]): HierarchyTreeNode[] {
  const bySection = new Map<number, HierarchyTreeNode>();
  const orphans: ArticleMetric[] = [];

  for (const article of articles) {
    const raw = parseSitcDivisionCode(article.label);
    if (!raw) {
      orphans.push(article);
      continue;
    }
    const div = raw.length === 1 ? `0${raw}` : raw.slice(0, 2);
    const sectionDigit = parseInt(div[0], 10);
    if (Number.isNaN(sectionDigit)) continue;

    const secTitle = SITC_SECTION_TITLE[sectionDigit] ?? `SITC section ${sectionDigit}`;
    const sectionLabel = `SITC ${sectionDigit} — ${secTitle}`;
    let sectionNode = bySection.get(sectionDigit);
    if (!sectionNode) {
      sectionNode = { id: `sitc-sec-${sectionDigit}`, label: sectionLabel, children: [] };
      bySection.set(sectionDigit, sectionNode);
    }

    const divId = `sitc-div-${sectionDigit}-${div}`;
    let divNode = sectionNode.children.find((c) => c.id === divId);
    if (!divNode) {
      divNode = {
        id: divId,
        label: `SITC ${div} — Division ${div}`,
        children: [],
      };
      sectionNode.children.push(divNode);
    }

    const g = sitcGroupCodeFromArticle(div, article);
    const grpId = `sitc-grp-${sectionDigit}-${div}-${g}`;
    let grpNode = divNode.children.find((c) => c.id === grpId);
    if (!grpNode) {
      grpNode = {
        id: grpId,
        label: `SITC ${g} — Product group`,
        children: [],
      };
      divNode.children.push(grpNode);
    }
    grpNode.children.push({
      id: `sitc-leaf-${strSeed(article.label)}`,
      label: article.label,
      metric: article,
      children: [],
    });
  }

  const sortDiv = (a: HierarchyTreeNode, b: HierarchyTreeNode) => {
    const na = parseSitcDivisionCode(a.label) ?? "";
    const nb = parseSitcDivisionCode(b.label) ?? "";
    return na.localeCompare(nb, undefined, { numeric: true });
  };

  const sortGrp = (a: HierarchyTreeNode, b: HierarchyTreeNode) => {
    const na = /^SITC\s*(\d{1,3})\b/i.exec(a.label)?.[1] ?? "";
    const nb = /^SITC\s*(\d{1,3})\b/i.exec(b.label)?.[1] ?? "";
    return na.localeCompare(nb, undefined, { numeric: true });
  };

  const sortLeaf = (a: HierarchyTreeNode, b: HierarchyTreeNode) => {
    const na = parseSitcDivisionCode(a.metric?.label ?? a.label) ?? "";
    const nb = parseSitcDivisionCode(b.metric?.label ?? b.label) ?? "";
    return na.localeCompare(nb, undefined, { numeric: true });
  };

  const roots = Array.from(bySection.entries())
    .sort(([a], [b]) => a - b)
    .map(([, node]) => ({
      ...node,
      children: [...node.children].sort(sortDiv).map((d) => ({
        ...d,
        children: [...d.children].sort(sortGrp).map((g) => ({
          ...g,
          children: [...g.children].sort(sortLeaf),
        })),
      })),
    }));

  for (const article of orphans) {
    roots.push({
      id: `sitc-orphan-${strSeed(article.label)}`,
      label: article.label,
      metric: article,
      children: [],
    });
  }
  return roots;
}

function flattenHierarchy(nodes: HierarchyTreeNode[], depth = 0): ClassificationDisplayRow[] {
  const out: ClassificationDisplayRow[] = [];
  for (const n of nodes) {
    if (n.metric !== undefined && n.children.length === 0) {
      out.push({ kind: "leaf", depth, metric: n.metric });
      continue;
    }
    if (n.children.length > 0) {
      out.push({ kind: "node", depth, label: n.label });
      out.push(...flattenHierarchy(n.children, depth + 1));
    }
  }
  return out;
}

/** Ordered display rows reflecting HS / BEC / SITC hierarchy; leaves preserve navigation targets. */
export function classificationArticleDisplayRows(
  row: CategoryAnalysisRow,
  kind: ClassificationKind,
): ClassificationDisplayRow[] {
  const articles = getArticlesRaw(row, kind);
  if (articles.length === 0) return [];

  if (kind === "HS") {
    const sec = HS_SECTIONS[row.sectionNumber - 1];
    if (!sec) return [];
    return flattenHierarchy(buildHsSectionArticlesAndTree(sec).roots);
  }
  if (kind === "BEC") {
    return flattenHierarchy(buildBecHierarchyWrapped(articles));
  }
  return flattenHierarchy(buildSitcHierarchy(articles));
}

/** Leaf articles in hierarchy order (for dropdowns and counts). */
export function classificationArticleLeavesInOrder(row: CategoryAnalysisRow, kind: ClassificationKind): ArticleMetric[] {
  return classificationArticleDisplayRows(row, kind)
    .filter((r): r is Extract<ClassificationDisplayRow, { kind: "leaf" }> => r.kind === "leaf")
    .map((r) => r.metric);
}

export function parseClassificationParam(v: string | null): ClassificationKind {
  if (v === "BEC" || v === "SITC" || v === "HS") return v;
  return "HS";
}

export const ALL_CATEGORY_ANALYSIS_ROWS = buildAllCategoryAnalysisRows();

export function findCategoryAnalysisRowByName(name: string): CategoryAnalysisRow | undefined {
  return ALL_CATEGORY_ANALYSIS_ROWS.find((r) => r.category === name);
}
