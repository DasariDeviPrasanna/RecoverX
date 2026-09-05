"use client";

import { useRouter } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070B] text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[-100px] h-[450px] w-[450px] rounded-full bg-violet-500/10 blur-[120px]" />

        <div className="absolute right-[-100px] top-[35%] h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 0), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/50 backdrop-blur-xl lg:grid-cols-2">

          {/* LEFT SIDE */}
          <section className="hidden flex-col justify-between border-r border-white/10 p-12 lg:flex">
            <div>
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-xl font-black text-black">
                  R
                </div>

                <div>
                  <div className="text-xl font-bold tracking-tight">
                    RecoverX
                  </div>

                  <div className="text-xs text-zinc-500">
                    AI Revenue Intelligence
                  </div>
                </div>
              </div>

              {/* Hero */}
              <div className="mt-24">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                  AI RECOVERY AGENT ONLINE
                </div>

                <h1 className="max-w-lg text-5xl font-bold leading-[1.08] tracking-tight">
                  Turn failed payments
                  <br />

                  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    into recovered revenue.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400">
                  Create your merchant workspace and let RecoverX
                  intelligently detect, diagnose and recover
                  revenue at risk.
                </p>
              </div>

              {/* Pipeline */}
              <div className="mt-12 grid grid-cols-4 gap-3">
                {[
                  ["01", "Detect"],
                  ["02", "Diagnose"],
                  ["03", "Decide"],
                  ["04", "Recover"],
                ].map(([number, title]) => (
                  <div
                    key={number}
                    className="rounded-xl border border-white/10 bg-white/[0.025] p-3"
                  >
                    <div className="text-[10px] font-bold text-zinc-600">
                      {number}
                    </div>

                    <div className="mt-2 text-xs font-semibold text-zinc-300">
                      {title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 text-xs text-zinc-600">
              Intelligent recovery infrastructure for modern merchants.
            </div>
          </section>

          {/* RIGHT SIDE */}
          <section className="p-7 sm:p-10 lg:p-12">
            {/* Mobile Logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 font-black text-black">
                R
              </div>

              <div>
                <div className="font-bold">
                  RecoverX
                </div>

                <div className="text-xs text-zinc-500">
                  AI Revenue Intelligence
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-md">
              {/* Heading */}
              <div className="mb-7">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Merchant Registration
                </p>

                <h2 className="text-3xl font-bold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Set up your RecoverX recovery command center.
                </p>
              </div>

              {/* Signup Form */}
              <SignupForm />

              {/* Terms */}
              <div className="mt-8 text-center text-xs leading-5 text-zinc-600">
                By creating an account, you agree to the RecoverX
                merchant terms and privacy policy.
              </div>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-5 w-full text-center text-xs text-zinc-600 transition hover:text-zinc-400"
              >
                Back to Sign In
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}