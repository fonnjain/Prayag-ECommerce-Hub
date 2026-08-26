export const ptmtOfficialFilters = {
  series: {
    "Delta Series": ["123-D", "129-D", "130-D", "132-D", "1322-D", "133-D", "134-D", "135-D", "1375-D", "144-D", "145-D", "147-D"],
    "Helix Series": ["121-H", "123-H", "124-FH", "127-H", "129-H", "130-H", "131-H", "1311-H", "132-H", "1322-HN", "133-H", "134-H", "1375-H", "141-H", "142-H", "143-H", "144-H", "145-H", "146-H", "146-HB", "147-H", "147-HQ", "148-H", "148-HB", "1491-H", "150-H"],
    "Lagoona Series": ["121-L", "123-L", "124-L", "129-L", "130-L", "131-L", "132-L", "133-L", "1375-L", "144-L", "145-L", "147-L", "147-LQ", "400-L"],
    "Ovian Series": ["121-R", "123-R", "124-R", "129-R", "130-R", "130-RN", "133-R", "134-R", "135-R", "1375-R", "144-R", "145-R", "147-R", "147-RQ", "400-R"],
    "Quadra Series": ["123-Q", "129-Q", "130-Q", "132-Q", "133-Q", "134-Q", "135-Q", "1375-Q", "144-Q", "145-Q"],
    "Standard Series": ["121", "123", "123-N", "124", "124-F", "127", "129", "130", "131", "131-N", "132", "132-T", "133-NEW", "135", "1375-S", "141-N", "142", "143", "145", "146", "146-B", "147", "147-B", "147-SQ", "148", "148-B", "149-N", "186", "1861", "400-Q"],
    "Ultra Series": ["123-U", "124-U", "129-U", "130-U", "132-U", "133-U", "134-U", "135-U", "144-U", "145-U", "1375-U"],
  },
  collection: {
    "Marbel Series": ["121-L", "121-R", "123-D", "123-L", "123-R", "123-U", "124-L", "124-U", "129-D", "129-L", "129-Q", "129-U", "130-D", "130-Q", "130-R", "130-RN", "130-U", "132-D", "132-L", "132-Q", "132-R", "132-U", "1322-D", "133-D", "133-L", "133-Q", "133-R", "134-D", "134-Q", "134-R", "134-U", "135-D", "135-Q", "135-R", "135-U", "1375-L", "1375-Q", "1375-R", "1375-U", "144-D", "144-L", "144-Q", "144-R", "144-U", "145-L", "145-Q", "145-R", "145-U", "147-D", "147-L", "147-LQ", "147-R", "147-RQ", "400-L", "400-Q", "400-R"],
    "Premia": ["121", "123", "123-F", "123-HN", "123-N", "124", "124-F", "124-FH", "124-H", "127", "127-H", "129", "129-H", "130", "130-H", "131", "131-H", "131-N", "1311-H", "132-H", "1322-HN", "133-H", "134-H", "135", "1375-H", "141", "141-H", "141-N", "142", "142-H", "143", "143-H", "144", "144-H", "145", "145-H", "146", "146-B", "146-H", "146-HB", "147-B", "147-H", "147-HQ", "148", "148-B", "148-H", "148-HB", "149-N", "1491-H", "150", "150-H", "186", "1861"],
  },
  type: {
    "Angle Cock": ["144", "144-D", "144-Q", "144-R", "144-U", "145", "145-D", "145-H", "145-Q", "145-U"],
    "Basin Mixer": ["150", "150-H", "400-Q"],
    "Bib Cock": ["121", "121-H", "121-R", "123", "123-D", "123-F", "123-FH", "123-H", "123-HN", "123-Q", "123-R", "123-U", "124", "124-F", "124-FH", "124-H", "124-R", "124-U", "127", "127-H", "129", "129-D", "129-H", "129-Q", "129-R", "129-U"],
    "Bottle Trap": ["105"],
    "Grating Doom Waste Hole": ["113"],
    "Hand Shower": ["183"],
    "Pillar Cock": ["121-L", "123-L", "124-L", "129-L", "130", "130-D", "130-H", "130-L", "130-R", "130-U", "131", "131-H", "131-L", "131-N", "1311-H", "132-L", "133-L", "1375-R", "144-L", "147", "147-D", "147-HQ", "147-L", "147-LQ", "147-RQ", "147-SQ", "400-R"],
    "Shower": ["181"],
    "Sink Cock": ["132", "132-D", "132-H", "132-Q", "132-R", "132-T", "132-U", "1322-D", "1322-HN", "133-D", "133-H", "133-NEW", "133-Q", "133-R", "133-U"],
    "Sink Mixer": ["134", "134-D", "134-H", "134-Q", "134-R", "134-U"],
    "Stop Cock": ["141", "141-H", "141-N", "142-H", "143", "143-H", "144-H", "146", "146-B", "146-H", "146-HB", "147-B", "147-H", "148", "148-B", "148-H", "148-HB"],
    "Toilet Paper Holder": ["197"],
    "Tooth Brush Holder": ["198"],
    "Towel Rack": ["552"],
    "Towel Rail": ["199"],
    "Towel Ring": ["196"],
    "Urinal Fish 32mm": ["1861"],
    "Urinal Spreader 15mm": ["186"],
    "Wall Mixer": ["135", "135-D", "135-Q", "135-R", "135-U", "1375-D", "1375-H", "1375-L", "1375-Q", "1375-U"],
    "Washing Machine Tap with Flange": ["149-N", "1491-H"],
    "Waste Coupling": ["101"],
  },
} as const;

