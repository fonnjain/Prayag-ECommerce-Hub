import assert from "node:assert/strict";
import test from "node:test";
import {
  comparePtmtOfficialInventory,
  crawlOfficialPtmtFilterInventory,
  discoverOfficialPtmtFilterOptions,
  parseOfficialPtmtFilterPage,
  ptmtOfficialFilters,
  selectedPtmtFilterSkus,
} from "../src/lib/ptmtOfficialFilters";

function allOfficialSkus() {
  return new Set(
    Object.values(ptmtOfficialFilters)
      .flatMap((group) => Object.values(group))
      .flat(),
  );
}

test("official PTMT filter inventory retains every paginated old-website code", () => {
  const skus = allOfficialSkus();

  // The official PTMT filters were crawled page by page. The one official
  // Cockroach Trap family is intentionally routed to Kitchen Sinks.
  assert.equal(skus.size, 137);
  for (const sku of ["147-RQ", "1375-U", "181"]) {
    assert.ok(skus.has(sku), `missing official PTMT item code ${sku}`);
  }
  assert.ok(!Object.hasOwn(ptmtOfficialFilters.type, "Cockroach Trap with Water Seal"));
});

test("old-website PTMT mappings preserve exact source filter membership", () => {
  assert.deepEqual(selectedPtmtFilterSkus("series", "Ovian Series"), [
    "121-R", "123-R", "124-R", "129-R", "130-R", "130-RN", "133-R",
    "134-R", "135-R", "1375-R", "144-R", "145-R", "147-R", "147-RQ", "400-R",
  ]);
  assert.deepEqual(selectedPtmtFilterSkus("series", "Ultra Series"), [
    "123-U", "124-U", "129-U", "130-U", "132-U", "133-U", "134-U",
    "135-U", "144-U", "145-U", "1375-U",
  ]);
  assert.deepEqual(selectedPtmtFilterSkus("type", "Shower"), ["181"]);
  assert.deepEqual(selectedPtmtFilterSkus("type", "Pillar Cock"), [
    "121-L", "123-L", "124-L", "129-L", "130", "130-D", "130-H", "130-L",
    "130-R", "130-U", "131", "131-H", "131-L", "131-N", "1311-H", "132-L",
    "133-L", "1375-R", "144-L", "147", "147-D", "147-HQ", "147-L", "147-LQ",
    "147-RQ", "147-SQ", "400-R",
  ]);
});

test("official filter parser discovers options and exact card codes without using URL slugs", () => {
  const landingPage = `
    <fieldset id="edit-field-ptmt-series-target-id--5--wrapper">
      <input id="edit-field-ptmt-series-target-id-77--5"
        name="field_ptmt_series_target_id[77]" value="77">
      <label for="edit-field-ptmt-series-target-id-77--5">Delta Series</label>
    </fieldset>
    <fieldset id="edit-field-ptmt-type-target-id--5--wrapper">
      <input id="edit-field-ptmt-type-target-id-86--5"
        name="field_ptmt_type_target_id[86]" value="86">
      <label for="edit-field-ptmt-type-target-id-86--5">Pillar Cock</label>
    </fieldset>`;
  assert.deepEqual(discoverOfficialPtmtFilterOptions(landingPage), [
    { kind: "series", label: "Delta Series", value: "77" },
    { kind: "type", label: "Pillar Cock", value: "86" },
  ]);

  const cards = parseOfficialPtmtFilterPage(`
    <a href="/123-d-bib-cock">
      <div class="product_p_box">
        <img alt="123-D-2">
        <h6>123-D Bib Cock</h6>
      </div>
    </a>
    <a href="/unhelpful-slug">
      <div class="product_p_box">
        <img alt="181">
        <h6>Shower</h6>
      </div>
    </a>`, {
      kind: "series",
      filterLabel: "Delta Series",
      pageUrl: "https://prayagindia.com/ptmt-filter?field_ptmt_series_target_id%5B77%5D=77",
    });
  assert.deepEqual(cards.map(({ sourceUrl, displayName, codeCandidates }) => ({
    sourceUrl,
    displayName,
    codeCandidates,
  })), [
    {
      sourceUrl: "https://prayagindia.com/123-d-bib-cock",
      displayName: "123-D Bib Cock",
      codeCandidates: ["123-D"],
    },
    {
      sourceUrl: "https://prayagindia.com/unhelpful-slug",
      displayName: "Shower",
      codeCandidates: ["181"],
    },
  ]);

  const codeLessDerivative = parseOfficialPtmtFilterPage(`
    <a href="/asset-name-only">
      <div class="product_p_box"><img alt="123-D-2"><h6>Shower</h6></div>
    </a>`, {
      kind: "type",
      filterLabel: "Shower",
      pageUrl: "https://prayagindia.com/ptmt-filter",
    });
  assert.deepEqual(codeLessDerivative[0]?.codeCandidates, []);
});

