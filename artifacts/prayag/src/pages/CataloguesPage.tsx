import { BookOpen, Download } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const CATALOGUES = [
  {
    title: "CP Faucets, Sanitaryware & Kitchen Sink Catalogue",
    subtitle: "2026 Edition",
    cover: `${BASE}/images/catalogues/cp-faucets.webp`,
    pdf: "https://prayagindia.com/sites/default/files/2026-04/PRAYAG%20CP%20CATALOGUE%2C%202026_compressed.pdf",
  },
  {
    title: "PTMT Catalogue",
    subtitle: "2026 Edition",
    cover: `${BASE}/images/catalogues/ptmt.webp`,
    pdf: "https://prayagindia.com/sites/default/files/2026-04/PTMT%20CATALOGE%2C%202026_compressed.pdf",
  },
  {
    title: "Geyser Catalogue",
    subtitle: "Water Heaters — Oct 2024",
    cover: `${BASE}/images/catalogues/geyser.webp`,
    pdf: "https://prayagindia.com/sites/default/files/2025-11/Geyser%20Catalgue%20-%20Oct%2C%202024_0.pdf",
  },
  {
    title: "Plumbing Catalogue",
    subtitle: "CPVC, UPVC, SWR & Agri — 2025",
    cover: `${BASE}/images/catalogues/plumbing.webp`,
    pdf: "https://prayagindia.com/sites/default/files/2025-03/CPVC%2C%20UPVC%20%2C%20SWR%20AND%20AGRI%20RICE%20LIST_Catalogue%2C%2025.pdf",
  },
  {
    title: "PVC-O Pipes Catalogue",
    subtitle: "High-pressure pipe range",
    cover: `${BASE}/images/catalogues/pvco.webp`,
    pdf: "https://prayagindia.com/sites/default/files/2025-01/Final%20PVC%20-%20O%20Catalogue.pdf",
  },
  {
    title: "Water Tank Catalogue",
    subtitle: "Storage tank range",
    cover: `${BASE}/images/catalogues/water-tank.webp`,
    pdf: "https://prayagindia.com/sites/default/files/2025-03/WATER%20TANK.pdf",
  },
];

export default function CataloguesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[hsl(24,10%,16%)] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 text-[hsl(42,62%,68%)] text-xs font-bold uppercase tracking-widest mb-3">
            <BookOpen className="w-4 h-4" /> Product Catalogues
          </div>
          <h1 className="text-3xl md:text-4xl font-black" data-testid="text-catalogues-title">Download Catalogues</h1>
          <p className="text-gray-300 text-sm mt-2 max-w-xl">
            Browse and download the latest PRAYAG product catalogues — faucets, sanitaryware, pipes, water heaters, tanks and more.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATALOGUES.map((c) => (
            <div
              key={c.title}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-[hsl(38,52%,40%)]/40 transition-all group flex flex-col"
              data-testid={`card-catalogue-${c.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
            >
              <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={c.cover}
                  alt={c.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-bold text-gray-900 text-sm leading-snug">{c.title}</h2>
                <p className="text-xs text-gray-400 mt-1 mb-4">{c.subtitle}</p>
                <a
                  href={c.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="mt-auto inline-flex items-center justify-center gap-2 bg-[hsl(24,10%,16%)] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[hsl(38,52%,40%)] transition-colors"
                  data-testid={`button-download-${c.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
