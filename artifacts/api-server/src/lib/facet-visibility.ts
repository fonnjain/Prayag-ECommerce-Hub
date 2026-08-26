const MIN_DYNAMIC_FACET_COVERAGE = 0.1;
const OFFICIAL_PTMT_FACET_KEYS = new Set(["subCategory", "series", "collection"]);

export function shouldReturnFacetGroup(input: {
  category: string;
  key: string;
  valueCount: number;
  populatedProductCount: number;
  totalProducts: number;
}): boolean {
  if (input.valueCount < 2) return false;
  const isOfficialPtmtGroup = input.category === "ptmt-faucets"
    && OFFICIAL_PTMT_FACET_KEYS.has(input.key);
  return isOfficialPtmtGroup || (
    input.totalProducts > 0
    && input.populatedProductCount / input.totalProducts >= MIN_DYNAMIC_FACET_COVERAGE
  );
}