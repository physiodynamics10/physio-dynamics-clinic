"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import PhysioLogo from "./physio-logo";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="rounded-3xl border border-[#d2eff2] bg-white/90 p-8 shadow-xl shadow-[#0692ab]/10 backdrop-blur-xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <PhysioLogo />
          <h1 className="text-xl font-extrabold text-[#056b7d] tracking-tight mt-2">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs">
            Enter your clinic email to receive a password reset link.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={28} />
            </div>

            <h2 className="text-base font-bold text-[#056b7d]">
              Check Your Email Inbox
            </h2>

            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              We sent password reset instructions to <strong>{email}</strong>.
            </p>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:underline pt-2"
            >
              Back to Login Page <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                Email Address
              </label>

              <input
                type="email"
                placeholder="physiodynamics10@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-slate-500 font-medium">
              Remembered your password?{" "}
              <Link href="/auth/login" className="font-bold text-[#0692ab] hover:underline">
                Log In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
