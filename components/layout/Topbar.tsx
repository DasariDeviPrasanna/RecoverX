"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export default function Topbar() {
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userName, setUserName] = useState("Prasanna Dasari");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("recoverx_user_name");
    const photo = localStorage.getItem("recoverx_user_photo");

    if (name) setUserName(name);
    if (photo) setUserPhoto(photo);
  }, []);

  async function handleLogout() {
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Firebase logout error:", error);
    }

    localStorage.removeItem("recoverx_logged_in");
    localStorage.removeItem("recoverx_user_email");
    localStorage.removeItem("recoverx_user_name");
    localStorage.removeItem("recoverx_user_photo");

    sessionStorage.removeItem("recoverx_logged_in");

    router.replace("/login");
  }

  function openHelp() {
    setHelpOpen(true);
    setProfileOpen(false);
  }

  function toggleProfile() {
    setProfileOpen((current) => !current);
    setHelpOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-20 items-center justify-end border-b border-white/[0.07] bg-[#07111F]/95 px-6 backdrop-blur-xl lg:px-8">
        <div className="flex items-center gap-3">

          {/* HELP */}

          <button
            type="button"
            aria-label="Open RecoverX Help"
            onClick={openHelp}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-slate-400 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.07] hover:text-cyan-300"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* PROFILE */}

          <div className="relative">
            <button
              type="button"
              aria-label="Open merchant profile"
              aria-expanded={profileOpen}
              onClick={toggleProfile}
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 transition hover:border-cyan-400/25 hover:bg-white/[0.06]"
            >
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-bold text-cyan-300">
                  PD
                </div>
              )}

              <div className="hidden text-left sm:block">
                <p className="max-w-[150px] truncate text-sm font-semibold text-white">
                  {userName}
                </p>

                <p className="text-[11px] text-slate-500">
                  Merchant Admin
                </p>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* PROFILE DROPDOWN */}

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0D1B2A] p-1.5 shadow-2xl shadow-black/50">

                <div className="border-b border-white/10 px-3 py-3">
                  <p className="text-sm font-semibold text-white">
                    {userName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Merchant Admin
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-400/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HELP MODAL */}

      {helpOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setHelpOpen(false);
            }
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0D1B2A] shadow-2xl shadow-black/60">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <HelpCircle className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    RecoverX Help Center
                  </h2>

                  <p className="text-xs text-slate-500">
                    AI Revenue Recovery Command Center
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close help"
                onClick={() => setHelpOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CONTENT */}

            <div className="max-h-[70vh] overflow-y-auto p-6">

              <div className="grid gap-4 md:grid-cols-2">

                <HelpCard
                  title="What is RecoverX?"
                  text="RecoverX identifies revenue at risk, diagnoses payment failures and recommends bounded recovery actions."
                />

                <HelpCard
                  title="How does recovery work?"
                  text="The AI follows Detect → Diagnose → Decide → Validate → Recover → Prove."
                />

                <HelpCard
                  title="How does AI decide?"
                  text="RecoverX considers payment status, failure reason, retry history, customer risk and recovery probability."
                />

                <HelpCard
                  title="Are retries unlimited?"
                  text="No. Merchant policies and stopping rules limit retries, reminders and escalation."
                />
              </div>

              <div className="mt-5 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  Recovery Flow
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {[
                    "Detect",
                    "Diagnose",
                    "Decide",
                    "Validate",
                    "Recover",
                    "Prove",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-2"
                    >
                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80">
                        {step}
                      </span>

                      {index < 5 && (
                        <span className="text-cyan-400/40">
                          →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Quick Guide
                </p>

                <div className="mt-3 space-y-2">
                  <GuideRow
                    number="01"
                    title="Overview"
                    description="Monitor revenue at risk and recovered revenue."
                  />

                  <GuideRow
                    number="02"
                    title="Recovery Center"
                    description="Review and approve AI recovery recommendations."
                  />

                  <GuideRow
                    number="03"
                    title="AI Agent"
                    description="Inspect diagnosis, confidence and recommended actions."
                  />

                  <GuideRow
                    number="04"
                    title="Simulator"
                    description="Run what-if recovery scenarios without executing real payments."
                  />

                  <GuideRow
                    number="05"
                    title="Audit Trail"
                    description="Review approvals, actions and recovery events."
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.015] px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs text-slate-500">
                  RecoverX AI system ready
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-[#07111F] transition hover:bg-cyan-400"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HelpCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-5">
      <h3 className="text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function GuideRow({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <span className="font-mono text-xs text-cyan-400">
        {number}
      </span>

      <div>
        <p className="text-sm font-medium text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}