/**
 * Supplier item codes are identifiers, not display labels. The source may add
 * spacing (for example, "Q716 MB"), but our catalogue stores the compact
 * canonical form ("Q716MB") so sync matching remains stable.
 */
export function compactSku(value: string): string {
  return value.replace(/\s+/g, "").trim();
}