import { Link } from "wouter";
import { SiInstagram, SiX, SiFacebook, SiYoutube } from "react-icons/si";
import { Phone, Mail, Clock } from "lucide-react";
import logoWhite from "@assets/Prayag_logo_W_1783664087488.png";
import { useSiteContent } from "@/lib/siteContent";

const shopLinks = [
  { label: "All Products", href: "/products" },
  { label: "CP Faucets", href: "/products?category=cp-faucets" },
  { label: "PTMT Faucets", href: "/products?category=ptmt-faucets" },
  { label: "Kitchen Sinks", href: "/products?category=kitchen-sinks" },
  { label: "Water Heaters", href: "/products?category=water-heaters" },
  { label: "Bathroom Accessories", href: "/products?category=bathroom-accessories" },
];

const infoLinks = [
  { label: "About Us", href: "/about" },
  { label: "Dealer Locator", href: "/dealer-registration" },
  { label: "FAQs", href: "/faq" },
  { label: "Track Order", href: "/account/orders" },
  { label: "Download Catalogue", href: "/products" },
  { label: "Careers", href: "/careers" },
];

const serviceLinks = [
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Bulk Order", href: "/dealer" },
];

export default function Footer() {
  const { section } = useSiteContent();
  const footer = section("footer");
  return (
    <footer className="bg-[hsl(24,14%,8%)] text-gray-300 mt-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 gold-divider" />
      <div className="absolute -top-24 right-[10%] w-72 h-72 bg-[hsl(38,52%,52%)]/10 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <img src={logoWhite} alt="Prayag" className="h-9 w-auto object-contain mb-1" />
            <div className="text-[10px] text-[hsl(42,62%,68%)] tracking-[0.28em] uppercase mb-4">Strong · Beautiful · Prayag</div>
            <p className="text-sm leading-relaxed text-gray-400 mb-5 max-w-xs">
              {footer.about}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: SiFacebook, label: "Facebook", href: "https://www.facebook.com/prayagindia" },
                { Icon: SiInstagram, label: "Instagram", href: "https://www.instagram.com/prayagindia" },
                { Icon: SiX, label: "X", href: "https://x.com/prayagindia" },
                { Icon: SiYoutube, label: "YouTube", href: "https://www.youtube.com/@prayagindia" },
              ].map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[hsl(42,62%,68%)] hover:text-[hsl(24,14%,8%)] hover:border-[hsl(42,62%,68%)] transition-all" aria-label={label}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Shop" links={shopLinks} />
          <FooterCol title="Information" links={infoLinks} />
          <FooterCol title="Customer Service" links={serviceLinks} />

          {/* Need Help */}
          <div>
            <h3 className="text-white font-display text-base mb-4">Need Help?</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[hsl(42,62%,68%)] mt-0.5 flex-shrink-0" />
                <div><div className="text-[10px] uppercase tracking-wide text-gray-500">Call Us</div><a href={`tel:${footer.phone.replace(/\s/g, "")}`} className="text-white font-semibold hover:text-[hsl(42,62%,68%)] transition-colors">{footer.phone}</a></div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[hsl(42,62%,68%)] mt-0.5 flex-shrink-0" />
                <div><div className="text-[10px] uppercase tracking-wide text-gray-500">Email</div><a href={`mailto:${footer.email}`} className="hover:text-[hsl(42,62%,68%)] transition-colors">{footer.email}</a></div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[hsl(42,62%,68%)] mt-0.5 flex-shrink-0" />
                <div><div className="text-[10px] uppercase tracking-wide text-gray-500">Hours</div><span>{footer.hours}</span></div>
              </li>
            </ul>
          </div>
        </div>

        <div className="gold-divider mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Prayag Industries Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 mr-1">We Accept</span>
            {["VISA", "MC", "RuPay", "UPI"].map(m => (
              <span key={m} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-semibold text-gray-300">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-white font-display text-base mb-4">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map(l => (
          <li key={l.label}>
            <Link href={l.href} className="text-gray-400 hover:text-[hsl(42,62%,68%)] hover:pl-1 transition-all inline-block">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
