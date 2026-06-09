import { Link } from "wouter";
import { SiInstagram, SiX, SiFacebook, SiYoutube } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <div className="text-2xl font-black text-white tracking-tight">PRAYAG</div>
              <div className="text-xs text-gray-400 tracking-widest uppercase">Plumbing & Sanitaryware</div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              India's trusted plumbing and sanitaryware brand. Delivering quality solutions for homes and commercial spaces since 1985.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[hsl(215,100%,34%)] transition-colors" aria-label="Facebook"><SiFacebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[hsl(215,100%,34%)] transition-colors" aria-label="Instagram"><SiInstagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[hsl(215,100%,34%)] transition-colors" aria-label="Twitter"><SiX className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[hsl(215,100%,34%)] transition-colors" aria-label="YouTube"><SiYoutube className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Our Products</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Manufacturing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Press & Media</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dealer-registration" className="hover:text-white transition-colors">Dealer Locator</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Download Catalogue</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Warranty Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-3">Subscribe for offers and new product launches.</p>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="flex-1 bg-gray-800 border border-gray-600 rounded-l-md px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[hsl(215,100%,34%)]" />
              <button className="bg-[hsl(215,100%,34%)] text-white px-4 py-2 rounded-r-md text-sm font-medium hover:bg-[hsl(215,100%,28%)] transition-colors">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Prayag Industries Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="#" className="hover:text-white transition-colors">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