export type PtmtFilterKind = keyof typeof ptmtOfficialFilters;

export interface PtmtOfficialInventoryException {
  code: string;
  destinationCategory: string;
  reason: string;
}

// This official source item is intentionally published under Kitchen Sinks,
// rather than exposed through the PTMT storefront filters.
export const ptmtOfficialInventoryExceptions: readonly PtmtOfficialInventoryException[] = [
  {
    code: "119",
    destinationCategory: "kitchen-sinks",
    reason: "Cockroach Trap with Water Seal is intentionally routed to Kitchen Sinks.",
  },
];

export function selectedPtmtFilterSkus(kind: PtmtFilterKind, rawValue?: string): string[] | undefined {
  if (!rawValue) return undefined;

  const filterGroup = ptmtOfficialFilters[kind] as Record<string, readonly string[]>;
  const selected = rawValue
    .split(",")
    .map((label) => label.trim())
    .filter((label) => Object.hasOwn(filterGroup, label));

  return [...new Set(selected.flatMap((label) => filterGroup[label]))];
}

export const PTMT_OFFICIAL_FILTER_URL = "https://prayagindia.com/ptmt-filter";

function filterOptionBlocks(html: string): Array<{ kind: PtmtFilterKind; html: string }> {
  const blocks: Array<{ kind: PtmtFilterKind; html: string }> = [];
  const pattern = /<fieldset\b[^>]*\bid\s*=\s*["']edit-field-ptmt-(series|collection|type)-target-id[^"']*["'][^>]*>[\s\S]*?<\/fieldset>/gi;
  for (const match of html.matchAll(pattern)) {
    const kind = match[1]?.toLowerCase() as PtmtFilterKind | undefined;
    if (kind && match[0]) blocks.push({ kind, html: match[0] });
  }
  return blocks;
}

function approvedPtmtCodes(): Set<string> {
  return new Set(
    Object.values(ptmtOfficialFilters)
      .flatMap((group) => Object.values(group))
      .flat(),
  );
}

