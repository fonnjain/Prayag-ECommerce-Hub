import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useGetSiteContent, useUpdateSiteContent, getGetSiteContentQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cmsDefaults, mergeWithDefaults, type CmsSectionKey, type HeroContent, type CollectionCard, type RoomCard, type TrustItem, type TopbarContent, type FooterContent, type AboutContent, type ContactContent, type DealerRegContent, type FaqContent, type PoliciesContent, type CareersContent } from "@/lib/siteContent";
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
  const [about, setAbout] = useState<AboutContent>(cmsDefaults.about);
  const [contact, setContact] = useState<ContactContent>(cmsDefaults.contact);
  const [dealerReg, setDealerReg] = useState<DealerRegContent>(cmsDefaults.dealerReg);
  const [faq, setFaq] = useState<FaqContent>(cmsDefaults.faq);
  const [policies, setPolicies] = useState<PoliciesContent>(cmsDefaults.policies);
  const [careers, setCareers] = useState<CareersContent>(cmsDefaults.careers);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [tab, setTab] = useState("home");

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
    setAbout(mergeWithDefaults(cmsDefaults.about, content.about));
    setContact(mergeWithDefaults(cmsDefaults.contact, content.contact));
    setDealerReg(mergeWithDefaults(cmsDefaults.dealerReg, content.dealerReg));
    setFaq(mergeWithDefaults(cmsDefaults.faq, content.faq));
    setPolicies(mergeWithDefaults(cmsDefaults.policies, content.policies));
    setCareers(mergeWithDefaults(cmsDefaults.careers, content.careers));
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

  const tabs: { key: string; label: string }[] = [
    { key: "home", label: "Home Page" },
    { key: "global", label: "Top Bar & Footer" },
    { key: "about", label: "About Page" },
    { key: "faq", label: "FAQ Page" },
    { key: "policies", label: "Policy Pages" },
    { key: "careers", label: "Careers Page" },
    { key: "dealer", label: "Dealer Page" },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            data-testid={`tab-${t.key}`}
            className={`text-xs font-bold px-3.5 py-2 rounded-lg border transition-colors ${tab === t.key
              ? "bg-[hsl(38,52%,40%)] text-white border-[hsl(38,52%,40%)]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[hsl(38,52%,40%)]/40"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "home" && <>
      <SectionCard title="Hero Section" onSave={() => save("hero", hero as unknown as Record<string, unknown>)} saving={savingSection === "hero"}>
        <Field label="Badge text" value={hero.badge} onChange={v => setHero({ ...hero, badge: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" value={hero.titleLine1} onChange={v => setHero({ ...hero, titleLine1: v })} />
          <Field label="Title accent (gold word)" value={hero.titleAccent} onChange={v => setHero({ ...hero, titleAccent: v })} />
        </div>
        <Field label="Subtitle" textarea value={hero.subtitle} onChange={v => setHero({ ...hero, subtitle: v })} />
        <ImageUploadField label="Hero background image (blank = default)" value={hero.backgroundImage} onChange={v => setHero({ ...hero, backgroundImage: v })} />
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
      </>}

      {tab === "global" && <>
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
      </>}

      {tab === "about" && <>
      <SectionCard title="About Page" onSave={() => save("about", about as unknown as Record<string, unknown>)} saving={savingSection === "about"}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hero title" value={about.heroTitle} onChange={v => setAbout({ ...about, heroTitle: v })} />
          <Field label="Hero subtitle" value={about.heroSubtitle} onChange={v => setAbout({ ...about, heroSubtitle: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Story heading" value={about.storyHeading} onChange={v => setAbout({ ...about, storyHeading: v })} />
          <Field label="Story accent (gold word)" value={about.storyAccent} onChange={v => setAbout({ ...about, storyAccent: v })} />
        </div>
        <Field label="Story paragraph 1" textarea value={about.storyPara1} onChange={v => setAbout({ ...about, storyPara1: v })} />
        <Field label="Story paragraph 2" textarea value={about.storyPara2} onChange={v => setAbout({ ...about, storyPara2: v })} />
        <ImageUploadField label="Story image" value={about.storyImage} onChange={v => setAbout({ ...about, storyImage: v })} />
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-bold text-gray-700 mb-2">Stats strip</div>
          <div className="grid grid-cols-2 gap-3">
            {about.stats.map((s, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-2.5 space-y-2">
                <Field label={`Stat ${i + 1} number`} value={s.n} onChange={v => setAbout({ ...about, stats: about.stats.map((x, j) => j === i ? { ...x, n: v } : x) })} />
                <Field label="Label" value={s.l} onChange={v => setAbout({ ...about, stats: about.stats.map((x, j) => j === i ? { ...x, l: v } : x) })} />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-bold text-gray-700 mb-2">Values ("What We Stand For")</div>
          {about.values.map((v0, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 mb-2">
              <Field label={`Value ${i + 1} title`} value={v0.title} onChange={v => setAbout({ ...about, values: about.values.map((x, j) => j === i ? { ...x, title: v } : x) })} />
              <Field label="Description" value={v0.desc} onChange={v => setAbout({ ...about, values: about.values.map((x, j) => j === i ? { ...x, desc: v } : x) })} />
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-bold text-gray-700 mb-2">Journey timeline</div>
          {about.milestones.map((m, i) => (
            <div key={i} className="flex gap-3 mb-2 items-end">
              <div className="w-24 flex-shrink-0">
                <Field label="Year" value={m.year} onChange={v => setAbout({ ...about, milestones: about.milestones.map((x, j) => j === i ? { ...x, year: v } : x) })} />
              </div>
              <div className="flex-1">
                <Field label="Text" value={m.text} onChange={v => setAbout({ ...about, milestones: about.milestones.map((x, j) => j === i ? { ...x, text: v } : x) })} />
              </div>
              <button onClick={() => setAbout({ ...about, milestones: about.milestones.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600 pb-2.5"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => setAbout({ ...about, milestones: [...about.milestones, { year: "", text: "" }] })}
            className="flex items-center gap-1 text-xs font-semibold text-[hsl(38,52%,40%)]"><Plus className="w-3.5 h-3.5" /> Add milestone</button>
        </div>
        <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
          <Field label="Bottom CTA title" value={about.ctaTitle} onChange={v => setAbout({ ...about, ctaTitle: v })} />
          <Field label="Bottom CTA subtitle" value={about.ctaSubtitle} onChange={v => setAbout({ ...about, ctaSubtitle: v })} />
        </div>
      </SectionCard>
      </>}

      {tab === "faq" && <>
      <SectionCard title="Contact Block (FAQ page)" onSave={() => save("contact", contact as unknown as Record<string, unknown>)} saving={savingSection === "contact"}>
        <Field label="Title" value={contact.title} onChange={v => setContact({ ...contact, title: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Subtitle" value={contact.subtitle} onChange={v => setContact({ ...contact, subtitle: v })} />
          <Field label="Phone" value={contact.phone} onChange={v => setContact({ ...contact, phone: v })} />
        </div>
      </SectionCard>
      </>}

      {tab === "dealer" && <>
      <SectionCard title="Dealer Registration Page" onSave={() => save("dealerReg", dealerReg as unknown as Record<string, unknown>)} saving={savingSection === "dealerReg"}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Badge text" value={dealerReg.badge} onChange={v => setDealerReg({ ...dealerReg, badge: v })} />
          <Field label="Title" value={dealerReg.title} onChange={v => setDealerReg({ ...dealerReg, title: v })} />
        </div>
        <Field label="Intro text" textarea value={dealerReg.intro} onChange={v => setDealerReg({ ...dealerReg, intro: v })} />
        <div>
          <div className="text-xs font-bold text-gray-700 mb-2">Benefits list</div>
          {dealerReg.benefits.map((b, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input value={b} onChange={e => setDealerReg({ ...dealerReg, benefits: dealerReg.benefits.map((x, j) => j === i ? e.target.value : x) })} className={inputCls} />
              <button onClick={() => setDealerReg({ ...dealerReg, benefits: dealerReg.benefits.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => setDealerReg({ ...dealerReg, benefits: [...dealerReg.benefits, ""] })}
            className="flex items-center gap-1 text-xs font-semibold text-[hsl(38,52%,40%)]"><Plus className="w-3.5 h-3.5" /> Add benefit</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stat number (e.g. 10,000+)" value={dealerReg.statNumber} onChange={v => setDealerReg({ ...dealerReg, statNumber: v })} />
          <Field label="Stat text" value={dealerReg.statText} onChange={v => setDealerReg({ ...dealerReg, statText: v })} />
        </div>
      </SectionCard>
      </>}

      {tab === "faq" && <>
      <SectionCard title="FAQ Page" onSave={() => save("faq", faq as unknown as Record<string, unknown>)} saving={savingSection === "faq"}>
        <Field label="Hero subtitle" textarea value={faq.heroSubtitle} onChange={v => setFaq({ ...faq, heroSubtitle: v })} />
        {faq.items.map((f, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-700">Question {i + 1}</div>
              <button onClick={() => setFaq({ ...faq, items: faq.items.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <Field label="Question" value={f.q} onChange={v => setFaq({ ...faq, items: faq.items.map((x, j) => j === i ? { ...x, q: v } : x) })} />
            <Field label="Answer" textarea value={f.a} onChange={v => setFaq({ ...faq, items: faq.items.map((x, j) => j === i ? { ...x, a: v } : x) })} />
          </div>
        ))}
        <button onClick={() => setFaq({ ...faq, items: [...faq.items, { q: "", a: "" }] })}
          className="flex items-center gap-1 text-xs font-semibold text-[hsl(38,52%,40%)]"><Plus className="w-3.5 h-3.5" /> Add question</button>
      </SectionCard>
      </>}

      {tab === "policies" && <>
      <SectionCard title="Policy Pages" onSave={() => save("policies", policies as unknown as Record<string, unknown>)} saving={savingSection === "policies"}>
        <Field label="Contact email (shown at bottom of every policy)" value={policies.contactEmail} onChange={v => setPolicies({ ...policies, contactEmail: v })} />
        {(["shipping", "returns", "privacy", "terms"] as const).map(key => {
          const p = policies[key];
          const setP = (next: typeof p) => setPolicies({ ...policies, [key]: next });
          return (
            <div key={key} className="border border-gray-100 rounded-lg p-3 space-y-2">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">{p.title}</div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Page title" value={p.title} onChange={v => setP({ ...p, title: v })} />
                <Field label="Subtitle" value={p.subtitle} onChange={v => setP({ ...p, subtitle: v })} />
              </div>
              {p.sections.map((s, i) => (
                <div key={i} className="border border-gray-50 bg-gray-50/50 rounded-lg p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-gray-500">Section {i + 1}</div>
                    <button onClick={() => setP({ ...p, sections: p.sections.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <Field label="Heading" value={s.h} onChange={v => setP({ ...p, sections: p.sections.map((x, j) => j === i ? { ...x, h: v } : x) })} />
                  <Field label="Text" textarea value={s.p} onChange={v => setP({ ...p, sections: p.sections.map((x, j) => j === i ? { ...x, p: v } : x) })} />
                </div>
              ))}
              <button onClick={() => setP({ ...p, sections: [...p.sections, { h: "", p: "" }] })}
                className="flex items-center gap-1 text-xs font-semibold text-[hsl(38,52%,40%)]"><Plus className="w-3.5 h-3.5" /> Add section</button>
            </div>
          );
        })}
      </SectionCard>
      </>}

      {tab === "careers" && <>
      <SectionCard title="Careers Page" onSave={() => save("careers", careers as unknown as Record<string, unknown>)} saving={savingSection === "careers"}>
        <Field label="Hero subtitle" textarea value={careers.heroSubtitle} onChange={v => setCareers({ ...careers, heroSubtitle: v })} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Intro badge" value={careers.introBadge} onChange={v => setCareers({ ...careers, introBadge: v })} />
          <Field label="Intro title" value={careers.introTitle} onChange={v => setCareers({ ...careers, introTitle: v })} />
          <Field label="Intro accent (gold word)" value={careers.introAccent} onChange={v => setCareers({ ...careers, introAccent: v })} />
        </div>
        <Field label="Intro text" textarea value={careers.introText} onChange={v => setCareers({ ...careers, introText: v })} />
        <Field label="Careers email" value={careers.email} onChange={v => setCareers({ ...careers, email: v })} />
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-bold text-gray-700 mb-2">Perks</div>
          <div className="grid grid-cols-2 gap-3">
            {careers.perks.map((p, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-2.5 space-y-2">
                <Field label={`Perk ${i + 1} title`} value={p.title} onChange={v => setCareers({ ...careers, perks: careers.perks.map((x, j) => j === i ? { ...x, title: v } : x) })} />
                <Field label="Description" textarea value={p.desc} onChange={v => setCareers({ ...careers, perks: careers.perks.map((x, j) => j === i ? { ...x, desc: v } : x) })} />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-bold text-gray-700 mb-2">Open positions</div>
          {careers.openings.map((o, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-2.5 space-y-2 mb-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-gray-500">Position {i + 1}</div>
                <button onClick={() => setCareers({ ...careers, openings: careers.openings.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role" value={o.role} onChange={v => setCareers({ ...careers, openings: careers.openings.map((x, j) => j === i ? { ...x, role: v } : x) })} />
                <Field label="Department" value={o.dept} onChange={v => setCareers({ ...careers, openings: careers.openings.map((x, j) => j === i ? { ...x, dept: v } : x) })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location" value={o.location} onChange={v => setCareers({ ...careers, openings: careers.openings.map((x, j) => j === i ? { ...x, location: v } : x) })} />
                <Field label="Type (e.g. Full-time)" value={o.type} onChange={v => setCareers({ ...careers, openings: careers.openings.map((x, j) => j === i ? { ...x, type: v } : x) })} />
              </div>
            </div>
          ))}
          <button onClick={() => setCareers({ ...careers, openings: [...careers.openings, { role: "", dept: "", location: "", type: "Full-time" }] })}
            className="flex items-center gap-1 text-xs font-semibold text-[hsl(38,52%,40%)]"><Plus className="w-3.5 h-3.5" /> Add position</button>
        </div>
      </SectionCard>
      </>}
    </div>
  );
}
