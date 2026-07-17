import { useEffect, useMemo, useState } from "react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type Manifest = Record<string, string[]>;

export default function GalleryPage() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState(false);
  const [folder, setFolder] = useState<string>("");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string>("");

  useEffect(() => {
    fetch(`${BASE}/images/drive/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error("manifest fetch failed");
        return r.json();
      })
      .then((m: Manifest) => setManifest(m))
      .catch(() => setError(true));
  }, []);

  const folders = useMemo(() => (manifest ? Object.keys(manifest) : []), [manifest]);

  const images = useMemo(() => {
    if (!manifest) return [];
    const q = search.trim().toLowerCase();
    const entries: { dir: string; file: string }[] = [];
    const dirs = folder ? [folder] : folders;
    for (const d of dirs) {
      for (const f of manifest[d] || []) {
        if (q && !(d + "/" + f).toLowerCase().includes(q)) continue;
        entries.push({ dir: d, file: f });
        if (entries.length >= 500) return entries;
      }
    }
    return entries;
  }, [manifest, folder, search, folders]);

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      setCopied(path);
      setTimeout(() => setCopied(""), 1500);
    });
  };

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Gallery manifest load nahi hua. Page refresh karke try karein.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Image Gallery</h1>
      <p className="text-gray-500 mb-6">
        {manifest
          ? `${folders.length} folders · ${Object.values(manifest).reduce((a, b) => a + b.length, 0)} images — image pe click karke path copy karein`
          : "Loading..."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f} ({manifest?.[f].length})
            </option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
        />
      </div>

      {manifest && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map(({ dir, file }) => {
              const path = `/images/drive/${dir}/${file}`;
              return (
                <button
                  key={path}
                  onClick={() => copyPath(path)}
                  className="group text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
                  title={path}
                >
                  <img
                    src={`${BASE}${path}`}
                    alt={file}
                    loading="lazy"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2">
                    <div className="text-[11px] text-gray-400 truncate">{dir}</div>
                    <div className="text-xs font-medium text-gray-700 truncate">
                      {copied === path ? "✓ Path copied!" : file}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {images.length >= 500 && (
            <p className="text-center text-sm text-gray-400 mt-6">
              Pehli 500 images dikh rahi hain — folder select karein ya search karein.
            </p>
          )}
          {images.length === 0 && (
            <p className="text-center text-gray-400 mt-12">Koi image nahi mili.</p>
          )}
        </>
      )}
    </div>
  );
}
