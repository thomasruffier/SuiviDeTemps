export function remplacerBalisesPParBr(str: any): string {
  if (str === null || str === "" || str === undefined) return "";
  else str = str.toString();

  const nbParags = (str.match(/<\/p>/gi) || []).length;

  if (nbParags <= 1) {
    return str.replace(/<\/?p>/gi, "");
  }

  return str.replace(/<p>/gi, "").replace(/<\/p>/gi, "<br>");
}
