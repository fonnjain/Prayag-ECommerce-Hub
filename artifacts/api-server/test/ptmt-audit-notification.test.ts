import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPtmtAuditNotification,
  hasPtmtAuditFindings,
} from "../src/lib/ptmtAuditNotification";
import type { PtmtOfficialAuditReport } from "../src/lib/ptmtOfficialFilters";

function emptyReport(overrides: Partial<PtmtOfficialAuditReport> = {}): PtmtOfficialAuditReport {
  return {
    additions: [],
    removals: [],
    filterAdditions: [],
    filterRemovals: [],
    acknowledgedExceptions: [],
    missingLocalCatalogueRecords: [],
    ambiguousCodeSources: [],
    sourceReferences: [],
    sourceCodeCount: 0,
    approvedCodeCount: 0,
    localCatalogueCodeCount: 0,
    ...overrides,
  };
}

test("PTMT notification is suppressed when the audit is clean", () => {
  assert.equal(hasPtmtAuditFindings(emptyReport()), false);
});

test("PTMT notification includes exact findings and official source URLs", () => {
  const report = emptyReport({
    additions: ["999"],
    missingLocalCatalogueRecords: ["999"],
    filterRemovals: [{
      kind: "type",
      filterLabel: "Old <Type>",
      code: "123-D",
      sourceUrls: [],
    }],
    ambiguousCodeSources: [{
      kind: "type",
      filterLabel: "Shower",
      sourceUrl: "https://prayagindia.com/ambiguous",
      displayName: "Shower",
      codeCandidates: [],
      reason: "missing-code",
    }],
    sourceReferences: [{
      code: "999",
      filters: [{ kind: "type", label: "New Type" }],
      sourceUrls: ["https://prayagindia.com/999"],
    }],
    sourceCodeCount: 2,
    approvedCodeCount: 1,
  });

  assert.equal(hasPtmtAuditFindings(report), true);
  const notification = buildPtmtAuditNotification(report, {
    checkedAt: "2026-08-26T12:00:00.000Z",
    officialFilterUrl: "https://prayagindia.com/ptmt-filter",
  });
  assert.match(notification.subject, /4 findings/);
  assert.match(notification.html, /999/);
  assert.match(notification.html, /https:\/\/prayagindia\.com\/999/);
  assert.match(notification.html, /https:\/\/prayagindia\.com\/ptmt-filter/);
  assert.match(notification.html, /https:\/\/prayagindia\.com\/ambiguous/);
  assert.match(notification.html, /Old &lt;Type&gt;/);
  assert.match(notification.html, /no exact code/);
  assert.match(notification.html, /No catalogue data was changed/);
});