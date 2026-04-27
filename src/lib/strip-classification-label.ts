/** Strips a leading HS/BEC/SITC code prefix so UIs can show the category name only. */
export function stripClassificationCode(label: string): string {
  const t = label.trim();
  const sep = t.indexOf(" - ");
  if (sep < 0) return t;
  const head = t.slice(0, sep);
  if (!/^(HS|BEC|SITC)/i.test(head)) {
    return t;
  }
  return t.slice(sep + 3).trim();
}
