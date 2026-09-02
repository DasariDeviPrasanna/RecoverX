"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardData = {
  revenueAtRisk?: number;
  recoveryPotential?: number;
  recoveredRevenue?: number;
  recoveryRate?: number;
  attentionCount?: number;
};

export default function AgentPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#08070D] text-white p-8">
      <div className="max-w-6xl mx-auto">

        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          ← Back to Overview
        </Link>

        {/* Header */}
        <div className="mt-8">

          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>

            <span className="text-emerald-400 text-sm font-medium tracking-wider">
              AGENT ONLINE
            </span>
          </div>

          <h1 className="text-5xl font-serif mt-5">
            AI Recovery Agent
          </h1>

          <p className="text-gray-400 mt-3 max-w-2xl">
            RecoverX continuously analyzes failed payments, diagnoses
            failure reasons, selects recovery strategies and tracks
            recovered revenue.
          </p>

        </div>

        {/* Agent pipeline */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-10">

          <AgentStep
            number="01"
            title="Detect"
            description="Identify failed and abandoned payments."
            status="ACTIVE"
          />

          <AgentStep
            number="02"
            title="Diagnose"
            description="Understand why the payment failed."
            status="ACTIVE"
          />

          <AgentStep
            number="03"
            title="Decide"
            description="Select the highest-probability recovery action."
            status="ACTIVE"
          />

          <AgentStep
            number="04"
            title="Validate"
            description="Check merchant policy and stopping rules."
            status="ACTIVE"
          />

          <AgentStep
            number="05"
            title="Act"
            description="Execute an approved recovery action."
            status="READY"
          />

          <AgentStep
            number="06"
            title="Recover"
            description="Measure actual recovered revenue."
            status="READY"
          />

          <AgentStep
            number="07"
            title="Learn"
            description="Improve future recovery decisions."
            status="READY"
          />

          <AgentStep
            number="08"
            title="Audit"
            description="Record every AI decision and action."
            status="ACTIVE"
          />

        </div>

        {/* Metrics */}
        <div className="mt-10">

          <h2 className="text-xl font-semibold mb-5">
            Agent Intelligence
          </h2>

          {loading ? (
            <div className="border border-white/10 rounded-2xl p-8 text-gray-500">
              Loading agent intelligence...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">

              <Metric
                label="Revenue At Risk"
                value={`₹${Number(
                  data?.revenueAtRisk || 0
                ).toLocaleString("en-IN")}`}
              />

              <Metric
                label="Recovery Potential"
                value={`₹${Number(
                  data?.recoveryPotential || 0
                ).toLocaleString("en-IN")}`}
              />

              <Metric
                label="Recovered Revenue"
                value={`₹${Number(
                  data?.recoveredRevenue || 0
                ).toLocaleString("en-IN")}`}
              />

              <Metric
                label="Recovery Rate"
                value={`${Number(
                  data?.recoveryRate || 0
                ).toFixed(1)}%`}
              />

            </div>
          )}

        </div>

        {/* Decision engine */}
        <div className="mt-8 border border-purple-500/20 bg-purple-500/[0.04] rounded-2xl p-7">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-purple-400 text-xs tracking-widest">
                DECISION ENGINE
              </p>

              <h2 className="text-2xl font-semibold mt-2">
                Recovery strategy selection
              </h2>
            </div>

            <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs">
              ONLINE
            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-7">

            <Decision
              title="Retry Payment"
              description="Best for temporary failures such as insufficient funds or bank timeout."
            />

            <Decision
              title="Send Message"
              description="Use contextual messaging when a customer needs to take action."
            />

            <Decision
              title="Stop Recovery"
              description="Stop when retry limits, disputes or merchant policies are triggered."
            />

          </div>

        </div>

        {/* Governance */}
        <div className="mt-8 border border-white/10 rounded-2xl p-7">

          <p className="text-gray-500 text-xs tracking-widest">
            GOVERNANCE
          </p>

          <h2 className="text-2xl font-semibold mt-2">
            Human-in-the-loop protection
          </h2>

          <p className="text-gray-500 mt-2 max-w-2xl">
            High-value or uncertain recovery actions can be held for
            merchant approval before execution.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">

            <Rule
              title="Maximum Retries"
              value="3"
            />

            <Rule
              title="High Value Review"
              value="Required"
            />

            <Rule
              title="Audit Logging"
              value="Enabled"
            />

          </div>

        </div>

      </div>
    </main>
  );
}

function AgentStep({
  number,
  title,
  description,
  status,
}: {
  number: string;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] rounded-2xl p-5 hover:border-purple-500/30 transition">

      <div className="flex items-center justify-between">

        <span className="text-purple-400 font-mono text-sm">
          {number}
        </span>

        <span
          className={
            status === "ACTIVE"
              ? "text-emerald-400 text-[10px] tracking-wider"
              : "text-gray-600 text-[10px] tracking-wider"
          }
        >
          {status}
        </span>

      </div>

      <h3 className="text-lg font-semibold mt-5">
        {title}
      </h3>

      <p className="text-gray-500 text-sm mt-2 leading-relaxed">
        {description}
      </p>

    </div>
  );
}

function Metric({
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

function Decision({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-white/10 rounded-xl p-5">

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="text-gray-500 text-sm mt-2 leading-relaxed">
        {description}
      </p>

    </div>
  );
}

function Rule({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white/[0.025] rounded-xl p-5">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-lg font-semibold mt-2">
        {value}
      </p>

    </div>
  );
}