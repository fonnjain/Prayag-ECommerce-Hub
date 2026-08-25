import { useMemo, useState } from "react";
import { CheckCircle2, ImageOff, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Candidate {
  folder: string;
  file: string;
  path: string;
}

interface ReviewGroup {
  normalizedCode: string;
  candidates: Candidate[];
  reviewedPaths: string[];
}

interface ReviewDocument {
  version: number;
  groups: ReviewGroup[];
}

const basePath = import.meta.env.BASE_URL || "/";
const reviewUrl = `${basePath}images/drive/ambiguous-image-review.json`;
const imageUrl = (path: string) => `${basePath}images/drive/${path}`;

async function loadReview(): Promise<ReviewDocument> {
  const response = await fetch(reviewUrl);
  if (!response.ok) throw new Error(`Could not load image review list (${response.status})`);
  return response.json() as Promise<ReviewDocument>;
}

export default function ProductImageReview() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["product-image-review"],
    queryFn: loadReview,
    staleTime: Infinity,
  });

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data?.groups ?? [];
    return (data?.groups ?? []).filter((group) =>
      group.normalizedCode.includes(query) ||
      group.candidates.some((candidate) =>
        `${candidate.folder} ${candidate.file}`.toLowerCase().includes(query),
      ),
    );
  }, [data, search]);

  const reviewedCount = data?.groups.filter((group) => group.reviewedPaths.length > 0).length ?? 0;

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duplicate Photo Review</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            Duplicate filename matches are never published automatically. Review each exact Drive asset here, then add only approved paths to
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-700">product-image-overrides.json</code>,
            regenerate this review list, and validate before the next catalogue sync.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">{data?.groups.length ?? "—"} ambiguous codes</span>
          <span className="rounded-full bg-green-100 px-3 py-1.5 text-green-700">{reviewedCount} with explicit overrides</span>
        </div>
      </div>

      <label className="relative mb-5 block max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search a SKU code, Drive folder, or filename"
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[hsl(38,52%,40%)]"
          data-testid="input-photo-review-search"
        />
      </label>

      {isLoading && <div className="rounded-xl border border-gray-100 bg-white p-8 text-sm text-gray-400">Loading Drive candidates…</div>}
      {error && <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">The image review list could not be loaded.</div>}
      {!isLoading && !error && groups.length === 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-sm text-gray-400">No duplicate image candidates match this search.</div>
      )}

      <div className="space-y-5">
        {groups.map((group) => (
          <article key={group.normalizedCode} className="overflow-hidden rounded-xl border border-gray-100 bg-white" data-testid={`photo-review-${group.normalizedCode}`}>
            <header className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ambiguous SKU code</div>
                <h2 className="font-mono text-lg font-bold text-gray-900">{group.normalizedCode}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600">{group.candidates.length} Drive candidates</span>
                {group.reviewedPaths.length > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Explicitly approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    <ImageOff className="h-3.5 w-3.5" /> Excluded from sync
                  </span>
                )}
              </div>
            </header>
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {group.candidates.map((candidate) => {
                const approved = group.reviewedPaths.includes(candidate.path);
                return (
                  <div key={candidate.path} className={`overflow-hidden rounded-lg border ${approved ? "border-green-300 ring-1 ring-green-100" : "border-gray-200"}`}>
                    <div className="aspect-square bg-[#f7f4ee] p-3">
                      <img src={imageUrl(candidate.path)} alt={candidate.file} loading="lazy" className="h-full w-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="border-t border-gray-100 p-3">
                      <div className="truncate font-mono text-xs font-semibold text-gray-800" title={candidate.file}>{candidate.file}</div>
                      <div className="mt-1 truncate text-xs text-gray-500" title={candidate.folder}>Drive folder / series: {candidate.folder}</div>
                      <div className={`mt-2 text-xs font-semibold ${approved ? "text-green-700" : "text-gray-400"}`}>
                        {approved ? "Approved exact path" : "Not approved"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}