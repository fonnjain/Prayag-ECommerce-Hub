import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLoginUser } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuthStore();
  const { toast } = useToast();
  const login = useLoginUser();

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: Form) {
    login.mutate({ data }, {
      onSuccess: (res) => {
        setUser(res.user as any, res.token);
        toast({ title: "Welcome back!", description: res.user.name });
        if (res.user.role === "admin") setLocation("/admin");
        else if (res.user.role === "dealer") setLocation("/dealer");
        else setLocation("/account");
      },
      onError: () => toast({ title: "Login failed", description: "Invalid email or password", variant: "destructive" }),
    });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-2xl font-black text-[hsl(38,52%,40%)]">PRAYAG</div>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Sign In</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back to your account</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...form.register("email")} type="email" placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[hsl(42,62%,68%)] transition-colors"
                data-testid="input-email" />
            </div>
            {form.formState.errors.email && <p className="text-xs text-red-500 mt-0.5">{form.formState.errors.email.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...form.register("password")} type="password" placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[hsl(42,62%,68%)] transition-colors"
                data-testid="input-password" />
            </div>
            {form.formState.errors.password && <p className="text-xs text-red-500 mt-0.5">{form.formState.errors.password.message}</p>}
          </div>

          <button type="submit" disabled={login.isPending}
            className="w-full bg-[hsl(24,10%,16%)] text-white font-bold py-3 rounded-xl hover:bg-[hsl(24,14%,8%)] transition-colors disabled:opacity-50"
            data-testid="button-submit-login">
            {login.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-[hsl(38,52%,40%)] font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
