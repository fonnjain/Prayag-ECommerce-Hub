// Normalization for district (territory) and city values imported from CSVs.
// Fixes casing duplicates ("SAHARANPUR" vs "Saharanpur"), strips postal-office
// suffixes ("Saharanpur H.o.", "Bijbehara S.O") and administrative tags
// ("Mandi(T)", "Vijayawada (Urban)"), and maps known non-district values.

// Placeholder values that mean "no data".
const EMPTY_VALUES = new Set(["NA", "N/A", "NIL", "NONE", "-", "--", "."]);

// Known non-district / misspelled district values → canonical district name.
export const DISTRICT_ALIASES: Record<string, string> = {
  "KAMRUP METRO": "Kamrup Metropolitan",
  "KAMRUP METROPOLITAN": "Kamrup Metropolitan",
};

// Trailing parenthesized administrative tags that carry no locality meaning.
// State disambiguators like (HP), (CGH), (MH), (BH) are intentionally kept.
const STRIP_PAREN_TAGS = new Set([
  "T", "ST", "S.T", "URBAN", "RURAL", "M", "P", "MC",
  "MDL", "PART", "ITS", "B.O", "S.O", "H.O",
]);

// Trailing postal/railway abbreviations: "H.o.", "S.O", "B.O", "R.s.", "Kty."
const POSTAL_SUFFIX_RE = /\s+(?:[HSB]\.?\s?[O]\.?|R\.?S\.?|KTY\.?)$/i;

function titleCaseWord(word: string): string {
  // Keep short dotted initialisms as-is after uppercasing (e.g. "S.A.S.")
  return word
    .split(/([-.])/)
    .map((part, i) =>
      i % 2 === 1 ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join("");
}

function smartTitleCase(value: string): string {
  return value
    .split(" ")
    .map((w) => titleCaseWord(w))
    .join(" ");
}

/**
 * Normalize a raw district or city value to a clean canonical form.
 * Returns null for empty/placeholder input. Unknown mixed-case values are
 * returned with whitespace collapsed; ALL-CAPS or all-lowercase values are
 * converted to Title Case so casing duplicates collapse to one entry.
 */
export function normalizeLocality(raw: string | null | undefined): string | null {
  let v = (raw ?? "").trim().replace(/\s+/g, " ");
  if (!v) return null;
  if (EMPTY_VALUES.has(v.toUpperCase())) return null;

  // Strip trailing punctuation noise ("Yeola.", "Visakhapatnam.")
  v = v.replace(/[.,]+$/, "").trim();

  // Strip trailing parenthesized administrative tags: "Mandi(T)", "Una (Urban)"
  for (;;) {
    const m = v.match(/^(.*?)\s*\(\s*([^()]*?)\s*\)$/);
    if (!m) break;
    const tag = m[2].toUpperCase().replace(/\s+/g, "").replace(/\.+$/, "");
    if (!STRIP_PAREN_TAGS.has(tag)) break;
    v = m[1].trim();
  }

  // Strip trailing postal-office / railway-station suffixes
  v = v.replace(POSTAL_SUFFIX_RE, "").trim();
  v = v.replace(/[.,]+$/, "").trim();
  if (!v) return null;

  // Normalize spacing before remaining disambiguators: "Bilaspur(CGH)" → "Bilaspur (CGH)"
  v = v.replace(/\s*\(\s*([^()]*?)\s*\)/g, " ($1)").replace(/\s+/g, " ").trim();

  const alias = DISTRICT_ALIASES[v.toUpperCase()];
  if (alias) return alias;

  // Collapse casing duplicates: only rewrite unambiguous all-caps/all-lower values
  if (v === v.toUpperCase() || v === v.toLowerCase()) {
    v = smartTitleCase(v);
    // Keep short state disambiguators uppercase: "Bilaspur (Cgh)" → "Bilaspur (CGH)"
    v = v.replace(/\(([A-Za-z.]{1,4})\)/g, (_m, tag: string) => `(${tag.toUpperCase()})`);
  }
  return v;
}
