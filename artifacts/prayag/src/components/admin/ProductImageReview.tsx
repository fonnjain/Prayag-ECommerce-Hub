import { useMemo, useState } from "react";
import { CheckCircle2, ImageOff, LoaderCircle, Save, Search } from "lucide-react";
import {
  getGetAdminProductImageReviewQueryKey,
  useGetAdminProductImageReview,
  useUpdateAdminProductImageOverride,
  type ProductImageReviewGroup,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL || "/";
const imageUrl = (path: string) => `${basePath}images/drive/${path}`;

function samePaths(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((path, index) => path === right[index]);
}

export default function ProductImageReview() {
  const [search, setSearch] = useState("");
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading, error } = useGetAdminProductImageReview();
  const saveApproval = useUpdateAdminProductImageOverride();

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

  function selectedPaths(group: ProductImageReviewGroup): string[] {
    return selections[group.normalizedCode] ?? group.reviewedPaths;
  }

  function updateSelection(group: ProductImageReviewGroup, path: string): void {
    setSelections((current) => {
      const selected = new Set(current[group.normalizedCode] ?? group.reviewedPaths);
      if (selected.has(path)) selected.delete(path);
      else selected.add(path);
      return {
        ...current,
        [group.normalizedCode]: group.candidates
          .filter((candidate) => selected.has(candidate.path))
          .map((candidate) => candidate.path),
      };
    });
  }

  function saveSelection(group: ProductImageReviewGroup, paths = selectedPaths(group)): void {
    if (!group.sku) return;
    saveApproval.mutate(
      { sku: group.sku, data: { paths } },
      {
        onSuccess: (approval) => {
          setSelections((current) => ({ ...current, [group.normalizedCode]: approval.paths }));
          queryClient.invalidateQueries({ queryKey: getGetAdminProductImageReviewQueryKey() });
          toast({
            title: approval.paths.length ? "Photo approval saved" : "Photo approval removed",
            description: approval.paths.length
              ? `${approval.paths.length} exact image${approval.paths.length === 1 ? "" : "s"} approved for ${approval.sku}.`
              : `${approval.sku} will stay excluded from the next catalogue sync.`,
          });
        },
        onError: () => toast({ title: "Could not save photo approval", variant: "destructive" }),
      },
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duplicate Photo Review</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            Duplicate filename matches are never published automatically. Select the exact Drive assets to approve for a catalogue SKU; only saved
            paths will be used by the next catalogue sync.
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
                {group.sku ? (
                  <div className="mt-1 text-xs text-gray-500">Catalogue SKU: <span className="font-mono font-semibold text-gray-700">{group.sku}</span></div>
                ) : (
                  <div className="mt-1 text-xs font-medium text-amber-700">No unique catalogue SKU is available for approval.</div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                {group.sku && (
                  <>
                    {group.reviewedPaths.length > 0 && (
                      <button
                        type="button"
                        onClick={() => saveSelection(group, [])}
                        disabled={saveApproval.isPending}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        data-testid={`button-remove-photo-approval-${group.normalizedCode}`}
                      >
                        Remove approval
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => saveSelection(group)}
                      disabled={saveApproval.isPending || samePaths(selectedPaths(group), group.reviewedPaths)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[hsl(38,52%,40%)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid={`button-save-photo-approval-${group.normalizedCode}`}
                    >
                      {saveApproval.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save selection
                    </button>
                  </>
                )}
              </div>
            </header>
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {group.candidates.map((candidate) => {
                const approved = selectedPaths(group).includes(candidate.path);
                return (
                  <label key={candidate.path} className={`block overflow-hidden rounded-lg border transition-colors ${approved ? "border-green-300 ring-1 ring-green-100" : "border-gray-200"} ${group.sku ? "cursor-pointer" : "cursor-not-allowed opacity-75"}`}>
                    <div className="aspect-square bg-[#f7f4ee] p-3">
                      <img src={imageUrl(candidate.path)} alt={candidate.file} loading="lazy" className="h-full w-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="border-t border-gray-100 p-3">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={approved}
                          disabled={!group.sku || saveApproval.isPending}
                          onChange={() => updateSelection(group, candidate.path)}
                          className="mt-0.5 h-4 w-4 accent-[hsl(38,52%,40%)]"
                          data-testid={`checkbox-photo-candidate-${candidate.path}`}
                        />
                        <div className="min-w-0 truncate font-mono text-xs font-semibold text-gray-800" title={candidate.file}>{candidate.file}</div>
                      </div>
                      <div className="mt-1 truncate text-xs text-gray-500" title={candidate.folder}>Drive folder / series: {candidate.folder}</div>
                      <div className={`mt-2 text-xs font-semibold ${approved ? "text-green-700" : "text-gray-400"}`}>
                        {approved ? "Selected exact path" : "Not selected"}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}