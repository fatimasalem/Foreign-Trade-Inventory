import raw from "./hs-nomenclature.json";

export type Hs8Leaf = { code: string; desc: string };
export type Hs6Node = { code: string; desc: string; leaves: Hs8Leaf[] };
export type Hs4Node = { code: string; desc: string; hs6: Hs6Node[] };
export type Hs2Node = { code: string; desc: string; hs4: Hs4Node[] };
export type HsSectionNomenclature = { hs1: string; hs1Desc: string; hs2: Hs2Node[] };

export type HsNomenclatureData = {
  version: number;
  source: string;
  sections: Record<string, HsSectionNomenclature>;
};

export const HS_NOMENCLATURE: HsNomenclatureData = raw as HsNomenclatureData;

export function getHsNomenclatureForSectionNumber(sectionNumber: number): HsSectionNomenclature | null {
  const s = HS_NOMENCLATURE.sections[String(sectionNumber)];
  return s ?? null;
}
