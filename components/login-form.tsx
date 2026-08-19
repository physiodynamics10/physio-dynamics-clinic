"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { LogIn, Loader2, Lock } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
      <div className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white/95 p-8 shadow-xl shadow-[#0692ab]/10 backdrop-blur-xl">
        {/* Top Accent Gradient Bar */}
        <div className="h-2 -mx-8 -mt-8 bg-gradient-to-r from-[#056b7d] via-[#0692ab] to-[#01d0d8]" />

        {/* Logo & Header */}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] p-2 shadow-inner ring-1 ring-[#01d0d8]/30">
            <Image
              src="/physio-logo.png"
              alt="Physio Dynamics"
              width={54}
              height={54}
              priority
              className="h-12 w-12 object-contain"
            />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#056b7d]">
            Physio Dynamics
          </h1>

          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#0692ab]">
            Clinic Management System
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Sign in to access your clinic records & treatments
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-[#056b7d]"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="therapist@physio-dynamics.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 px-4 py-3 text-sm font-medium text-[#11282e] transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#01d0d8]/15"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#056b7d]"
              >
                Password
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-[#0692ab] hover:text-[#056b7d] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 px-4 py-3 text-sm font-medium text-[#11282e] transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#01d0d8]/15"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-center text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:shadow-xl hover:shadow-[#0692ab]/30 focus:outline-none focus:ring-4 focus:ring-[#01d0d8]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 border-t border-[#d2eff2] pt-5">
          <span className="flex items-center justify-center gap-1.5 font-medium text-[#056b7d]">
            <Lock size={13} className="text-[#01d0d8]" />
            Secure Physiotherapy System
          </span>
        </div>
      </div>
    </div>
  );
}
