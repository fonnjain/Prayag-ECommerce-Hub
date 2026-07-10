import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

export default function PageHero({ title, subtitle, breadcrumb }: { title: string; subtitle?: string; breadcrumb?: string }) {
  const words = title.trim().split(" ");
  const lead = words.slice(0, -1).join(" ");
  const last = words.slice(-1).join(" ");
  return (
    <section className="relative bg-gradient-to-br from-[hsl(24,12%,8%)] via-[hsl(24,10%,10%)] to-[hsl(24,10%,13%)] overflow-hidden">
      <div className="absolute -top-24 right-[8%] w-72 h-72 bg-[hsl(38,52%,52%)]/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 right-0 gold-divider" />
      <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-16">
        <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-4">
          <Link href="/" className="hover:text-[hsl(42,62%,68%)] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[hsl(42,62%,68%)]">{breadcrumb || title}</span>
        </nav>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">
          {lead && <>{lead} </>}<span className="italic text-gradient-gold">{last}</span>
        </h1>
        {subtitle && <p className="text-stone-300 mt-3 max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
