export interface OfficialPtmtFacetValues {
  subCategory: string | null;
  series: string | null;
  collection: string | null;
}

type PtmtOfficialFilters = Record<"series" | "collection" | "type", Record<string, readonly string[]>>;

export async function loadOfficialPtmtFacetLookup(): Promise<(sku: string) => OfficialPtmtFacetValues> {
  // The official filter audit owns this verified SKU taxonomy in the API
  // package. Runtime loading keeps the scripts package independently
  // typecheckable while allowing sync and backfill to use the same source.
  const moduleUrl = new URL("../../artifacts/api-server/src/lib/ptmtOfficialFilters.ts", import.meta.url);
  const { ptmtOfficialFilters } = await import(moduleUrl.href) as { ptmtOfficialFilters: PtmtOfficialFilters };

  return (sku) => {
    const valueFor = (kind: keyof PtmtOfficialFilters): string | null => {
      const match = Object.entries(ptmtOfficialFilters[kind]).find(([, codes]) => codes.includes(sku));
      return match?.[0] ?? null;
    };
    return {
      subCategory: valueFor("type"),
      series: valueFor("series"),
      collection: valueFor("collection"),
    };
  };
}