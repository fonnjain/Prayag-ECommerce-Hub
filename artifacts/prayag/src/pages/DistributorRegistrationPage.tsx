import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle, Truck, TrendingUp, MapPin, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DistributorRegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: "", contactName: "", email: "", phone: "",
    city: "", state: "", pincode: "", gstNumber: "", territory: "",
    annualTarget: "", creditLimit: "",
  });

  const states = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh"];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.businessName || !form.contactName || !form.email || !form.phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/distributor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        toast({ title: err.error || "Registration failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
          <p className="text-gray-500 mb-2">Thank you for applying to be a PRAYAG Distributor.</p>
          <p className="text-sm text-gray-400 mb-8">Our regional team will contact you within 2–3 business days to verify documents and finalize your territory.</p>
          <Link href="/">
            <button className="bg-[hsl(215,100%,34%)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[hsl(215,100%,28%)] transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-sm font-semibold text-[hsl(215,100%,34%)] uppercase tracking-widest mb-2">Become a Partner</div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">PRAYAG Distributor Registration</h1>
        <p className="text-gray-500 max-w-xl mx-auto">Join our exclusive distributor network. Get premium margins, dedicated territory, and priority support from India's leading plumbing brand.</p>
      </div>

      {/* Benefits */}
      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        {[
          { icon: TrendingUp, title: "Higher Margins", desc: "Up to 35% distributor margin vs. 20% dealer" },
          { icon: MapPin, title: "Exclusive Territory", desc: "Protected zone — no overlap with other distributors" },
          { icon: CreditCard, title: "Credit Facility", desc: "Up to ₹25L credit limit based on track record" },
          { icon: Truck, title: "Direct Supply", desc: "Directly from our factory, no middlemen" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-[hsl(215,100%,34%)] transition-colors">
            <div className="w-10 h-10 bg-[hsl(215,100%,34%)]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5 text-[hsl(215,100%,34%)]" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">{title}</h3>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Difference: Dealer vs Distributor */}
      <div className="bg-[hsl(215,100%,34%)]/5 border border-[hsl(215,100%,34%)]/20 rounded-xl p-5 mb-10">
        <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Dealer vs. Distributor — What's the Difference?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(215,100%,34%)]/20">
                <th className="text-left py-2 pr-4 text-gray-500 font-medium">Feature</th>
                <th className="text-left py-2 pr-4 text-[hsl(215,100%,34%)] font-bold">Dealer</th>
                <th className="text-left py-2 font-bold text-[hsl(215,100%,28%)]">Distributor ★</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(215,100%,34%)]/10">
              {[
                ["Margin", "15–20%", "25–35%"],
                ["Territory", "City-level", "District / Zone-level"],
                ["Min. Order", "₹25,000", "₹1,00,000"],
                ["Credit Limit", "Up to ₹5L", "Up to ₹25L"],
                ["Supply Source", "Via Distributor", "Direct from Factory"],
                ["Dealer Network", "—", "Manage sub-dealers"],
              ].map(([f, d, dist]) => (
                <tr key={f}>
                  <td className="py-2 pr-4 text-gray-500">{f}</td>
                  <td className="py-2 pr-4 text-gray-700">{d}</td>
                  <td className="py-2 font-semibold text-[hsl(215,100%,28%)]">{dist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-[hsl(215,100%,34%)] px-6 py-4">
          <h2 className="text-white font-bold text-lg">Distributor Application Form</h2>
          <p className="text-blue-200 text-sm">All fields marked * are required</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Business Info */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide border-b pb-2">Business Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: "businessName", label: "Business Name *", placeholder: "e.g. Sharma Distributors Pvt. Ltd." },
                { name: "contactName", label: "Contact Person *", placeholder: "Full name" },
                { name: "email", label: "Email Address *", placeholder: "business@email.com" },
                { name: "phone", label: "Phone Number *", placeholder: "+91 98765 43210" },
                { name: "gstNumber", label: "GST Number", placeholder: "27AAAAA0000A1Z5" },
                { name: "territory", label: "Preferred Territory", placeholder: "e.g. North Maharashtra" },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input name={name} value={(form as any)[name]} onChange={handleChange} placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[hsl(215,100%,34%)] focus:border-transparent outline-none" />
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide border-b pb-2">Location</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="City"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[hsl(215,100%,34%)] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                <select name="state" value={form.state} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[hsl(215,100%,34%)] focus:border-transparent outline-none bg-white">
                  <option value="">Select State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[hsl(215,100%,34%)] focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          {/* Business Scale */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide border-b pb-2">Business Scale (Optional)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expected Annual Business (₹)</label>
                <input name="annualTarget" value={form.annualTarget} onChange={handleChange} type="number" placeholder="e.g. 5000000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[hsl(215,100%,34%)] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Credit Limit Requested (₹)</label>
                <input name="creditLimit" value={form.creditLimit} onChange={handleChange} type="number" placeholder="e.g. 1000000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[hsl(215,100%,34%)] focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={loading}
              className="bg-[hsl(215,100%,34%)] text-white font-bold px-10 py-3 rounded-xl hover:bg-[hsl(215,100%,28%)] transition-colors disabled:opacity-60 flex items-center gap-2"
              data-testid="button-submit-distributor-reg">
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" /> : null}
              Submit Application
            </button>
            <Link href="/dealer-registration">
              <span className="text-sm text-[hsl(215,100%,34%)] hover:underline cursor-pointer">Apply as Dealer instead →</span>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
