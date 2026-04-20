/** HS nomenclature sections (WCO) — chapter lists for reference UI. */

function hsChapterCodes(from: number, to: number): readonly string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => {
    const n = from + i;
    return `HS${String(n).padStart(2, "0")}`;
  });
}

export type HsSection = {
  readonly number: number;
  readonly title: string;
  /** All HS chapter codes in this section, e.g. HS01, HS02, … */
  readonly chapterCodes: readonly string[];
};

export const HS_SECTIONS: readonly HsSection[] = [
  { number: 1, title: "Live animals; animal products", chapterCodes: hsChapterCodes(1, 5) },
  { number: 2, title: "Vegetable products", chapterCodes: hsChapterCodes(6, 14) },
  {
    number: 3,
    title: "Animal or vegetable fats and oils; prepared edible fats",
    chapterCodes: hsChapterCodes(15, 15),
  },
  {
    number: 4,
    title: "Prepared foodstuffs; beverages, spirits, and tobacco",
    chapterCodes: hsChapterCodes(16, 24),
  },
  { number: 5, title: "Mineral products", chapterCodes: hsChapterCodes(25, 27) },
  {
    number: 6,
    title: "Products of the chemical or allied industries",
    chapterCodes: hsChapterCodes(28, 38),
  },
  {
    number: 7,
    title: "Plastics and articles thereof; rubber and articles thereof",
    chapterCodes: hsChapterCodes(39, 40),
  },
  {
    number: 8,
    title: "Raw hides and skins, leather, furskins, and articles",
    chapterCodes: hsChapterCodes(41, 43),
  },
  {
    number: 9,
    title: "Wood and articles of wood; cork; straw and basketware",
    chapterCodes: hsChapterCodes(44, 46),
  },
  {
    number: 10,
    title: "Pulp of wood; paper and paperboard; printed matter",
    chapterCodes: hsChapterCodes(47, 49),
  },
  { number: 11, title: "Textiles and textile articles", chapterCodes: hsChapterCodes(50, 63) },
  {
    number: 12,
    title: "Footwear, headgear, umbrellas, and similar articles",
    chapterCodes: hsChapterCodes(64, 67),
  },
  {
    number: 13,
    title: "Articles of stone, plaster, cement; ceramics; glass",
    chapterCodes: hsChapterCodes(68, 70),
  },
  {
    number: 14,
    title: "Natural or cultured pearls, precious stones, metals",
    chapterCodes: hsChapterCodes(71, 71),
  },
  { number: 15, title: "Base metals and articles of base metal", chapterCodes: hsChapterCodes(72, 83) },
  {
    number: 16,
    title: "Machinery and mechanical appliances; electrical equipment",
    chapterCodes: hsChapterCodes(84, 85),
  },
  {
    number: 17,
    title: "Vehicles, aircraft, vessels, and transport equipment",
    chapterCodes: hsChapterCodes(86, 89),
  },
  {
    number: 18,
    title: "Optical, photographic, medical instruments; clocks; musical instruments",
    chapterCodes: hsChapterCodes(90, 92),
  },
  { number: 19, title: "Arms and ammunition", chapterCodes: hsChapterCodes(93, 93) },
  {
    number: 20,
    title: "Miscellaneous manufactured articles",
    chapterCodes: hsChapterCodes(94, 96),
  },
  {
    number: 21,
    title: "Works of art, collectors' pieces, and antiques",
    chapterCodes: hsChapterCodes(97, 97),
  },
];

export function parseHsChapterCode(hs1Label: string): number | null {
  const m = /^HS(\d{1,2})\b/i.exec(hs1Label.trim());
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (n < 1 || n > 99) return null;
  return n;
}

export function getHsSectionForChapter(chapter: number): HsSection | null {
  const c = chapter;
  if (c >= 1 && c <= 5) return HS_SECTIONS[0];
  if (c >= 6 && c <= 14) return HS_SECTIONS[1];
  if (c === 15) return HS_SECTIONS[2];
  if (c >= 16 && c <= 24) return HS_SECTIONS[3];
  if (c >= 25 && c <= 27) return HS_SECTIONS[4];
  if (c >= 28 && c <= 38) return HS_SECTIONS[5];
  if (c >= 39 && c <= 40) return HS_SECTIONS[6];
  if (c >= 41 && c <= 43) return HS_SECTIONS[7];
  if (c >= 44 && c <= 46) return HS_SECTIONS[8];
  if (c >= 47 && c <= 49) return HS_SECTIONS[9];
  if (c >= 50 && c <= 63) return HS_SECTIONS[10];
  if (c >= 64 && c <= 67) return HS_SECTIONS[11];
  if (c >= 68 && c <= 70) return HS_SECTIONS[12];
  if (c === 71) return HS_SECTIONS[13];
  if (c >= 72 && c <= 83) return HS_SECTIONS[14];
  if (c >= 84 && c <= 85) return HS_SECTIONS[15];
  if (c >= 86 && c <= 89) return HS_SECTIONS[16];
  if (c >= 90 && c <= 92) return HS_SECTIONS[17];
  if (c === 93) return HS_SECTIONS[18];
  if (c >= 94 && c <= 96) return HS_SECTIONS[19];
  if (c === 97) return HS_SECTIONS[20];
  return null;
}