test("official inventory comparison reports review-only changes and local catalogue gaps", () => {
  const inventory = [
    {
      kind: "series" as const,
      filterLabel: "Delta Series",
      sourceUrl: "https://prayagindia.com/123-d-bib-cock",
      displayName: "123-D Bib Cock",
      codeCandidates: ["123-D"],
    },
    {
      kind: "type" as const,
      filterLabel: "New Type",
      sourceUrl: "https://prayagindia.com/new-999",
      displayName: "New official product",
      codeCandidates: ["999"],
    },
    {
      kind: "type" as const,
      filterLabel: "Cockroach Trap with Water Seal",
      sourceUrl: "https://prayagindia.com/cockroach-trap",
      displayName: "119 Cockroach Trap with Water Seal",
      codeCandidates: ["119"],
    },
    {
      kind: "type" as const,
      filterLabel: "Unknown Type",
      sourceUrl: "https://prayagindia.com/ambiguous",
      displayName: "Ambiguous product",
      codeCandidates: ["123", "999"],
    },
    {
      kind: "type" as const,
      filterLabel: "Unknown Type",
      sourceUrl: "https://prayagindia.com/no-code",
      displayName: "Product without a code",
      codeCandidates: [],
    },
  ];
  const report = comparePtmtOfficialInventory(inventory, ["123-D"]);

  assert.deepEqual(report.additions, ["999"]);
  assert.deepEqual(report.missingLocalCatalogueRecords, ["999"]);
  assert.deepEqual(report.acknowledgedExceptions, [{
    code: "119",
    destinationCategory: "kitchen-sinks",
    reason: "Cockroach Trap with Water Seal is intentionally routed to Kitchen Sinks.",
    filters: [{ kind: "type", label: "Cockroach Trap with Water Seal" }],
    sourceUrls: ["https://prayagindia.com/cockroach-trap"],
  }]);
  assert.deepEqual(report.filterAdditions, [
    {
      kind: "type",
      filterLabel: "New Type",
      code: "999",
      sourceUrls: ["https://prayagindia.com/new-999"],
    },
  ]);
  assert.ok(report.filterRemovals.some((membership) =>
    membership.kind === "series" && membership.filterLabel === "Delta Series" && membership.code === "129-D"));
  assert.equal(report.ambiguousCodeSources.length, 2);
  assert.equal(report.ambiguousCodeSources[0].reason, "multiple-codes");
  assert.equal(report.ambiguousCodeSources[1].reason, "missing-code");
  assert.ok(report.removals.includes("181"));
  assert.equal(report.sourceReferences.find((reference) => reference.code === "999")?.sourceUrls[0],
    "https://prayagindia.com/new-999");
});

test("membership comparison ignores source-label casing but preserves exact code membership", () => {
  const report = comparePtmtOfficialInventory([{
    kind: "type",
    filterLabel: "SInk Cock",
    sourceUrl: "https://prayagindia.com/132-sink-cock",
    displayName: "132 Sink Cock",
    codeCandidates: ["132"],
  }], ["132"]);

  assert.ok(!report.filterAdditions.some((membership) => membership.code === "132"));
  assert.ok(!report.filterRemovals.some((membership) =>
    membership.kind === "type" && membership.filterLabel === "Sink Cock" && membership.code === "132"));
});

test("official inventory crawler requests every paginated page for every source filter", async () => {
  const landingPage = `
    <fieldset id="edit-field-ptmt-series-target-id--5--wrapper">
      <input id="edit-field-ptmt-series-target-id-77--5"
        name="field_ptmt_series_target_id[77]" value="77">
      <label for="edit-field-ptmt-series-target-id-77--5">Delta Series</label>
    </fieldset>`;
  const productCard = (code: string) => `
    <a href="/${code.toLowerCase()}">
      <div class="product_p_box"><img alt="${code}"><h6>${code} Product</h6></div>
    </a>`;
  const requested: string[] = [];
  const fetchImpl = async (url: string) => {
    requested.push(url);
    const page = new URL(url).searchParams.get("page");
    const html = url === "https://example.test/ptmt-filter"
      ? landingPage
      : `${page === null
        ? `${productCard("123-D")}<a href="?field_ptmt_series_target_id%5B77%5D=77&amp;page=1">2</a>`
        : productCard("129-D")}`;
    return { ok: true, status: 200, text: async () => html };
  };

  const inventory = await crawlOfficialPtmtFilterInventory({
    baseUrl: "https://example.test/ptmt-filter",
    fetchImpl,
  });
  assert.equal(inventory.filtersCrawled, 1);
  assert.equal(inventory.pagesFetched, 3);
  assert.deepEqual(inventory.cards.map((card) => card.codeCandidates), [["123-D"], ["129-D"]]);
  assert.deepEqual(requested, [
    "https://example.test/ptmt-filter",
    "https://example.test/ptmt-filter?field_ptmt_series_target_id%5B77%5D=77",
    "https://example.test/ptmt-filter?field_ptmt_series_target_id%5B77%5D=77&page=1",
  ]);
});