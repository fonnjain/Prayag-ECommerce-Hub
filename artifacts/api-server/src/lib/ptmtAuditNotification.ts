import type {
  PtmtAmbiguousCodeSource,
  PtmtAuditCodeReference,
  PtmtFilterMembership,
  PtmtOfficialAuditReport,
} from "./ptmtOfficialFilters.js";

export interface PtmtAuditNotification {
  subject: string;
  html: string;
}

export function hasPtmtAuditFindings(report: PtmtOfficialAuditReport): boolean {
  return report.additions.length > 0
    || report.removals.length > 0
    || report.filterAdditions.length > 0
    || report.filterRemovals.length > 0
    || report.missingLocalCatalogueRecords.length > 0
    || report.ambiguousCodeSources.length > 0;
}

export function buildPtmtAuditNotification(
  report: PtmtOfficialAuditReport,
  {
    checkedAt,
    officialFilterUrl,
  }: {
    checkedAt: string;
    officialFilterUrl: string;
  },
): PtmtAuditNotification {
  const referencesByCode = new Map(report.sourceReferences.map((reference) => [reference.code, reference]));
  const sections = [
    buildCodeSection("Official code additions", report.additions, referencesByCode, officialFilterUrl),
    buildCodeSection("Official code removals", report.removals, referencesByCode, officialFilterUrl),
    buildCodeSection(
      "Missing from the local catalogue",
      report.missingLocalCatalogueRecords,
      referencesByCode,
      officialFilterUrl,
    ),
    buildMembershipSection("Filter-membership additions", report.filterAdditions, officialFilterUrl),
    buildMembershipSection("Filter-membership removals", report.filterRemovals, officialFilterUrl),
    buildAmbiguousSection(report.ambiguousCodeSources, officialFilterUrl),
  ].filter((section): section is string => Boolean(section));

  const findingCount = report.additions.length
    + report.removals.length
    + report.filterAdditions.length
    + report.filterRemovals.length
    + report.missingLocalCatalogueRecords.length
    + report.ambiguousCodeSources.length;

  return {
    subject: `PRAYAG PTMT catalogue review needed (${findingCount} finding${findingCount === 1 ? "" : "s"})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#2b2622">
        <h2 style="margin-bottom:6px">PTMT official filter review needed</h2>
        <p style="color:#555;font-size:14px;margin-top:0">
          The read-only audit checked ${report.sourceCodeCount} official codes against
          ${report.approvedCodeCount} approved codes and found ${findingCount} item${findingCount === 1 ? "" : "s"}
          requiring manual verification.
        </p>
        ${sections.join("\n")}
        <p style="font-size:13px;margin-top:24px">
          Verify the official filter page before changing the approved mapping or customer catalogue:
          <a href="${escapeHtml(officialFilterUrl)}">${escapeHtml(officialFilterUrl)}</a>
        </p>
        <p style="color:#888;font-size:12px">Audit checked at ${escapeHtml(checkedAt)}. No catalogue data was changed.</p>
      </div>`,
  };
}

function buildCodeSection(
  title: string,
  codes: string[],
  referencesByCode: Map<string, PtmtAuditCodeReference>,
  officialFilterUrl: string,
): string {
  if (codes.length === 0) return "";
  return section(title, codes.map((code) => {
    const reference = referencesByCode.get(code);
    return listItem(
      `<code>${escapeHtml(code)}</code>`,
      reference?.sourceUrls.length ? reference.sourceUrls : [officialFilterUrl],
    );
  }));
}

function buildMembershipSection(
  title: string,
  memberships: PtmtFilterMembership[],
  officialFilterUrl: string,
): string {
  if (memberships.length === 0) return "";
  return section(title, memberships.map((membership) => listItem(
    `<code>${escapeHtml(membership.code)}</code> — ${escapeHtml(membership.kind)}: ${escapeHtml(membership.filterLabel)}`,
    membership.sourceUrls.length ? membership.sourceUrls : [officialFilterUrl],
  )));
}

function buildAmbiguousSection(
  sources: PtmtAmbiguousCodeSource[],
  officialFilterUrl: string,
): string {
  if (sources.length === 0) return "";
  return section("Ambiguous official sources", sources.map((source) => {
    const candidates = source.codeCandidates.length > 0 ? source.codeCandidates.join(", ") : "no exact code";
    return listItem(
      `${escapeHtml(source.displayName || "Unnamed source")} — ${escapeHtml(source.reason)} (${escapeHtml(candidates)})`,
      [source.sourceUrl || officialFilterUrl],
    );
  }));
}

function section(title: string, items: string[]): string {
  return `
    <h3 style="font-size:15px;margin:18px 0 6px">${escapeHtml(title)}</h3>
    <ul style="margin-top:0;padding-left:22px">${items.join("")}</ul>`;
}

function listItem(label: string, sourceUrls: string[]): string {
  const links = [...new Set(sourceUrls)].map((url) =>
    `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`,
  ).join(", ");
  return `<li style="margin:5px 0;font-size:13px">${label} — ${links}</li>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}