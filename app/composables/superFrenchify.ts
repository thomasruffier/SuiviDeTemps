import { frenchify } from "frenchify";
export function superFrenchify(str: any): string {
  if (str === null || str === "" || str === undefined) return "";
  else str = str.toString();
  return (
    frenchify(
      str.replaceAll("&rsquo;", "'").replaceAll("«", '"').replaceAll("»", '"')
    ) ?? ""
  );
}
