// Canonical Indian state/UT names (Title Case) keyed by their UPPERCASE form,
// plus aliases for known-bad values from the imported CSVs.
export const CANONICAL_STATES: string[] = [
  "Andaman & Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra & Nagar Haveli",
  "Daman & Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// Misspellings, regions, and non-state values seen in imported data → real state.
export const STATE_ALIASES: Record<string, string> = {
  "CHATTISGARH": "Chhattisgarh",
  "CHHATISGARH": "Chhattisgarh",
  "PONDICHERRY": "Puducherry",
  "ORISSA": "Odisha",
  "JAMMU AND KASHMIR": "Jammu & Kashmir",
  "JAMMU & KASHMIR": "Jammu & Kashmir",
  "ANDAMAN AND NICOBAR ISLANDS": "Andaman & Nicobar Islands",
  "DAMAN AND DIU": "Daman & Diu",
  "DELHI NCR": "Delhi",
  "NEW DELHI": "Delhi",
  "EAST U.P": "Uttar Pradesh",
  "WEST U.P": "Uttar Pradesh",
  "EAST UP": "Uttar Pradesh",
  "WEST UP": "Uttar Pradesh",
  "U.P": "Uttar Pradesh",
  "UP": "Uttar Pradesh",
  // Localities that ended up in the state column (both verified as Haryana rows)
  "OLD MANDI": "Haryana",
  "RAV TULA RAM CHOWK": "Haryana",
};

const CANONICAL_BY_UPPER = new Map(
  CANONICAL_STATES.map((s) => [s.toUpperCase(), s]),
);

/**
 * Normalize a raw state value to its canonical Title Case name.
 * Returns null for empty input. Unknown values are returned trimmed as-is.
 */
export function normalizeState(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? "").trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  const key = trimmed.toUpperCase().replace(/\.+$/, "");
  return STATE_ALIASES[key] ?? CANONICAL_BY_UPPER.get(key) ?? trimmed;
}