function stripHtml(value: string): string {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function approvedPtmtMemberships(): Map<string, PtmtFilterMembership> {
  const memberships = new Map<string, PtmtFilterMembership>();
  for (const [kind, group] of Object.entries(ptmtOfficialFilters) as Array<
    [PtmtFilterKind, Record<string, readonly string[]>]
  >) {
    for (const [filterLabel, codes] of Object.entries(group)) {
      for (const code of codes) {
        memberships.set(membershipKey(kind, filterLabel, code), {
          kind,
          filterLabel,
          code,
          sourceUrls: [],
        });
      }
    }
  }
  return memberships;
}

export interface PtmtFilterMembership {
  kind: PtmtFilterKind;
  filterLabel: string;
  code: string;
  sourceUrls: string[];
}

export function parseOfficialPtmtFilterPage(
  html: string,
  { kind, filterLabel, pageUrl }: { kind: PtmtFilterKind; filterLabel: string; pageUrl: string },
): PtmtOfficialSourceCard[] {
  return cardBlocks(html).map(({ href, html: cardHtml }) => {
    const title = cardHtml.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1] ?? "";
    const imageAltTexts = [...cardHtml.matchAll(/<img\b[^>]*>/gi)]
      .map((match) => htmlAttribute(match[0], "alt"))
      .filter((alt): alt is string => Boolean(alt));
    const titleCodes = codeCandidatesFromText(title);
    const imageAltCodes = [...new Set(imageAltTexts.flatMap(codeCandidatesFromText))];
    // The display title is the primary exact code source. Image alt text is
    // only a fallback for code-less cards (such as Shower → 181), because
    // ordinary image assets can carry a base-code or derivative filename that
    // is not the displayed product's exact SKU.
    const codeCandidates = titleCodes.length > 0 ? titleCodes : imageAltCodes;

    return {
      kind,
      filterLabel,
      sourceUrl: new URL(decodeHtml(href), pageUrl).toString(),
      displayName: stripHtml(title),
      codeCandidates,
    };
  });
}

