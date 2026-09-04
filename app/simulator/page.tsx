"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

type SimulationResult = {
  payments: number;
  revenueAtRisk: number;
  recoveryPotential: number;
  recoverablePayments: number;
  estimatedRecovered: number;
  recoveryRate: number;
};

const pipeline = [
  {
    name: "Detect",
    description: "Find revenue at risk",
    icon: Target,
  },
  {
    name: "Diagnose",
    description: "Understand failure",
    icon: BrainCircuit,
  },
  {
    name: "Decide",
    description: "Choose intervention",
    icon: Sparkles,
  },
  {
    name: "Validate",
    description: "Apply merchant policy",
    icon: ShieldCheck,
  },
  {
    name: "Recover",
    description: "Execute bounded action",
    icon: Zap,
  },
  {
    name: "Prove",
    description: "Record audit evidence",
    icon: FileCheck2,
  },
];

const decisions = [
  {
    cause: "Insufficient funds",
    payments: 6,
    amount: 48000,
    probability: "80%",
    action: "Retry payment",
    guardrail: "Max 2 retries",
  },
  {
    cause: "Bank / gateway timeout",
    payments: 4,
    amount: 32000,
    probability: "75%",
    action: "Retry payment",
    guardrail: "Max 3 retries",
  },
  {
    cause: "Checkout abandoned",
    payments: 4,
    amount: 28000,
    probability: "65%",
    action: "Send reminder",
    guardrail: "Max 2 reminders",
  },
  {
    cause: "Card declined",
    payments: 3,
    amount: 24000,
    probability: "45%",
    action: "Recovery message",
    guardrail: "No blind retry",
  },
];

