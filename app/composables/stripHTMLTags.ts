export function stripHtmlTags(str: string): string {
  if (str === null || str === "" || str === undefined) return "";
  else str = str.toString();
  return str.replace(/<[^>]*>?/gm, "") ?? "";
}
