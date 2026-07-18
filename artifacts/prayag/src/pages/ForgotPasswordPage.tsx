import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForgotPassword, useResetPassword } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Mail, KeyRound, Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const forgot = useForgotPassword({
    mutation: {
      onSuccess: () => {
        toast({ title: "Code sent", description: "Check your email for the 6-digit reset code." });
        setStep(2);
      },
      onError: (err: any) => toast({ title: "Something went wrong", description: err?.response?.data?.error || "Please try again", variant: "destructive" }),
    },
  });
  const reset = useResetPassword({
    mutation: {
      onSuccess: () => {
        toast({ title: "Password reset!", description: "Please sign in with your new password." });
        setLocation("/login");
      },
      onError: (err: any) => toast({ title: "Reset failed", description: err?.response?.data?.error || "Invalid or expired code", variant: "destructive" }),
    },
  });

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    forgot.mutate({ data: { email: email.trim() } });
  }

  function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please re-enter your new password", variant: "destructive" });
      return;
    }
    reset.mutate({ data: { email: email.trim(), code: code.trim(), newPassword } });
  }

  const inputClass = "w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[hsl(42,62%,68%)] transition-colors";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-2xl font-black text-[hsl(38,52%,40%)]">PRAYAG</div>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 ? "Enter your email to receive a reset code" : "Enter the code from your email and set a new password"}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={sendCode} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className={inputClass} required data-testid="input-forgot-email" />
              </div>
            </div>
            <button type="submit" disabled={forgot.isPending}
              className="w-full bg-[hsl(24,10%,16%)] text-white font-bold py-3 rounded-xl hover:bg-[hsl(24,14%,8%)] transition-colors disabled:opacity-50"
              data-testid="button-send-code">
              {forgot.isPending ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitReset} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">6-Digit Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456"
                  inputMode="numeric" className={`${inputClass} tracking-[0.4em] font-bold`} required data-testid="input-reset-code" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••"
                  className={inputClass} required data-testid="input-new-password" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  className={inputClass} required data-testid="input-confirm-password" />
              </div>
            </div>
            <button type="submit" disabled={reset.isPending || code.length !== 6}
              className="w-full bg-[hsl(24,10%,16%)] text-white font-bold py-3 rounded-xl hover:bg-[hsl(24,14%,8%)] transition-colors disabled:opacity-50"
              data-testid="button-reset-password">
              {reset.isPending ? "Resetting..." : "Reset Password"}
            </button>
            <button type="button" onClick={() => forgot.mutate({ data: { email: email.trim() } })} disabled={forgot.isPending}
              className="w-full text-xs text-[hsl(38,52%,40%)] hover:underline disabled:opacity-50"
              data-testid="button-resend-code">
              {forgot.isPending ? "Resending..." : "Didn't get the code? Resend"}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Remembered your password?{" "}
            <Link href="/login" className="text-[hsl(38,52%,40%)] font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