export default function SimulatorPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [activeStep, setActiveStep] = useState(-1);

  function runSimulation() {
    setRunning(true);
    setResult(null);
    setActiveStep(0);
  }

  useEffect(() => {
    if (!running) return;

    if (activeStep >= pipeline.length - 1) {
      const timer = setTimeout(() => {
        setResult({
          payments: 25,
          revenueAtRisk: 184000,
          recoveryPotential: 132000,
          recoverablePayments: 17,
          estimatedRecovered: 96000,
          recoveryRate: 52.2,
        });

        setRunning(false);
      }, 900);

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setActiveStep((current) => current + 1);
    }, 750);

    return () => clearTimeout(timer);
  }, [activeStep, running]);

  function resetSimulation() {
    setRunning(false);
    setResult(null);
    setActiveStep(-1);
  }

  return (
    <main className="min-h-screen bg-[#08070D] p-8 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <Link
          href="/"
          className="text-sm text-purple-400 transition hover:text-purple-300"
        >
          ← Back to Overview
        </Link>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-400" />

            <p className="text-xs tracking-[0.3em] text-purple-400">
              WHAT-IF ENGINE
            </p>
          </div>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-5xl font-serif">
                Recovery Simulator
              </h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Simulate how the RecoverX AI agent could recover failed
                revenue before executing real recovery actions.
              </p>
            </div>

            {result && !running && (
              <button
                onClick={resetSimulation}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-300 transition hover:bg-white/[0.07]"
              >
                Reset Simulation
              </button>
            )}
          </div>
        </div>

        {/* Simulation Inputs */}

        <div className="mt-10 grid gap-5 md:grid-cols-3">
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

        <div className="mt-8 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />

                <p className="text-xs tracking-widest text-purple-400">
                  AI SIMULATION
                </p>
              </div>

              <h2 className="mt-2 text-2xl font-semibold">
                Run recovery scenario
              </h2>

              <p className="mt-2 max-w-xl text-gray-500">
                RecoverX evaluates payment failures, predicts recovery
                probability, applies retry limits and estimates the
                revenue that could be recovered.
              </p>
            </div>

            <button
              onClick={runSimulation}
              disabled={running}
              className="whitespace-nowrap rounded-xl bg-purple-600 px-7 py-4 font-medium transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running ? "AI Agent Running..." : "Run Simulation"}
            </button>

          </div>

          {/* Animated Pipeline */}

          {running && (
            <div className="mt-9 border-t border-white/10 pt-7">

              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Recovery Agent Pipeline
                </p>

                <p className="text-xs text-purple-400">
                  Step {Math.min(activeStep + 1, pipeline.length)} /{" "}
                  {pipeline.length}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">

                {pipeline.map((step, index) => {
                  const Icon = step.icon;

                  const completed = activeStep > index;
                  const active = activeStep === index;

                  return (
                    <div
                      key={step.name}
                      className={`rounded-xl border p-4 transition-all duration-500 ${
                        completed
                          ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                          : active
                            ? "border-purple-500/40 bg-purple-500/[0.08] shadow-lg shadow-purple-500/10"
                            : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            completed
                              ? "bg-emerald-500/10 text-emerald-400"
                              : active
                                ? "bg-purple-500/10 text-purple-400"
                                : "bg-white/5 text-gray-600"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>

                        <span className="font-mono text-[10px] text-gray-600">
                          0{index + 1}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-semibold">
                        {step.name}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-600">
                        {step.description}
                      </p>

                      {active && (
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full w-1/2 animate-pulse rounded-full bg-purple-500" />
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
                AI is evaluating recovery decisions...
              </div>
            </div>
          )}
        </div>

        {/* Results */}

        {result && (
          <div className="mt-8">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Simulation Complete
                </h2>

                <p className="text-xs text-gray-600">
                  Recovery scenario successfully evaluated
                </p>
              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              <ResultCard
                label="Recoverable Payments"
                value={String(result.recoverablePayments)}
              />

              <ResultCard
                label="Recovery Potential"
                value={`₹${result.recoveryPotential.toLocaleString(
                  "en-IN"
                )}`}
              />

              <ResultCard
                label="Estimated Recovered"
                value={`₹${result.estimatedRecovered.toLocaleString(
                  "en-IN"
                )}`}
                highlight
              />

              <ResultCard
                label="Estimated Recovery Rate"
                value={`${result.recoveryRate}%`}
                highlight
              />

            </div>

            {/* AI Outcome */}

            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-7">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-xs tracking-widest text-emerald-400">
                    AI OUTCOME
                  </p>

                  <h3 className="mt-3 text-3xl font-semibold">
                    ₹
                    {result.estimatedRecovered.toLocaleString("en-IN")}
                    {" "}
                    <span className="text-gray-300">
                      potentially recoverable
                    </span>
                  </h3>

                  <p className="mt-3 text-gray-500">
                    Based on {result.payments} analyzed payments and
                    RecoverX recovery decision rules.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-black/20 px-6 py-5 text-center">
                  <p className="text-xs text-gray-500">
                    RECOVERY CONFIDENCE
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-400">
                    73%
                  </p>

                  <p className="mt-1 text-[11px] text-gray-600">
                    Portfolio weighted estimate
                  </p>
                </div>

              </div>

            </div>

            {/* Decision Breakdown */}

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-7">

              <div className="mb-6">
                <p className="text-xs tracking-widest text-purple-400">
                  AI DECISION BREAKDOWN
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  Why RecoverX chose these actions
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Each recovery intervention is selected according to
                  failure diagnosis, recovery probability and merchant
                  guardrails.
                </p>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[760px] text-left">

                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-600">
                      <th className="px-3 py-3 font-medium">
                        Root Cause
                      </th>

                      <th className="px-3 py-3 font-medium">
                        Payments
                      </th>

                      <th className="px-3 py-3 font-medium">
                        Revenue
                      </th>

                      <th className="px-3 py-3 font-medium">
                        Probability
                      </th>

                      <th className="px-3 py-3 font-medium">
                        AI Action
                      </th>

                      <th className="px-3 py-3 font-medium">
                        Guardrail
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {decisions.map((decision) => (
                      <tr
                        key={decision.cause}
                        className="border-b border-white/5 transition hover:bg-white/[0.025]"
                      >
                        <td className="px-3 py-4 text-sm font-medium">
                          {decision.cause}
                        </td>

                        <td className="px-3 py-4 text-sm text-gray-400">
                          {decision.payments}
                        </td>

                        <td className="px-3 py-4 text-sm text-gray-300">
                          ₹
                          {decision.amount.toLocaleString("en-IN")}
                        </td>

                        <td className="px-3 py-4">
                          <span className="font-semibold text-emerald-400">
                            {decision.probability}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300">
                            {decision.action}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-xs text-gray-500">
                          {decision.guardrail}
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            </div>

            {/* Guardrails */}

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-purple-400" />

                  <h3 className="font-semibold">
                    Recovery Guardrails
                  </h3>
                </div>

                <div className="mt-5 space-y-3">

                  <Guardrail text="Maximum retry limits respected" />

                  <Guardrail text="High-risk cases are escalated" />

                  <Guardrail text="No blind retries for blocked cards" />

                  <Guardrail text="Merchant recovery policy validated" />

                  <Guardrail text="Stopping rules applied automatically" />

                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

                <div className="flex items-center gap-3">
                  <FileCheck2 className="h-5 w-5 text-purple-400" />

                  <h3 className="font-semibold">
                    Audit & Proof
                  </h3>
                </div>

                <div className="mt-5 space-y-3">

                  <Guardrail text="AI decision reason recorded" />

                  <Guardrail text="Recovery action recorded" />

                  <Guardrail text="Policy validation recorded" />

                  <Guardrail text="Estimated revenue outcome recorded" />

                  <Guardrail text="Complete recovery trail available" />

                </div>

              </div>

            </div>

          </div>
        )}

        {/* Static Pipeline when not running */}

        {!running && !result && (
          <div className="mt-10">

            <p className="text-xs tracking-widest text-gray-500">
              SIMULATION PIPELINE
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">

              {pipeline.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.name}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-purple-500/20 hover:bg-purple-500/[0.025]"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-purple-400" />

                      <span className="font-mono text-xs text-gray-600">
                        0{index + 1}
                      </span>
                    </div>

                    <p className="mt-4 font-semibold">
                      {step.name}
                    </p>

                    <p className="mt-2 text-xs text-gray-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}

            </div>

          </div>
        )}

      </div>
    </main>
  );
}

function Guardrail({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-400">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
      {text}
    </div>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold">
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
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-emerald-500/20 bg-emerald-500/[0.03]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-semibold ${
          highlight ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>

    </div>
  );
}