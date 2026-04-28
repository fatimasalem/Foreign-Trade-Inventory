import { HS_SECTIONS, type HsSection } from "../../lib/hs-sections";
import { getBecNomenclatureLeaves, getBecNomenclatureRoots } from "./bec-nomenclature-data";
import { getHsNomenclatureForSectionNumber } from "./hs-nomenclature-data";

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
  /** Top-level “Category” cell: `HS1_CODE — HS1_Desc` from the HS list, when loaded. */
  category: string;
  /** `HS1_CODE` (e.g. `01` … `21`); use with `category` to avoid parsing the display string. */
  hs1Code: string;
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

function sectionThemeText(sec: HsSection): string {
  return getHsNomenclatureForSectionNumber(sec.number)?.hs1Desc ?? sec.title;
}

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

/**
 * HS: Excel hierarchy as nested table rows (HS2 → HS4 → HS6) with HS8 as metric leaves.
 * Labels use the same `CODE — Description` pattern as the sheet (codes without an `HS` prefix, except
 * 2-digit chapters are zero-padded to match HS2). Re-run `npm run build:hs` when HS List.xlsx changes.
 */
function buildHsSectionArticlesAndTree(sec: HsSection): { articles: ArticleMetric[]; roots: HierarchyTreeNode[] } {
  const data = getHsNomenclatureForSectionNumber(sec.number);
  const leaves: ArticleMetric[] = [];
  if (!data || data.hs2.length === 0) {
    return { articles: leaves, roots: [] };
  }

  const roots: HierarchyTreeNode[] = [];
  let leafSeq = 0;

  for (const h2 of data.hs2) {
    const h2code = h2.code.padStart(2, "0");
    const chapterNode: HierarchyTreeNode = {
      id: `hs-ch-${sec.number}-${h2code}`,
      label: `${h2code} — ${h2.desc}`,
      children: [],
    };

    for (const h4 of h2.hs4) {
      const headingNode: HierarchyTreeNode = {
        id: `hs-h4-${sec.number}-${h4.code}`,
        label: `${h4.code} — ${h4.desc}`,
        children: [],
      };

      for (const h6 of h4.hs6) {
        const subNode: HierarchyTreeNode = {
          id: `hs-h6-${sec.number}-${h6.code}`,
          label: `${h6.code} — ${h6.desc}`,
          children: [],
        };

        for (const h8 of h6.leaves) {
          const subLabel = `${h8.code} — ${h8.desc}`;
          const metric = articleMetrics(sec.number, leafSeq++, "HS", subLabel);
          leaves.push(metric);
          subNode.children.push({
            id: `hs-h8-${sec.number}-${h8.code}-${strSeed(subLabel)}`,
            label: subLabel,
            metric,
            children: [],
          });
        }
        if (subNode.children.length > 0) {
          headingNode.children.push(subNode);
        }
      }
      if (headingNode.children.length > 0) {
        chapterNode.children.push(headingNode);
      }
    }
    if (chapterNode.children.length > 0) {
      roots.push(chapterNode);
    }
  }

  return { articles: leaves, roots };
}

function hsArticlesForSection(sec: HsSection): ArticleMetric[] {
  return buildHsSectionArticlesAndTree(sec).articles;
}

