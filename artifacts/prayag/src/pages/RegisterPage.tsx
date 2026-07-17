import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Phone } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "At least 6 characters"),
  phone: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuthStore();
  const { toast } = useToast();
  const register = useRegisterUser();

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  function onSubmit(data: Form) {
    register.mutate({ data: { ...data, role: "customer" } }, {
      onSuccess: (res) => {
        setUser(res.user as any, res.token);
        toast({ title: "Account created!", description: `Welcome, ${res.user.name}!` });
        setLocation("/account");
      },
      onError: () => toast({ title: "Registration failed", description: "Email may already be in use", variant: "destructive" }),
    });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-2xl font-black text-[hsl(38,52%,40%)]">PRAYAG</div>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of happy customers</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: "name" as const, label: "Full Name", icon: User, type: "text", placeholder: "Your full name" },
            { name: "email" as const, label: "Email Address", icon: Mail, type: "email", placeholder: "you@example.com" },
            { name: "password" as const, label: "Password", icon: Lock, type: "password", placeholder: "Min 6 characters" },
            { name: "phone" as const, label: "Phone (optional)", icon: Phone, type: "tel", placeholder: "+91 98765 43210" },
          ].map(({ name, label, icon: Icon, type, placeholder }) => (
            <div key={name}>
              <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...form.register(name)} type={type} placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[hsl(42,62%,68%)] transition-colors"
                  data-testid={`input-${name}`} />
              </div>
              {form.formState.errors[name] && <p className="text-xs text-red-500 mt-0.5">{form.formState.errors[name]?.message}</p>}
            </div>
          ))}

          <button type="submit" disabled={register.isPending}
            className="w-full bg-[hsl(24,10%,16%)] text-white font-bold py-3 rounded-xl hover:bg-[hsl(24,14%,8%)] transition-colors disabled:opacity-50"
            data-testid="button-submit-register">
            {register.isPending ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[hsl(38,52%,40%)] font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
