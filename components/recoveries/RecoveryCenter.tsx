"use client";

import { useEffect, useState } from "react";

type Recovery = {
  id: string;
  actionType: string;
  status: string;
  reason: string | null;
  aiConfidence: number | null;
  amountRecovered: number;
  attemptNumber: number;

  payment: {
    id: string;
    amount: number;
    status: string;
    failureReason: string | null;
    riskScore: number;
    riskLevel: string;
    recoveryStatus: string;
  };

  customer: {
    name: string;
    email: string;
    phone: string | null;
    language: string;
  };
};

export default function RecoveryCenter() {
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadRecoveries() {
    try {
      const response = await fetch("/api/recoveries");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load recoveries."
        );
      }

      setRecoveries(data.recoveries || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load recovery actions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecoveries();
  }, []);

  async function processRecovery(
    actionId: string,
    action: "APPROVE" | "STOP"
  ) {
    setProcessing(actionId);
    setMessage("");

    try {
      const response = await fetch("/api/recoveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to process recovery."
        );
      }

      setMessage(data.message);

      await loadRecoveries();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setProcessing(null);
    }
  }

  function formatMoney(amount: number) {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  }

  function getRiskStyle(level: string) {
    if (level === "CRITICAL") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    if (level === "HIGH") {
      return "border-orange-500/30 bg-orange-500/10 text-orange-400";
    }

    if (level === "MEDIUM") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    }

    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  function getActionName(action: string) {
    if (action === "RETRY_PAYMENT") {
      return "Retry Payment";
    }

    if (action === "SEND_MESSAGE") {
      return "Send Customer Message";
    }

    if (action === "SEND_REMINDER") {
      return "Send Payment Reminder";
    }

    if (action === "ESCALATE") {
      return "Escalate to Merchant";
    }

    return action;
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-16 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />

        <p className="text-zinc-400">
          Loading recovery intelligence...
        </p>
      </div>
    );
  }

  if (recoveries.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-16 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/10 text-3xl text-violet-300">
          ◈
        </div>

        <h2 className="text-2xl font-semibold">
          No recovery opportunities
        </h2>

        <p className="mx-auto mt-3 max-w-md text-zinc-500">
          Add a failed or abandoned payment from the Data Entry
          page. RecoverX will analyze it and create a recovery
          recommendation here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {message && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-5 py-4 text-sm text-violet-300">
          {message}
        </div>
      )}

      {recoveries.map((recovery) => {
        const amount = Number(recovery.payment.amount);

        const probability =
          recovery.payment.riskLevel === "CRITICAL"
            ? 55
            : recovery.payment.riskLevel === "HIGH"
            ? 80
            : 65;

        const completed =
          recovery.status === "STOPPED" ||
          recovery.status === "RECOVERED";

        return (
          <div
            key={recovery.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:border-violet-500/30"
          >
            <div className="p-6">

              {/* Top */}
              <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">

                {/* Customer */}
                <div className="flex-1">

                  <div className="mb-4 flex flex-wrap items-center gap-3">

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRiskStyle(
                        recovery.payment.riskLevel
                      )}`}
                    >
                      {recovery.payment.riskLevel} RISK
                    </span>

                    <span className="text-sm text-zinc-600">
                      Risk Score{" "}
                      {recovery.payment.riskScore}/100
                    </span>

                  </div>

                  <h2 className="text-2xl font-semibold text-white">
                    {recovery.customer.name}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {recovery.customer.email}
                  </p>

                  {/* Metrics */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-xl bg-black/20 p-4">
                      <p className="text-xs text-zinc-600">
                        Amount
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {formatMoney(amount)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/20 p-4">
                      <p className="text-xs text-zinc-600">
                        Recovery Probability
                      </p>

                      <p className="mt-1 text-xl font-bold text-cyan-400">
                        {probability}%
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/20 p-4">
                      <p className="text-xs text-zinc-600">
                        AI Confidence
                      </p>

                      <p className="mt-1 text-xl font-bold text-violet-300">
                        {recovery.aiConfidence ?? 0}%
                      </p>
                    </div>

                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="w-full rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-5 lg:max-w-md">

                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                    AI Recommendation
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    {getActionName(
                      recovery.actionType
                    )}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {recovery.reason ||
                      "RecoverX selected this action based on the payment risk profile."}
                  </p>

                  <div className="mt-5 border-t border-white/10 pt-4">

                    <p className="text-xs text-zinc-600">
                      Failure reason
                    </p>

                    <p className="mt-1 text-sm text-zinc-300">
                      {recovery.payment.failureReason ||
                        "Unknown"}
                    </p>

                  </div>

                </div>
              </div>

              {/* Bottom */}
              <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs text-zinc-600">
                    Recovery Status
                  </p>

                  <p className="mt-1 text-sm font-medium text-zinc-300">
                    {recovery.status}
                  </p>
                </div>

                {!completed ? (
                  <div className="flex flex-col gap-3 sm:flex-row">

                    <button
                      type="button"
                      disabled={
                        processing === recovery.id
                      }
                      onClick={() =>
                        processRecovery(
                          recovery.id,
                          "STOP"
                        )
                      }
                      className="rounded-xl border border-red-500/20 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Stop Recovery
                    </button>

                    <button
                      type="button"
                      disabled={
                        processing === recovery.id
                      }
                      onClick={() =>
                        processRecovery(
                          recovery.id,
                          "APPROVE"
                        )
                      }
                      className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processing === recovery.id
                        ? "Processing..."
                        : "Approve Recovery →"}
                    </button>

                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-500">
                    Action completed
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}