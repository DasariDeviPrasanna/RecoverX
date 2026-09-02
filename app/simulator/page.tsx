"use client";

import { useState } from "react";
import Link from "next/link";

type SimulationResult = {
  payments: number;
  revenueAtRisk: number;
  recoveryPotential: number;
  recoverablePayments: number;
  estimatedRecovered: number;
  recoveryRate: number;
};

export default function SimulatorPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  function runSimulation() {
    setRunning(true);
    setResult(null);

    setTimeout(() => {
      setResult({
        payments: 25,
        revenueAtRisk: 184000,
        recoveryPotential: 132000,
        recoverablePayments: 17,
        estimatedRecovered: 96000,
        recoveryRate: 52.2,
      });

      setRunning(false);
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-[#08070D] text-white p-8">
      <div className="max-w-6xl mx-auto">

        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          ← Back to Overview
        </Link>

        <div className="mt-6">
          <p className="text-purple-400 text-xs tracking-[0.3em]">
            WHAT-IF ENGINE
          </p>

          <h1 className="text-5xl font-serif mt-3">
            Recovery Simulator
          </h1>

          <p className="text-gray-400 mt-3 max-w-2xl">
            Simulate how the RecoverX AI agent could recover failed
            revenue before executing real recovery actions.
          </p>
        </div>

        {/* Simulation Inputs */}

        <div className="grid md:grid-cols-3 gap-5 mt-10">

          <StatCard
            label="Payments Analyzed"
            value="25"
          />

          <StatCard
            label="Revenue At Risk"
            value="₹1,84,000"
          />

          <StatCard
            label="Recovery Opportunity"
            value="₹1,32,000"
          />

        </div>

        {/* Run Simulation */}

        <div className="border border-purple-500/20 bg-purple-500/[0.04] rounded-2xl p-8 mt-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <p className="text-purple-400 text-xs tracking-widest">
                AI SIMULATION
              </p>

              <h2 className="text-2xl font-semibold mt-2">
                Run recovery scenario
              </h2>

              <p className="text-gray-500 mt-2 max-w-xl">
                RecoverX evaluates payment failures, predicts recovery
                probability, applies retry limits and estimates the
                revenue that could be recovered.
              </p>
            </div>

            <button
              onClick={runSimulation}
              disabled={running}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-7 py-4 rounded-xl font-medium whitespace-nowrap"
            >
              {running ? "Running..." : "Run Simulation"}
            </button>

          </div>

          {/* Progress */}

          {running && (
            <div className="mt-8">

              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>AI analyzing payment portfolio</span>
                <span>Processing</span>
              </div>

              <div className="h-2 bg-white/5 rounded-full overflow-hidden">

                <div className="h-full bg-purple-500 rounded-full animate-pulse w-3/4" />

              </div>

            </div>
          )}

        </div>

        {/* Results */}

        {result && (
          <div className="mt-8">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />

              <h2 className="text-xl font-semibold">
                Simulation Complete
              </h2>

            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

              <ResultCard
                label="Recoverable Payments"
                value={String(result.recoverablePayments)}
              />

              <ResultCard
                label="Recovery Potential"
                value={`₹${result.recoveryPotential.toLocaleString("en-IN")}`}
              />

              <ResultCard
                label="Estimated Recovered"
                value={`₹${result.estimatedRecovered.toLocaleString("en-IN")}`}
                highlight
              />

              <ResultCard
                label="Estimated Recovery Rate"
                value={`${result.recoveryRate}%`}
                highlight
              />

            </div>

            <div className="border border-emerald-500/20 bg-emerald-500/[0.04] rounded-2xl p-7 mt-6">

              <p className="text-emerald-400 text-xs tracking-widest">
                AI OUTCOME
              </p>

              <h3 className="text-2xl font-semibold mt-3">
                ₹
                {result.estimatedRecovered.toLocaleString("en-IN")}
                {" "}potentially recoverable
              </h3>

              <p className="text-gray-500 mt-3">
                Based on {result.payments} analyzed payments and
                RecoverX recovery decision rules.
              </p>

            </div>

          </div>
        )}

        {/* Decision Flow */}

        <div className="mt-10">

          <p className="text-gray-500 text-xs tracking-widest">
            SIMULATION PIPELINE
          </p>

          <div className="grid md:grid-cols-5 gap-3 mt-5">

            {[
              "Detect",
              "Diagnose",
              "Decide",
              "Validate",
              "Estimate",
            ].map((step, index) => (
              <div
                key={step}
                className="border border-white/10 rounded-xl p-5 bg-white/[0.02]"
              >
                <span className="text-purple-400 text-xs font-mono">
                  0{index + 1}
                </span>

                <p className="font-semibold mt-3">
                  {step}
                </p>

                <p className="text-gray-600 text-xs mt-2">
                  {index === 0 && "Find revenue at risk"}
                  {index === 1 && "Understand failure"}
                  {index === 2 && "Choose action"}
                  {index === 3 && "Apply policy"}
                  {index === 4 && "Measure opportunity"}
                </p>
              </div>
            ))}

          </div>

        </div>

      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] rounded-2xl p-6">

      <p className="text-gray-500 text-sm">
        {label}
      </p>

      <p className="text-3xl font-semibold mt-3">
        {value}
      </p>

    </div>
  );
}

function ResultCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-2xl p-6 ${
        highlight
          ? "border-emerald-500/20 bg-emerald-500/[0.03]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >

      <p className="text-gray-500 text-sm">
        {label}
      </p>

      <p
        className={`text-3xl font-semibold mt-3 ${
          highlight ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>

    </div>
  );
}