function membershipKey(kind: PtmtFilterKind, filterLabel: string, code: string): string {
  return `${kind}\u0000${canonicalFilterLabel(filterLabel)}\u0000${code}`;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

export interface PtmtOfficialSourceCard {
  kind: PtmtFilterKind;
  filterLabel: string;
  sourceUrl: string;
  displayName: string;
  codeCandidates: string[];
}

export interface PtmtAuditCodeReference {
  code: string;
  filters: Array<{ kind: PtmtFilterKind; label: string }>;
  sourceUrls: string[];
}

export interface PtmtAcknowledgedSourceException extends PtmtOfficialInventoryException {
  filters: Array<{ kind: PtmtFilterKind; label: string }>;
  sourceUrls: string[];
}

function cardBlocks(html: string): Array<{ href: string; html: string }> {
  const cards: Array<{ href: string; html: string }> = [];
  const cardPattern = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>\s*<div\b[^>]*class\s*=\s*["'][^"']*\bproduct_p_box\b[^"']*["'][\s\S]*?<\/a>/gi;
  for (const match of html.matchAll(cardPattern)) {
    if (match[1] && match[0]) cards.push({ href: match[1], html: match[0] });
  }
  return cards;
}

export interface PtmtOfficialFilterOption {
  kind: PtmtFilterKind;
  label: string;
  value: string;
}

function pageUrl(baseUrl: string, option: PtmtOfficialFilterOption, page?: number): string {
  const url = new URL(baseUrl);
  url.search = "";
  url.searchParams.set(`field_ptmt_${option.kind}_target_id[${option.value}]`, option.value);
  if (page !== undefined) url.searchParams.set("page", String(page));
  return url.toString();
}

export async function crawlOfficialPtmtFilterInventory({
  baseUrl = PTMT_OFFICIAL_FILTER_URL,
  fetchImpl = fetch as unknown as FetchPage,
}: {
  baseUrl?: string;
  fetchImpl?: FetchPage;
} = {}): Promise<PtmtOfficialSourceInventory> {
  const fetchPage = async (url: string): Promise<string> => {
    const response = await fetchImpl(url, {
      headers: { "User-Agent": "PRAYAG catalogue PTMT audit/1.0" },
    });
    if (!response.ok) throw new Error(`Official PTMT filter returned ${response.status}: ${url}`);
    return response.text();
  };

  const landingHtml = await fetchPage(baseUrl);
  const options = discoverOfficialPtmtFilterOptions(landingHtml);
  if (options.length === 0) throw new Error("Official PTMT filter page exposed no filter options");

  const cards: PtmtOfficialSourceCard[] = [];
  let pagesFetched = 1;
  for (const option of options) {
    const firstUrl = pageUrl(baseUrl, option);
    const firstHtml = await fetchPage(firstUrl);
    pagesFetched++;
    cards.push(...parseOfficialPtmtFilterPage(firstHtml, {
      kind: option.kind,
      filterLabel: option.label,
      pageUrl: firstUrl,
    }));

    for (let page = 1; page <= maxPageNumber(firstHtml, firstUrl); page++) {
      const nextUrl = pageUrl(baseUrl, option, page);
      const nextHtml = await fetchPage(nextUrl);
      pagesFetched++;
      cards.push(...parseOfficialPtmtFilterPage(nextHtml, {
        kind: option.kind,
        filterLabel: option.label,
        pageUrl: nextUrl,
      }));
    }
  }

  return { cards, pagesFetched, filtersCrawled: options.length };
}

function canonicalFilterLabel(filterLabel: string): string {
  return filterLabel.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function maxPageNumber(html: string, currentPageUrl: string): number {
  let max = 0;
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    const href = decodeHtml(match[1] ?? "");
    const page = new URL(href, currentPageUrl).searchParams.get("page");
    if (page && /^\d+$/.test(page)) {
      max = Math.max(max, Number(page));
    }
  }
  return max;
}

export function discoverOfficialPtmtFilterOptions(html: string): PtmtOfficialFilterOption[] {
  const options: PtmtOfficialFilterOption[] = [];
  for (const { kind, html: block } of filterOptionBlocks(html)) {
    const labels = [...block.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)].map((match) => ({
      forValue: htmlAttribute(match[0], "for"),
      label: stripHtml(match[1] ?? ""),
    }));

    for (const inputMatch of block.matchAll(/<input\b[^>]*>/gi)) {
      const input = inputMatch[0];
      const name = htmlAttribute(input, "name");
      const value = htmlAttribute(input, "value");
      const id = htmlAttribute(input, "id");
      if (!name || !value || !name.startsWith(`field_ptmt_${kind}_target_id[`)) continue;
      const label = labels.find((candidate) => candidate.forValue === id)?.label
        ?? labels.find((candidate) => candidate.forValue?.includes(`-${value}`))?.label;
      if (!label) continue;
      options.push({ kind, label, value });
    }
  }

  return [...new Map(options.map((option) => [
    `${option.kind}:${option.label}:${option.value}`,
    option,
  ])).values()];
}

function htmlAttribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match?.[1] ? decodeHtml(match[1]) : undefined;
}

function codeCandidatesFromText(value: string): string[] {
  // Product codes in the old official catalogue are numeric codes with optional
  // hyphenated variant suffixes, such as 123-D, 133-NEW, and 1491-H.
  return [...new Set(
    (stripHtml(value).match(/\b\d{3,4}(?:-[A-Z0-9]+)*\b/gi) ?? [])
      // Image derivatives such as "147-D-2" are not exact product codes.
      // Reject the whole token so the regexp cannot fall back to "147".
      .filter((code) => !/-\d/.test(code))
      .map((code) => code.toUpperCase()),
  )];
}

type FetchPage = (input: string, init?: { headers?: Record<string, string> }) => Promise<FetchResponse>;

export interface PtmtOfficialSourceInventory {
  cards: PtmtOfficialSourceCard[];
  pagesFetched: number;
  filtersCrawled: number;
}

export interface PtmtAmbiguousCodeSource extends PtmtOfficialSourceCard {
  reason: "missing-code" | "multiple-codes";
}

export interface PtmtOfficialAuditReport {
  additions: string[];
  removals: string[];
  filterAdditions: PtmtFilterMembership[];
  filterRemovals: PtmtFilterMembership[];
  acknowledgedExceptions: PtmtAcknowledgedSourceException[];
  missingLocalCatalogueRecords: string[];
  ambiguousCodeSources: PtmtAmbiguousCodeSource[];
  sourceReferences: PtmtAuditCodeReference[];
  sourceCodeCount: number;
  approvedCodeCount: number;
  localCatalogueCodeCount: number;
}

