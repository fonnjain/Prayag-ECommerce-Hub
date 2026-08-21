import { Link } from "wouter";

type PublishedVideo = {
  title: string;
  description: string;
  embedUrl: string;
};

// Add only approved, publicly embeddable video URLs here. Until then the page
// intentionally shows its honest empty state instead of placeholder videos.
const PUBLISHED_VIDEOS: PublishedVideo[] = [];

export default function VideosGalleryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#0047AB] text-white pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,hsl(var(--gold))_0%,transparent_60%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-8 h-[1px] bg-gold"></div>
            <span className="text-gold uppercase tracking-widest text-xs font-bold">Showroom</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display mb-6">
            Video Gallery
          </h1>
          <p className="text-white/80 max-w-2xl text-lg mb-12 font-light leading-relaxed">
            Experience our products in motion. Installation guides, feature highlights, and brand stories.
          </p>
          
          <div className="flex items-center gap-8 border-b border-white/20 pb-0">
            <Link href="/gallery/photos" className="text-white/60 hover:text-white pb-3 transition-colors text-sm tracking-wide uppercase font-medium">
              Photography
            </Link>
            <span className="text-gold border-b-2 border-gold pb-3 font-medium text-sm tracking-wide uppercase">Videography</span>
          </div>
        </div>
      </section>

      {PUBLISHED_VIDEOS.length > 0 ? (
        <section className="max-w-7xl mx-auto w-full px-4 py-14 grid gap-8 md:grid-cols-2">
          {PUBLISHED_VIDEOS.map((video) => (
            <article key={video.embedUrl} className="rounded-xl overflow-hidden bg-card border border-border shadow-sm">
              <div className="aspect-video bg-black">
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-display text-foreground mb-2">{video.title}</h2>
                <p className="text-muted-foreground">{video.description}</p>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="flex-1 flex items-center justify-center px-4 py-20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--secondary))_0%,transparent_70%)] opacity-50 pointer-events-none"></div>
          <div className="max-w-xl w-full text-center relative z-10">
            <div className="w-24 h-24 mx-auto bg-card rounded-full flex items-center justify-center mb-8 shadow-sm border border-border relative overflow-hidden">
              <svg className="w-8 h-8 text-[#0047AB] ml-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" />
              </svg>
              <div className="absolute inset-0 bg-[#0047AB]/5 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Cinematic showcase in progress
            </h2>
            <div className="w-16 h-1 bg-gold mx-auto mb-6 rounded-full"></div>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed font-light">
              We are meticulously crafting a series of videos to showcase the engineering, installation, and elegance of our collections. Our video gallery will be unveiled soon.
            </p>
            <Link href="/gallery/photos" className="inline-flex items-center justify-center px-8 py-3.5 bg-[#0047AB] text-white font-medium rounded-md hover:bg-[#003580] transition-all shadow-md hover-elevate group">
              <span className="mr-2">Explore Photo Gallery</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
