export interface ProductFacetValues {
  subCategory: string | null;
  sizeLabel: string | null;
  series: string | null;
  collection: string | null;
}

function normaliseValue(value: string | null | undefined): string | null {
  const normalised = value?.replace(/\s+/g, " ").trim();
  return normalised || null;
}

const knownSeries = [
  "Delta Series",
  "Helix Series",
  "Lagoona Series",
  "Ovian Series",
  "Quadra Series",
  "Standard Series",
  "Ultra Series",
] as const;

const knownCollections = ["Marbel Series", "Premia"] as const;

function includesKnownLabel(name: string, label: string): boolean {
  const stem = label.replace(/\s+Series$/i, "");
  return new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s+Series)?\\b`, "i").test(name);
}

/**
 * Extract only explicitly known Prayag series/collection labels from a product
 * name. Unknown marketing words intentionally stay null rather than becoming a
 * guessed catalogue facet.
 */
export function knownNameFacets(name: string | null | undefined): Pick<ProductFacetValues, "series" | "collection"> {
  const productName = normaliseValue(name) ?? "";
  return {
    series: knownSeries.find((label) => includesKnownLabel(productName, label)) ?? null,
    collection: knownCollections.find((label) => includesKnownLabel(productName, label)) ?? null,
  };
}

export function sourceProductFacets(input: {
  category?: string | null;
  size?: string | null;
  productName?: string | null;
  deriveKnownPtmtNameFacets?: boolean;
}): ProductFacetValues {
  return {
    subCategory: normaliseValue(input.category),
    sizeLabel: normaliseValue(input.size),
    // These labels belong to the official PTMT taxonomy. A word such as
    // "Ultra" or "Standard" in another division's product name is not
    // evidence that product belongs to a PTMT series.
    ...(input.deriveKnownPtmtNameFacets
      ? knownNameFacets(input.productName)
      : { series: null, collection: null }),
  };
}