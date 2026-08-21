import { Link } from "wouter";

export default function PhotosGalleryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="bg-[#0047AB] text-white pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,hsl(var(--gold))_0%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-8 h-[1px] bg-gold" />
            <span className="text-gold uppercase tracking-widest text-xs font-bold">Showroom</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display mb-6">Photo Gallery</h1>
          <p className="text-white/80 max-w-2xl text-lg font-light leading-relaxed">
            Discover PRAYAG through our upcoming collection of spaces, installations, and brand stories.
          </p>
          <div className="flex items-center gap-8 border-b border-white/20 mt-12">
            <span className="text-gold border-b-2 border-gold pb-3 font-medium text-sm tracking-wide uppercase">Photography</span>
            <Link href="/gallery/videos" className="text-white/60 hover:text-white pb-3 transition-colors text-sm tracking-wide uppercase font-medium">
              Videography
            </Link>
          </div>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center px-4 py-20 relative" data-testid="gallery-photos-empty-state">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--secondary))_0%,transparent_70%)] opacity-50 pointer-events-none" />
        <div className="max-w-xl w-full text-center relative z-10">
          <div className="w-24 h-24 mx-auto bg-card rounded-full flex items-center justify-center mb-8 shadow-sm border border-border">
            <svg className="w-9 h-9 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2l1.6-1.6a2 2 0 012.8 0L20 14M14 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">Our photo stories are being curated</h2>
          <div className="w-16 h-1 bg-gold mx-auto mb-6 rounded-full" />
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed font-light">
            This gallery will feature selected PRAYAG spaces and brand photography. Product photos are available on their individual product pages.
          </p>
          <Link href="/products" className="inline-flex items-center justify-center px-8 py-3.5 bg-[#0047AB] text-white font-medium rounded-md hover:bg-[#003580] transition-all shadow-md hover-elevate">
            Explore Products
          </Link>
        </div>
      </section>
    </div>
  );
}