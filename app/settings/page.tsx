"use client";

import { useState } from "react";
import Link from "next/link";
import BackToOverview from "@/components/layout/BackToOverview";
<BackToOverview />
export default function SettingsPage() {
  const [automaticRecovery, setAutomaticRecovery] = useState(true);
  const [humanApproval, setHumanApproval] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);
  const [saved, setSaved] = useState(false);

  function savePolicy() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-[#08070D] text-white p-8">
      <div className="max-w-4xl mx-auto">

        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          ← Back to Overview
        </Link>

        <div className="mt-6">
          <p className="text-purple-400 text-xs tracking-[0.3em]">
            GOVERNANCE
          </p>

          <h1 className="text-5xl font-serif mt-3">
            Recovery Policy
          </h1>

          <p className="text-gray-400 mt-3">
            Define what the RecoverX agent is allowed to do.
          </p>
        </div>

        <div className="space-y-5 mt-10">

          {/* Automatic Recovery */}

          <div className="border border-white/10 bg-white/[0.025] rounded-2xl p-6">

            <div className="flex items-center justify-between gap-5">

              <div>
                <h2 className="text-xl font-semibold">
                  Automatic Recovery
                </h2>

                <p className="text-gray-500 mt-2">
                  Allow RecoverX to execute eligible recovery actions
                  automatically.
                </p>
              </div>

              <button
                onClick={() =>
                  setAutomaticRecovery(!automaticRecovery)
                }
                className={`w-14 h-8 rounded-full p-1 transition ${
                  automaticRecovery
                    ? "bg-purple-600"
                    : "bg-gray-700"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full transition ${
                    automaticRecovery
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>

            </div>

          </div>

          {/* Human Approval */}

          <div className="border border-white/10 bg-white/[0.025] rounded-2xl p-6">

            <div className="flex items-center justify-between gap-5">

              <div>
                <h2 className="text-xl font-semibold">
                  Human Approval
                </h2>

                <p className="text-gray-500 mt-2">
                  Require merchant approval for high-value or
                  uncertain recovery actions.
                </p>
              </div>

              <button
                onClick={() =>
                  setHumanApproval(!humanApproval)
                }
                className={`w-14 h-8 rounded-full p-1 transition ${
                  humanApproval
                    ? "bg-purple-600"
                    : "bg-gray-700"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full transition ${
                    humanApproval
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>

            </div>

          </div>

          {/* Retry Policy */}

          <div className="border border-white/10 bg-white/[0.025] rounded-2xl p-6">

            <h2 className="text-xl font-semibold">
              Maximum Payment Retries
            </h2>

            <p className="text-gray-500 mt-2">
              Stop automatic retry attempts after this number.
            </p>

            <div className="flex items-center gap-4 mt-5">

              <button
                onClick={() =>
                  setMaxRetries(Math.max(1, maxRetries - 1))
                }
                className="w-10 h-10 border border-white/10 rounded-lg"
              >
                −
              </button>

              <div className="text-2xl font-semibold w-10 text-center">
                {maxRetries}
              </div>

              <button
                onClick={() =>
                  setMaxRetries(Math.min(5, maxRetries + 1))
                }
                className="w-10 h-10 border border-white/10 rounded-lg"
              >
                +
              </button>

            </div>

          </div>

        </div>

        {/* Policy Summary */}

        <div className="mt-8 border border-emerald-500/20 bg-emerald-500/[0.04] rounded-2xl p-6">

          <p className="text-emerald-400 text-xs tracking-widest">
            ACTIVE POLICY
          </p>

          <div className="grid md:grid-cols-3 gap-5 mt-5">

            <div>
              <p className="text-gray-500 text-xs">
                AUTO RECOVERY
              </p>

              <p className="mt-1">
                {automaticRecovery ? "Enabled" : "Disabled"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">
                HUMAN APPROVAL
              </p>

              <p className="mt-1">
                {humanApproval ? "Required" : "Not Required"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">
                MAX RETRIES
              </p>

              <p className="mt-1">
                {maxRetries}
              </p>
            </div>

          </div>

        </div>

        <button
          onClick={savePolicy}
          className="mt-6 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl"
        >
          {saved ? "✓ Policy Saved" : "Save Recovery Policy"}
        </button>

      </div>
    </main>
  );
}