interface ProductNameInput {
  productName: string | null;
  category?: string | null;
  size?: string | null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function removeDanglingParenthesis(value: string): string {
  let result = value.trim();
  while ((result.match(/\(/g)?.length ?? 0) > (result.match(/\)/g)?.length ?? 0)) {
    result = result.slice(0, result.lastIndexOf("(")).trim();
  }
  return result;
}

/**
 * Creates a concise storefront name from the source catalogue name.
 *
 * Source categories are useful in specifications and navigation, but repeating
 * them after every product name makes cards and detail headings needlessly long.
 */
export function buildShortProductName({ productName, category, size }: ProductNameInput): string | null {
  const base = productName ? normalize(productName) : "";
  if (!base) return null;

  const categorySuffix = category ? `(?:${escapeRegExp(normalize(category))})` : "";
  const genericCollectionSuffix = "(?:Faucet Collection|PTMT Colour Variant|Sanitaryware Collection|Water Tank)";
  const suffix = categorySuffix ? `(?:${categorySuffix}|${genericCollectionSuffix})` : genericCollectionSuffix;

  let name = base
    .replace(new RegExp(`\\s*-\\s*${suffix}(?:\\s*\\([^)]*\\))?\\s*$`, "i"), "")
    .trim();

  name = removeDanglingParenthesis(name);

  const normalizedSize = size ? normalize(size) : "";
  if (normalizedSize && !compact(name).includes(compact(normalizedSize))) {
    name = `${name} (${normalizedSize})`;
  }

  return normalize(name);
}