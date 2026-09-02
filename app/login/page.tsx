"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    if (
      email === "prasanna@recoverx.demo" &&
      password === "recoverx123"
    ) {
      if (remember) {
        localStorage.setItem("recoverx_logged_in", "true");
      } else {
        sessionStorage.setItem("recoverx_logged_in", "true");
      }

      router.push("/");
      return;
    }

    setError(
      "Invalid credentials. Use the demo merchant account below."
    );

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    setError(
      "Google Sign-In will be connected to your merchant account shortly."
    );
  };

  const handleForgotPassword = () => {
    setError(
      "Password recovery will be available after merchant authentication is connected."
    );
  };

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
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/50 backdrop-blur-xl lg:grid-cols-2">
          {/* Left side */}
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

              <div className="mt-24">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  AI RECOVERY AGENT ONLINE
                </div>

                <h1 className="max-w-lg text-5xl font-bold leading-[1.08] tracking-tight">
                  Recover revenue
                  <br />
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    before it disappears.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400">
                  RecoverX detects payment failures, diagnoses the cause,
                  chooses the safest recovery strategy, and measures the
                  revenue recovered.
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

          {/* Right side */}
          <section className="p-7 sm:p-10 lg:p-12">
            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 font-black text-black">
                R
              </div>

              <div>
                <div className="font-bold">RecoverX</div>
                <div className="text-xs text-zinc-500">
                  AI Revenue Intelligence
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Merchant Portal
                </p>

                <h2 className="text-3xl font-bold tracking-tight">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Sign in to access your recovery command center.
                </p>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                  G
                </span>

                Continue with Google
              </button>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs uppercase tracking-wider text-zinc-600">
                  or
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="mb-5 text-sm font-semibold text-zinc-300">
                Sign in with email
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-5 text-red-300">
                  {error}
                </div>
              )}

              {/* Email form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-medium text-zinc-400"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="merchant@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/30"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-zinc-400"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/30"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black/20"
                  />

                  <span className="text-xs text-zinc-500">
                    Keep me signed in
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3.5 text-sm font-bold text-black shadow-lg shadow-cyan-500/10 transition hover:scale-[1.01] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in to RecoverX"}
                </button>
              </form>

              {/* Demo */}
              <div className="mt-7 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm">⚡</span>

                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Demo Merchant
                  </span>
                </div>

                <p className="text-xs leading-5 text-zinc-500">
                  Use these credentials to explore the RecoverX prototype.
                </p>

                <div className="mt-3 space-y-1 font-mono text-xs text-zinc-400">
                  <div>
                    Email:{" "}
                    <span className="text-zinc-200">
                      prasanna@recoverx.demo
                    </span>
                  </div>

                  <div>
                    Password:{" "}
                    <span className="text-zinc-200">
                      recoverx123
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-xs leading-5 text-zinc-600">
                By continuing, you agree to the RecoverX merchant
                terms and privacy policy.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}