interface FetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

function compareMembership(a: PtmtFilterMembership, b: PtmtFilterMembership): number {
  return a.kind.localeCompare(b.kind)
    || a.filterLabel.localeCompare(b.filterLabel)
    || a.code.localeCompare(b.code);
}

export function comparePtmtOfficialInventory(
  inventory: PtmtOfficialSourceInventory | PtmtOfficialSourceCard[],
  localCatalogueSkus: Iterable<string>,
): PtmtOfficialAuditReport {
  const cards = Array.isArray(inventory) ? inventory : inventory.cards;
  const ambiguousCodeSources = cards
    .filter((card) => card.codeCandidates.length !== 1)
    .map((card) => ({
      ...card,
      reason: card.codeCandidates.length === 0 ? "missing-code" as const : "multiple-codes" as const,
    }));
  const sourceCards = cards.filter((card) => card.codeCandidates.length === 1);
  const sourceCodes = new Set(sourceCards.map((card) => card.codeCandidates[0]));
  const approvedCodes = approvedPtmtCodes();
  const localCodes = new Set([...localCatalogueSkus].map((sku) => sku.trim()).filter(Boolean));
  const exceptionsByCode = new Map(ptmtOfficialInventoryExceptions.map((exception) => [exception.code, exception]));
  const references = new Map<string, PtmtAuditCodeReference>();
  const sourceMemberships = new Map<string, PtmtFilterMembership>();

  for (const card of sourceCards) {
    const code = card.codeCandidates[0];
    const reference = references.get(code) ?? { code, filters: [], sourceUrls: [] };
    if (!reference.filters.some((filter) => filter.kind === card.kind && filter.label === card.filterLabel)) {
      reference.filters.push({ kind: card.kind, label: card.filterLabel });
    }
    if (!reference.sourceUrls.includes(card.sourceUrl)) reference.sourceUrls.push(card.sourceUrl);
    references.set(code, reference);

    const key = membershipKey(card.kind, card.filterLabel, code);
    const membership = sourceMemberships.get(key) ?? {
      kind: card.kind,
      filterLabel: card.filterLabel,
      code,
      sourceUrls: [],
    };
    if (!membership.sourceUrls.includes(card.sourceUrl)) membership.sourceUrls.push(card.sourceUrl);
    sourceMemberships.set(key, membership);
  }
  const approvedMemberships = approvedPtmtMemberships();
  const acknowledgedExceptions = [...exceptionsByCode.values()]
    .filter((exception) => sourceCodes.has(exception.code))
    .map((exception) => {
      const reference = references.get(exception.code);
      return {
        ...exception,
        filters: reference?.filters ?? [],
        sourceUrls: reference?.sourceUrls ?? [],
      };
    });
  const actionableSourceCodes = [...sourceCodes].filter((code) => !exceptionsByCode.has(code));

  return {
    additions: actionableSourceCodes.filter((code) => !approvedCodes.has(code)).sort(),
    removals: [...approvedCodes].filter((code) => !sourceCodes.has(code)).sort(),
    filterAdditions: [...sourceMemberships.entries()]
      .filter(([key, membership]) => !approvedMemberships.has(key) && !exceptionsByCode.has(membership.code))
      .map(([, membership]) => membership)
      .sort(compareMembership),
    filterRemovals: [...approvedMemberships.entries()]
      .filter(([key]) => !sourceMemberships.has(key))
      .map(([, membership]) => membership)
      .sort(compareMembership),
    acknowledgedExceptions,
    missingLocalCatalogueRecords: actionableSourceCodes.filter((code) => !localCodes.has(code)).sort(),
    ambiguousCodeSources,
    sourceReferences: [...references.values()].sort((a, b) => a.code.localeCompare(b.code)),
    sourceCodeCount: sourceCodes.size,
    approvedCodeCount: approvedCodes.size,
    localCatalogueCodeCount: localCodes.size,
  };
}
