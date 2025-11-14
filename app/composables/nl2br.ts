export function nl2br(str: any): string {
  if (str === null || str === "" || str === undefined) return "";
  else str = str.toString();
  return str.replace(/\n/g, "<br>") ?? "";
}