/** Fallback BEC labels if the nomenclature JSON is unavailable. */
function becFallbackLabelsForSection(sec: HsSection): string[] {
  const t = sectionThemeText(sec).toLowerCase();
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

/** SITC Rev.4 style lines per HS1 section (theme from HS list HS1_Desc). */
function sitcLabelsForSection(sec: HsSection): string[] {
  const n = sec.number;
  const t = sectionThemeText(sec).toLowerCase();
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

function becLeafLabel(code: string, desc: string): string {
  return `BEC${code} — ${desc}`;
}

function becArticlesForSection(sec: HsSection): ArticleMetric[] {
  const leaves = getBecNomenclatureLeaves();
  if (leaves.length === 0) {
    return becFallbackLabelsForSection(sec).map((label, i) => articleMetrics(sec.number, i, "BEC", label));
  }
  return leaves.map((leaf, i) => articleMetrics(sec.number, i, "BEC", becLeafLabel(leaf.code, leaf.desc)));
}

function sitcArticlesForSection(sec: HsSection): ArticleMetric[] {
  return sitcLabelsForSection(sec).map((label, i) => articleMetrics(sec.number, i, "SITC", label));
}

function becArticlesForRoot(rootCode: string, sectionSeed: number): ArticleMetric[] {
  const roots = getBecNomenclatureRoots();
  const root = roots.find((r) => r.code === rootCode);
  if (!root) return [];
  const labels = root.bec2.flatMap((b2) => b2.bec3.map((b3) => becLeafLabel(b3.code, b3.desc)));
  return labels.map((label, i) => articleMetrics(sectionSeed, i, "BEC", label));
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
    const nom = getHsNomenclatureForSectionNumber(sec.number);
    const hs1Code = (nom?.hs1 ?? String(sec.number).padStart(2, "0")).trim();
    const { mom, yoy, volume, risk, weight } = categoryAggregateMetrics(
      sec.number,
      nom?.hs1Desc ?? sec.title,
    );
    const category = nom ? `${hs1Code} — ${nom.hs1Desc}` : sec.title;
    const type: "export" | "import" = idx % 2 === 0 ? "export" : "import";
    return {
      sectionNumber: sec.number,
      category,
      hs1Code,
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

function buildBecCategoryAnalysisRows(): CategoryAnalysisRow[] {
  const roots = getBecNomenclatureRoots();
  return roots.map((root, idx) => {
    const seed = 101 + idx;
    const { mom, yoy, volume, risk, weight } = categoryAggregateMetrics(seed, root.desc);
    const type: "export" | "import" = idx % 2 === 0 ? "export" : "import";
    return {
      sectionNumber: idx + 1,
      category: `BEC ${root.code} — ${root.desc}`,
      hs1Code: root.code,
      mom,
      yoy,
      volume,
      type,
      risk,
      weight,
      hsArticles: [],
      becArticles: becArticlesForRoot(root.code, seed),
      sitcArticles: [],
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

/**
 * Two-digit chapter (e.g. HS01) from labels like "HS01 — …", "HS0101 — …" (6/4-digit codes
 * after HS use the first two as chapter), or "010121100000 — …" (national / HS8 line).
 */
function chapterKeyFromHsLabel(label: string): string | null {
  const t = label.trim();
  const mHs = /^HS(\d{2,})/i.exec(t);
  if (mHs) {
    return `HS${mHs[1].slice(0, 2)}`.toUpperCase();
  }
  const m2 = /^(\d{2})/.exec(t);
  if (m2) return `HS${m2[1]}`;
  return null;
}

/** BEC expanded rows: BEC2_CODE (subcategory) -> BEC3_CODE (leaf line). Main row already shows BEC1. */
function buildBecHierarchyFromNomenclature(row: CategoryAnalysisRow, articles: ArticleMetric[]): HierarchyTreeNode[] {
  const roots = getBecNomenclatureRoots();
  if (roots.length === 0) return [];

  const metricByLabel = new Map(articles.map((a) => [a.label, a]));
  const usedLabels = new Set<string>();
  const root = roots.find((r) => r.code === row.hs1Code);
  const rootsToRender = root ? [root] : roots;
  const hierarchy: HierarchyTreeNode[] = rootsToRender.flatMap((b1) =>
    b1.bec2
      .map((b2) => ({
        id: `bec-2-${b1.code}-${b2.code}`,
        label: `BEC ${b2.code} — ${b2.desc}`,
        children: b2.bec3.flatMap((b3) => {
          const label = becLeafLabel(b3.code, b3.desc);
          const metric = metricByLabel.get(label);
          if (!metric) return [];
          usedLabels.add(label);
          return [
            {
              id: `bec-3-${b1.code}-${b2.code}-${b3.code}`,
              label,
              metric,
              children: [],
            },
          ];
        }),
      }))
      .filter((node) => node.children.length > 0),
  );

  const orphans = articles.filter((a) => !usedLabels.has(a.label));
  if (orphans.length > 0) {
    hierarchy.push({
      id: "bec-unmapped",
      label: "BEC — Unmapped lines",
      children: orphans.map((a) => ({
        id: `bec-orphan-${strSeed(a.label)}`,
        label: a.label,
        metric: a,
        children: [],
      })),
    });
  }

  return hierarchy;
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
    return flattenHierarchy(buildBecHierarchyFromNomenclature(row, articles));
  }
  return flattenHierarchy(buildSitcHierarchy(articles));
}

/** Leaf articles in hierarchy order (for dropdowns and counts). */
export function classificationArticleLeavesInOrder(row: CategoryAnalysisRow, kind: ClassificationKind): ArticleMetric[] {
  return classificationArticleDisplayRows(row, kind)
    .filter((r): r is Extract<ClassificationDisplayRow, { kind: "leaf" }> => r.kind === "leaf")
    .map((r) => r.metric);
}

/** Search across the main category row and all nested classification lines for the active kind. */
export function categoryAnalysisRowMatchesSearch(
  row: CategoryAnalysisRow,
  kind: ClassificationKind,
  q: string,
): boolean {
  const rawQuery = q.trim();
  if (!rawQuery) return true;
  const t = rawQuery.toLowerCase();
  const normalizeForSearch = (v: string) => v.toLowerCase().replace(/[\s\-_—–]+/g, "");
  const normalizedTerm = normalizeForSearch(rawQuery);
  const hay: string[] = [row.category, row.volume, row.risk, row.weight, row.mom, row.yoy, row.type];
  if (kind === "HS") {
    hay.push(`HS ${row.category}`);
  }
  const kinds: ClassificationKind[] = kind === "HS" ? ["HS", "BEC", "SITC"] : [kind, "HS", "BEC", "SITC"];
  const visitedKinds = new Set<ClassificationKind>();
  for (const currentKind of kinds) {
    if (visitedKinds.has(currentKind)) continue;
    visitedKinds.add(currentKind);
    for (const r of classificationArticleDisplayRows(row, currentKind)) {
      if (r.kind === "node") {
        hay.push(r.label);
        if (currentKind === "HS") {
          hay.push(`HS ${r.label}`);
        }
      } else {
        hay.push(r.metric.label, r.metric.risk, r.metric.weight, r.metric.mom, r.metric.yoy);
        if (currentKind === "HS") {
          hay.push(`HS ${r.metric.label}`);
        }
      }
    }
  }
  return hay.some((s) => {
    const lower = s.toLowerCase();
    if (lower.includes(t)) return true;
    if (!normalizedTerm) return false;
    return normalizeForSearch(s).includes(normalizedTerm);
  });
}

/** Two-digit SITC division key for matching partner lines. */
function sitcDivisionKeyFromLabel(label: string): string | null {
  const raw = parseSitcDivisionCode(label);
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length === 1 ? `0${digits}` : digits.slice(0, 2);
}

/**
 * Nomenclature leaves that belong with the selected article — same HS chapter, or matching BEC / SITC grouping.
 * Used for “Filter by Goods” so only real classification lines appear (no synthetic variants).
 */
export function goodsLeavesForArticleFilter(
  row: CategoryAnalysisRow,
  kind: ClassificationKind,
  articleLabel: string,
): ArticleMetric[] {
  const leaves = classificationArticleLeavesInOrder(row, kind);
  if (kind === "HS") {
    const ch = chapterKeyFromHsLabel(articleLabel);
    if (!ch) {
      const one = leaves.find((l) => l.label === articleLabel);
      return one ? [one] : [];
    }
    const sub = leaves.filter((l) => chapterKeyFromHsLabel(l.label) === ch);
    return sub.length > 0 ? sub : leaves.filter((l) => l.label === articleLabel);
  }
  if (kind === "BEC") {
    const digits = parseBecDigits(articleLabel);
    if (!digits) {
      const one = leaves.find((l) => l.label === articleLabel);
      return one ? [one] : [];
    }
    const subgroup = digits.length >= 2 ? digits.slice(0, 2) : digits;
    const sub = leaves.filter((l) => {
      const ld = parseBecDigits(l.label);
      return ld !== null && ld.startsWith(subgroup);
    });
    return sub.length > 0 ? sub : leaves.filter((l) => l.label === articleLabel);
  }
  const divKey = sitcDivisionKeyFromLabel(articleLabel);
  if (!divKey) {
    const one = leaves.find((l) => l.label === articleLabel);
    return one ? [one] : [];
  }
  const sub = leaves.filter((l) => sitcDivisionKeyFromLabel(l.label) === divKey);
  return sub.length > 0 ? sub : leaves.filter((l) => l.label === articleLabel);
}

/** HS chapter codes (HS01, HS02, …) with the first leaf label used for routing to the detail view. */
export function hsClassificationChapterOptions(row: CategoryAnalysisRow): { code: string; leafLabel: string }[] {
  const sec = HS_SECTIONS[row.sectionNumber - 1];
  if (!sec) return [];
  const leaves = row.hsArticles;
  return sec.chapterCodes.map((code) => {
    const upper = code.toUpperCase();
    const leaf = leaves.find((m) => chapterKeyFromHsLabel(m.label) === upper);
    return { code, leafLabel: leaf?.label ?? code };
  });
}

function shortBecCodeLabel(label: string): string {
  const m = /^BEC\s*(\d+[a-z]?)\b/i.exec(label.trim());
  return m ? `BEC ${m[1]}` : label.split(" — ")[0] ?? label;
}

function shortSitcCodeLabel(label: string): string {
  const m = /^SITC\s*(\d{1,3})\b/i.exec(label.trim());
  return m ? `SITC ${m[1]}` : label.split(" — ")[0] ?? label;
}

/** Short dropdown label for BEC/SITC classification lines (full label stays the route value). */
export function shortClassificationOptionLabel(kind: ClassificationKind, fullLabel: string): string {
  if (kind === "BEC") return shortBecCodeLabel(fullLabel);
  if (kind === "SITC") return shortSitcCodeLabel(fullLabel);
  return fullLabel;
}

export function parseClassificationParam(v: string | null): ClassificationKind {
  if (v === "BEC" || v === "SITC" || v === "HS") return v;
  return "HS";
}

export const ALL_CATEGORY_ANALYSIS_ROWS = buildAllCategoryAnalysisRows();
export const BEC_CATEGORY_ANALYSIS_ROWS = buildBecCategoryAnalysisRows();

export function categoryAnalysisRowsForClassification(kind: ClassificationKind): CategoryAnalysisRow[] {
  if (kind === "BEC") return BEC_CATEGORY_ANALYSIS_ROWS;
  return ALL_CATEGORY_ANALYSIS_ROWS;
}

export function findCategoryAnalysisRowByName(
  name: string,
  kind: ClassificationKind = "HS",
): CategoryAnalysisRow | undefined {
  return categoryAnalysisRowsForClassification(kind).find((r) => r.category === name);
}
