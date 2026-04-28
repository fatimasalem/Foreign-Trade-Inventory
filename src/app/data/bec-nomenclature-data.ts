import raw from "./bec-nomenclature.json";

export type Bec3Leaf = { code: string; desc: string };
export type Bec2Node = { code: string; desc: string; bec3: Bec3Leaf[] };
export type Bec1Node = { code: string; desc: string; bec2: Bec2Node[] };

export type BecNomenclatureData = {
  version: number;
  source: string;
  roots: Bec1Node[];
};

export const BEC_NOMENCLATURE: BecNomenclatureData = raw as BecNomenclatureData;

export function getBecNomenclatureRoots(): Bec1Node[] {
  return BEC_NOMENCLATURE.roots ?? [];
}

export function getBecNomenclatureLeaves(): Bec3Leaf[] {
  const out: Bec3Leaf[] = [];
  for (const b1 of getBecNomenclatureRoots()) {
    for (const b2 of b1.bec2) {
      for (const b3 of b2.bec3) {
        out.push(b3);
      }
    }
  }
  return out;
}
