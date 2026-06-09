import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterDealer } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Building2, MapPin, Phone, Mail, FileText } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  businessName: z.string().min(2, "Required"),
  contactName: z.string().min(2, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  pincode: z.string().min(6, "Required"),
  gstNumber: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const benefits = [
  "Exclusive dealer pricing & margins",
  "Free marketing support materials",
  "Dedicated relationship manager",
  "Priority order processing",
  "GST invoice generation",
  "Access to dealer schemes",
];

export default function DealerRegistrationPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const registerDealer = useRegisterDealer();

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { businessName: "", contactName: "", email: "", phone: "", city: "", state: "", pincode: "", gstNumber: "" },
  });

  function onSubmit(data: Form) {
    registerDealer.mutate({ data }, {
      onSuccess: () => {
        setSubmitted(true);
        toast({ title: "Registration submitted!", description: "Our team will contact you within 48 hours." });
      },
      onError: () => toast({ title: "Submission failed", variant: "destructive" }),
    });
  }

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
      <p className="text-gray-500">Our dealer team will review your application and contact you within 48 business hours.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Benefits */}
        <div>
          <div className="inline-block bg-[hsl(215,100%,34%)]/10 text-[hsl(215,100%,34%)] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Dealer Program</div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Partner with PRAYAG</h1>
          <p className="text-gray-500 leading-relaxed mb-6">Join India's fastest-growing plumbing dealer network. Get access to 4500+ premium products, exclusive pricing, and dedicated support.</p>
          <div className="space-y-3">
            {benefits.map(b => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-[hsl(215,100%,34%)] text-white rounded-2xl p-5">
            <div className="text-3xl font-black mb-1">10,000+</div>
            <div className="text-blue-100 text-sm">Active dealers trust PRAYAG across India</div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Dealer Registration Form</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "businessName" as const, label: "Business Name", icon: Building2, span: 2 },
                { name: "contactName" as const, label: "Contact Person", icon: Building2, span: 1 },
                { name: "phone" as const, label: "Phone Number", icon: Phone, span: 1 },
                { name: "email" as const, label: "Email Address", icon: Mail, span: 2 },
                { name: "city" as const, label: "City", icon: MapPin, span: 1 },
                { name: "state" as const, label: "State", icon: MapPin, span: 1 },
                { name: "pincode" as const, label: "Pincode", icon: MapPin, span: 1 },
                { name: "gstNumber" as const, label: "GST Number (optional)", icon: FileText, span: 1 },
              ].map(({ name, label, icon: Icon, span }) => (
                <div key={name} className={span === 2 ? "col-span-2" : ""}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input {...form.register(name)} placeholder={label}
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[hsl(215,100%,34%)] transition-colors"
                      data-testid={`input-dealer-${name}`} />
                  </div>
                  {form.formState.errors[name] && <p className="text-xs text-red-500 mt-0.5">{(form.formState.errors[name] as any)?.message}</p>}
                </div>
              ))}
            </div>
            <button type="submit" disabled={registerDealer.isPending}
              className="w-full bg-[hsl(215,100%,34%)] text-white font-bold py-3 rounded-xl hover:bg-[hsl(215,100%,28%)] transition-colors disabled:opacity-50"
              data-testid="button-submit-dealer">
              {registerDealer.isPending ? "Submitting..." : "Submit Registration"}
            </button>
            <p className="text-xs text-gray-400 text-center">Our team will contact you within 48 hours</p>
          </form>
        </div>
      </div>
    </div>
  );
}
