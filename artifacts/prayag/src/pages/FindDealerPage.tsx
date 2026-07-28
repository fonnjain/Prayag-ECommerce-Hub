import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Store, Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Dealer {
  id: number;
  businessName: string;
  address: string | null;
  area: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  customerType: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  Retailer: "Retailer",
  Distributors: "Distributor",
  "Direct Dealers": "Direct Dealer",
};

function SmoothMap({ src }: { src: string }) {
  const [layers, setLayers] = useState<{ src: string; loaded: boolean }[]>([{ src, loaded: false }]);

  useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1]?.src === src) return prev;
      // keep the last (visible) layer underneath, load the new one on top
      return [...prev.slice(-1), { src, loaded: false }];
    });
  }, [src]);

  const onLoad = (s: string) => {
    setLayers((prev) => {
      const next = prev.map((l) => (l.src === s ? { ...l, loaded: true } : l));
      // once the newest layer is loaded, drop the old ones (after fade)
      const last = next[next.length - 1];
      if (last.loaded && next.length > 1) {
        setTimeout(() => setLayers((p) => (p[p.length - 1]?.loaded ? p.slice(-1) : p)), 450);
      }
      return next;
    });
  };

  return (
    <div className="relative w-full h-[480px] bg-stone-100">
      {layers.map((l, i) => (
        <iframe
          key={l.src}
          title="Dealer location"
          src={l.src}
          loading="eager"
          onLoad={() => onLoad(l.src)}
          className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-500 ease-out ${
            l.loaded ? "opacity-100" : i === 0 ? "opacity-100" : "opacity-0"
          }`}
          data-testid={i === layers.length - 1 ? "iframe-locator-map" : undefined}
        />
      ))}
    </div>
  );
}

// Full query (name + address) — used for the "Open in Google Maps" link
function mapQuery(d: Dealer) {
  return encodeURIComponent(
    [d.businessName, d.address, d.area, d.city, d.district, d.state, d.pincode, "India"].filter(Boolean).join(", "),
  );
}

// Simplified, reliably-geocodable location string (long shop addresses often
// fail to geocode and leave the map without any pin)
function pinLocation(d: Dealer) {
  const area = (d.area || "").replace(/\s*[BS]\.?O\.?$/i, "").trim();
  return [area, d.city, d.district, d.state, d.pincode, "India"]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(", ");
}

// Geocode via our API (Nominatim-backed) so the embedded pin can carry the
// dealer's name as a label: q=lat,lon(Business Name)
async function fetchGeocode(loc: string): Promise<{ lat: number; lon: number } | null> {
  const res = await fetch(`/api/dealers/geocode?q=${encodeURIComponent(loc)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ?? null;
}

function mapEmbedSrc(d: Dealer, coords: { lat: number; lon: number } | null | undefined) {
  if (coords) {
    return `https://maps.google.com/maps?q=${coords.lat},${coords.lon}(${encodeURIComponent(d.businessName || "Dealer")})&z=15&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(pinLocation(d))}&z=15&output=embed`;
}

async function fetchLocator(state: string, district: string, city: string, pincode: string, type: string, page: number) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (state) params.set("state", state);
  if (district) params.set("district", district);
  if (city) params.set("city", city);
  if (pincode) params.set("pincode", pincode);
  params.set("page", String(page));
  const res = await fetch(`/api/dealers/locator?${params.toString()}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function FindDealerPage() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincode, setPincode] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Dealer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["dealer-locator", state, district, city, pincode, type, page],
    queryFn: () => fetchLocator(state, district, city, pincode, type, page),
  });

  const { data: coords } = useQuery({
    queryKey: ["dealer-geocode", selected ? pinLocation(selected) : ""],
    queryFn: () => fetchGeocode(pinLocation(selected!)),
    enabled: !!selected,
    staleTime: Infinity,
  });

  const hasFilter = !!(state || district || city || pincode);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[hsl(24,10%,16%)] text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 text-[hsl(42,62%,68%)] text-xs font-semibold uppercase tracking-widest mb-2">
            <MapPin className="w-4 h-4" /> Dealer Locator
          </div>
          <h1 className="text-3xl font-black">Find Dealer Near By You</h1>
          <p className="text-sm text-[hsl(42,40%,80%)] mt-2">
            Select your Country, State, District, City or Pincode to locate the nearest PRAYAG dealer on Google Maps.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); setSelected(null); }}
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm px-3 py-2.5"
                data-testid="select-locator-type"
              >
                <option value="">All Types</option>
                <option value="retailer">Retailers</option>
                <option value="distributor">Distributors</option>
                <option value="direct-dealer">Direct Dealers</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Country</label>
              <select className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm px-3 py-2.5" data-testid="select-locator-country">
                <option>India</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">State</label>
              <select
                value={state}
                onChange={(e) => { setState(e.target.value); setDistrict(""); setCity(""); setPage(1); setSelected(null); }}
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm px-3 py-2.5"
                data-testid="select-locator-state"
              >
                <option value="">All States</option>
                {(data?.states || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">District</label>
              <select
                value={district}
                onChange={(e) => { setDistrict(e.target.value); setCity(""); setPage(1); setSelected(null); }}
                disabled={!state}
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm px-3 py-2.5 disabled:opacity-50"
                data-testid="select-locator-district"
              >
                <option value="">All Districts</option>
                {(data?.districts || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">City</label>
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); setSelected(null); }}
                disabled={!state}
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm px-3 py-2.5 disabled:opacity-50"
                data-testid="select-locator-city"
              >
                <option value="">All Cities</option>
                {(data?.cities || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Pincode</label>
              <form onSubmit={(e) => { e.preventDefault(); setPincode(pincodeInput.trim()); setPage(1); setSelected(null); }} className="relative mt-1">
                <input
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  placeholder="e.g. 452001"
                  inputMode="numeric"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm px-3 py-2.5 pr-9"
                  data-testid="input-locator-pincode"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[hsl(38,52%,40%)]" data-testid="button-locator-search">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Dealers {hasFilter ? "Found" : "Near You"}</h2>
              {data && <span className="text-xs bg-stone-200 text-stone-700 font-semibold px-3 py-1 rounded-full" data-testid="text-locator-total">{data.total.toLocaleString("en-IN")} dealers</span>}
            </div>
            {isLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
            ) : data && data.dealers.length > 0 ? (
              <>
                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {data.dealers.map((d: Dealer) => (
                    <div
                      key={d.id}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${selected?.id === d.id ? "border-[hsl(38,52%,40%)] ring-1 ring-[hsl(38,52%,40%)]" : "border-gray-100 hover:border-gray-300"}`}
                      onClick={() => setSelected(d)}
                      data-testid={`card-locator-dealer-${d.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <Store className="w-4.5 h-4.5 text-[hsl(38,52%,40%)]" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{d.businessName}</div>
                            {d.customerType && (
                              <span className="inline-block text-[10px] font-semibold bg-amber-50 text-[hsl(38,52%,40%)] px-2 py-0.5 rounded-full mt-0.5">
                                {TYPE_LABELS[d.customerType] || d.customerType}
                              </span>
                            )}
                            <div className="text-xs text-gray-500 mt-0.5">
                              {[d.address, d.area].filter(Boolean).join(", ") || "—"}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {[d.city, d.district, d.state, d.pincode].filter(Boolean).join(", ")}
                            </div>
                          </div>
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery(d)}`}
                          target="_blank" rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs font-semibold text-[hsl(38,52%,40%)] hover:underline flex-shrink-0"
                          data-testid={`link-locator-gmaps-${d.id}`}
                        >
                          <MapPin className="w-3.5 h-3.5" /> Map <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">Page {data.page} of {data.totalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={data.page <= 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50"
                      data-testid="button-locator-prev"><ChevronLeft className="w-3.5 h-3.5" /> Prev</button>
                    <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={data.page >= data.totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50"
                      data-testid="button-locator-next">Next <ChevronRight className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No dealers found for the selected location</p>
              </div>
            )}
          </div>

          {/* Map */}
          <div>
            <h2 className="font-bold text-gray-900 mb-3">Location on Google Map</h2>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {selected ? (
                <>
                  <SmoothMap src={mapEmbedSrc(selected, coords)} />
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{selected.businessName}</div>
                      <div className="text-xs text-gray-400">{[selected.city, selected.state, selected.pincode].filter(Boolean).join(", ")}</div>
                    </div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery(selected)}`} target="_blank" rel="noreferrer"
                      className="flex-shrink-0 bg-[hsl(24,10%,16%)] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[hsl(24,9%,26%)] transition-colors"
                      data-testid="button-locator-open-gmaps">Open in Google Maps</a>
                  </div>
                </>
              ) : (
                <div className="h-[480px] flex flex-col items-center justify-center text-center px-8">
                  <MapPin className="w-14 h-14 text-gray-200 mb-4" />
                  <p className="text-gray-500 text-sm font-medium">Select a dealer from the list</p>
                  <p className="text-gray-400 text-xs mt-1">The dealer's exact location will appear here on Google Maps</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
