import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useGetSiteContent, useUpdateSiteContent, getGetSiteContentQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cmsDefaults, mergeWithDefaults, type CmsSectionKey, type HeroContent, type CollectionCard, type RoomCard, type TrustItem, type TopbarContent, type FooterContent } from "@/lib/siteContent";
import ImageUploadField from "./ImageUploadField";

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[hsl(38,52%,40%)]";
const labelCls = "block text-xs font-medium text-gray-500 mb-1";

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} className={inputCls} />
        : <input value={value} onChange={e => onChange(e.target.value)} className={inputCls} />}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className={inputCls} />
    </div>
  );
}

function SectionCard({ title, children, onSave, saving }: { title: string; children: React.ReactNode; onSave: () => void; saving: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">{title}</h2>
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-1.5 text-xs font-bold bg-[hsl(38,52%,40%)] text-white px-4 py-2 rounded-lg hover:bg-[hsl(38,52%,35%)] disabled:opacity-50"
          data-testid={`button-save-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function SiteContentManager() {
  const { data, isLoading } = useGetSiteContent();
  const update = useUpdateSiteContent();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [hero, setHero] = useState<HeroContent>(cmsDefaults.hero);
  const [collections, setCollections] = useState<CollectionCard[]>(cmsDefaults.collections.cards as CollectionCard[]);
  const [rooms, setRooms] = useState<RoomCard[]>(cmsDefaults.rooms.cards as RoomCard[]);
  const [trust, setTrust] = useState<TrustItem[]>(cmsDefaults.trust.items as TrustItem[]);
  const [marquee, setMarquee] = useState<string>((cmsDefaults.marquee.words as string[]).join(", "));
  const [topbar, setTopbar] = useState<TopbarContent>(cmsDefaults.topbar);
  const [footer, setFooter] = useState<FooterContent>(cmsDefaults.footer);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    const content = data as Record<string, unknown>;
    setHero(mergeWithDefaults(cmsDefaults.hero, content.hero));
    setCollections(mergeWithDefaults(cmsDefaults.collections, content.collections).cards as CollectionCard[]);
    setRooms(mergeWithDefaults(cmsDefaults.rooms, content.rooms).cards as RoomCard[]);
    setTrust(mergeWithDefaults(cmsDefaults.trust, content.trust).items as TrustItem[]);
    setMarquee((mergeWithDefaults(cmsDefaults.marquee, content.marquee).words as string[]).join(", "));
    setTopbar(mergeWithDefaults(cmsDefaults.topbar, content.topbar));
    setFooter(mergeWithDefaults(cmsDefaults.footer, content.footer));
  }, [data]);

  function save(section: CmsSectionKey, payload: Record<string, unknown>) {
    setSavingSection(section);
    update.mutate({ section, data: { data: payload } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSiteContentQueryKey() });
        toast({ title: "Saved", description: `${section} content updated` });
      },
      onError: () => toast({ title: "Save failed", variant: "destructive" }),
      onSettled: () => setSavingSection(null),
    });
  }

  if (isLoading) return <div className="text-sm text-gray-400">Loading site content…</div>;

  return (
    <div className="max-w-3xl">
      <SectionCard title="Hero Section" onSave={() => save("hero", hero as unknown as Record<string, unknown>)} saving={savingSection === "hero"}>
        <Field label="Badge text" value={hero.badge} onChange={v => setHero({ ...hero, badge: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" value={hero.titleLine1} onChange={v => setHero({ ...hero, titleLine1: v })} />
          <Field label="Title accent (gold word)" value={hero.titleAccent} onChange={v => setHero({ ...hero, titleAccent: v })} />
        </div>
        <Field label="Subtitle" textarea value={hero.subtitle} onChange={v => setHero({ ...hero, subtitle: v })} />
        <div className="grid grid-cols-3 gap-3">
          {hero.stats.map((s, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-2.5 space-y-2">
              <NumField label={`Stat ${i + 1} number`} value={s.n} onChange={v => setHero({ ...hero, stats: hero.stats.map((x, j) => j === i ? { ...x, n: v } : x) })} />
              <Field label="Suffix" value={s.s} onChange={v => setHero({ ...hero, stats: hero.stats.map((x, j) => j === i ? { ...x, s: v } : x) })} />
              <Field label="Label" value={s.label} onChange={v => setHero({ ...hero, stats: hero.stats.map((x, j) => j === i ? { ...x, label: v } : x) })} />
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-bold text-gray-700 mb-2">Featured product card</div>
          <div className="space-y-3">
            <Field label="Name" value={hero.featured.name} onChange={v => setHero({ ...hero, featured: { ...hero.featured, name: v } })} />
            <ImageUploadField label="Image" value={hero.featured.image} onChange={v => setHero({ ...hero, featured: { ...hero.featured, image: v } })} />
            <div className="grid grid-cols-3 gap-3">
              <NumField label="Price (₹)" value={hero.featured.price} onChange={v => setHero({ ...hero, featured: { ...hero.featured, price: v } })} />
              <NumField label="MRP (₹)" value={hero.featured.mrp} onChange={v => setHero({ ...hero, featured: { ...hero.featured, mrp: v } })} />
              <NumField label="Reviews count" value={hero.featured.reviews} onChange={v => setHero({ ...hero, featured: { ...hero.featured, reviews: v } })} />
            </div>
            <Field label="Link (e.g. /products?category=cp-faucets)" value={hero.featured.link} onChange={v => setHero({ ...hero, featured: { ...hero.featured, link: v } })} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Collections" onSave={() => save("collections", { cards: collections })} saving={savingSection === "collections"}>
        {collections.map((c, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-700">Card {i + 1}</div>
              <button onClick={() => setCollections(collections.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title" value={c.title} onChange={v => setCollections(collections.map((x, j) => j === i ? { ...x, title: v } : x))} />
              <Field label="Subtitle" value={c.sub} onChange={v => setCollections(collections.map((x, j) => j === i ? { ...x, sub: v } : x))} />
            </div>
            <ImageUploadField label="Image" value={c.img} onChange={v => setCollections(collections.map((x, j) => j === i ? { ...x, img: v } : x))} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Chips (comma separated)" value={c.chips.join(", ")} onChange={v => setCollections(collections.map((x, j) => j === i ? { ...x, chips: v.split(",").map(s => s.trim()).filter(Boolean) } : x))} />
              <Field label="Category slug" value={c.slug} onChange={v => setCollections(collections.map((x, j) => j === i ? { ...x, slug: v } : x))} />
            </div>
          </div>
        ))}
        <button onClick={() => setCollections([...collections, { title: "", sub: "", img: "", chips: [], slug: "" }])}
          className="flex items-center gap-1 text-xs font-semibold text-[hsl(38,52%,40%)]"><Plus className="w-3.5 h-3.5" /> Add card</button>
      </SectionCard>

      <SectionCard title="Shop By Room" onSave={() => save("rooms", { cards: rooms })} saving={savingSection === "rooms"}>
        {rooms.map((r, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-700">Room {i + 1}</div>
              <button onClick={() => setRooms(rooms.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Label" value={r.label} onChange={v => setRooms(rooms.map((x, j) => j === i ? { ...x, label: v } : x))} />
              <Field label="Category slug" value={r.slug} onChange={v => setRooms(rooms.map((x, j) => j === i ? { ...x, slug: v } : x))} />
            </div>
            <ImageUploadField label="Image" value={r.img} onChange={v => setRooms(rooms.map((x, j) => j === i ? { ...x, img: v } : x))} />
          </div>
        ))}
        <button onClick={() => setRooms([...rooms, { label: "", img: "", slug: "" }])}
          className="flex items-center gap-1 text-xs font-semibold text-[hsl(38,52%,40%)]"><Plus className="w-3.5 h-3.5" /> Add room</button>
      </SectionCard>

      <SectionCard title="Trust Strip" onSave={() => save("trust", { items: trust })} saving={savingSection === "trust"}>
        {trust.map((t, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <Field label={`Item ${i + 1} title`} value={t.label} onChange={v => setTrust(trust.map((x, j) => j === i ? { ...x, label: v } : x))} />
            <Field label="Subtitle" value={t.sub} onChange={v => setTrust(trust.map((x, j) => j === i ? { ...x, sub: v } : x))} />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Marquee Strip" onSave={() => save("marquee", { words: marquee.split(",").map(s => s.trim()).filter(Boolean) })} saving={savingSection === "marquee"}>
        <Field label="Words (comma separated)" textarea value={marquee} onChange={setMarquee} />
      </SectionCard>

      <SectionCard title="Top Bar" onSave={() => save("topbar", topbar as unknown as Record<string, unknown>)} saving={savingSection === "topbar"}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Text" value={topbar.text} onChange={v => setTopbar({ ...topbar, text: v })} />
          <Field label="Phone" value={topbar.phone} onChange={v => setTopbar({ ...topbar, phone: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Footer" onSave={() => save("footer", footer as unknown as Record<string, unknown>)} saving={savingSection === "footer"}>
        <Field label="About text" textarea value={footer.about} onChange={v => setFooter({ ...footer, about: v })} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Phone" value={footer.phone} onChange={v => setFooter({ ...footer, phone: v })} />
          <Field label="Email" value={footer.email} onChange={v => setFooter({ ...footer, email: v })} />
          <Field label="Hours" value={footer.hours} onChange={v => setFooter({ ...footer, hours: v })} />
        </div>
      </SectionCard>
    </div>
  );
}
