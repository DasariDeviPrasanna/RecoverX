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
    retryCount: number;

    customer: {
      name: string;
      email: string;
      phone: string | null;
      language: string;
    };
  };
};

type AuditLog = {
  id: string;
  actor: string;
  event: string;
  action: string | null;
  reason: string | null;
  createdAt: string;
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function getDiagnosis(payment: Recovery["payment"]) {
  const reason = (payment.failureReason || "").toLowerCase();

  if (reason.includes("insufficient")) {
    return {
      title: "Insufficient Funds",
      description:
        "The customer's account appears to have insufficient balance. A controlled retry may succeed when funds are available.",
      probability: 80,
    };
  }

  if (reason.includes("timeout")) {
    return {
      title: "Bank Timeout",
      description:
        "The payment gateway did not receive a timely response from the bank. A retry is likely to succeed.",
      probability: 75,
    };
  }

  if (reason.includes("abandoned")) {
    return {
      title: "Payment Abandoned",
      description:
        "The customer started the payment flow but did not complete it. A reminder can recover the transaction.",
      probability: 65,
    };
  }

  if (reason.includes("authentication")) {
    return {
      title: "Authentication Failed",
      description:
        "The payment failed during authentication. Sending a customer message is safer than repeated retries.",
      probability: 60,
    };
  }

  if (reason.includes("declined")) {
    return {
      title: "Card Declined",
      description:
        "The issuing bank declined the transaction. Customer guidance is recommended instead of aggressive retries.",
      probability: 45,
    };
  }

  return {
    title: "Payment Failure",
    description:
      "The AI agent detected a recoverable payment failure and evaluated the safest next action.",
    probability: 50,
  };
}

function actionLabel(action: string) {
  switch (action) {
    case "RETRY_PAYMENT":
      return "Retry Payment";

    case "SEND_MESSAGE":
      return "Send Customer Message";

    case "SEND_REMINDER":
      return "Send Reminder";

    case "ESCALATE":
      return "Escalate to Merchant";

    case "STOP":
      return "Stop Recovery";

    default:
      return action;
  }
}

export default function RecoveryCenter() {
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [lastRecoveryAmount, setLastRecoveryAmount] =
    useState<number | null>(null);

  async function loadData() {
    try {
      const response = await fetch("/api/recoveries", {
        cache: "no-store",
      });

      const data = await response.json();

      setRecoveries(data.recoveries || []);
      setAuditLogs(data.auditLogs || []);
    } catch {
      setMessage("Unable to load recovery data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function executeRecovery(
    recoveryId: string,
    action: "APPROVE" | "STOP"
  ) {
    setProcessing(recoveryId);
    setMessage("");
    setLastRecoveryAmount(null);

    try {
      const response = await fetch("/api/recoveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recoveryId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Recovery failed"
        );
      }

      /*
       * Only display recovered revenue when the
       * backend confirms that the payment was actually recovered.
       */
      if (data.recovered) {
        const recoveredAmount =
          Number(data.amountRecovered) || 0;

        setLastRecoveryAmount(recoveredAmount);
        setMessage("Revenue recovered successfully.");
      } else if (action === "STOP") {
        setMessage("Recovery stopped.");
      } else {
        setMessage("Recovery action completed.");
      }

      await loadData();
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />

        <p className="text-sm text-zinc-500">
          AI agent is analyzing recovery opportunities...
        </p>
      </div>
    );
  }

  const activeRecoveries = recoveries.filter(
    (item) =>
      item.status !== "STOPPED" &&
      item.status !== "RECOVERED"
  );

  const recovered = recoveries.filter(
    (item) => item.status === "RECOVERED"
  );

  const totalRecovered = recoveries.reduce(
    (sum, item) =>
      sum + (Number(item.amountRecovered) || 0),
    0
  );

  const totalAtRisk = activeRecoveries.reduce(
    (sum, item) =>
      sum + (Number(item.payment.amount) || 0),
    0
  );

  return (
    <div className="space-y-6">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-cyan-500/[0.04] p-6">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-violet-400">

              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

              AI RECOVERY AGENT

            </div>

            <h2 className="text-2xl font-bold">
              Detect → Diagnose → Decide → Recover
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              RecoverX evaluates failed payments, determines
              the root cause, selects a bounded recovery
              strategy, and records every action.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">

            {/* Pending */}

            <div className="rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-center">

              <div className="text-xl font-bold text-white">
                {activeRecoveries.length}
              </div>

              <div className="text-[10px] uppercase tracking-wider text-zinc-600">
                Pending
              </div>

            </div>

            {/* At Risk */}

            <div className="rounded-xl border border-orange-500/10 bg-orange-500/[0.04] px-5 py-3 text-center">

              <div className="text-xl font-bold text-orange-300">
                {money(totalAtRisk)}
              </div>

              <div className="text-[10px] uppercase tracking-wider text-zinc-600">
                At Risk
              </div>

            </div>

            {/* Recovered */}

            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] px-5 py-3 text-center">

              <div className="text-xl font-bold text-emerald-400">
                {money(totalRecovered)}
              </div>

              <div className="text-[10px] uppercase tracking-wider text-zinc-600">
                Recovered
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          ACTION RESULT
      ========================================= */}

      {message && (
        <div
          className={`rounded-2xl border px-5 py-5 ${
            lastRecoveryAmount !== null &&
            lastRecoveryAmount > 0
              ? "border-emerald-500/20 bg-emerald-500/[0.06]"
              : "border-violet-500/20 bg-violet-500/[0.05]"
          }`}
        >

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div
                className={`text-[10px] font-bold tracking-[0.18em] ${
                  lastRecoveryAmount !== null &&
                  lastRecoveryAmount > 0
                    ? "text-emerald-400"
                    : "text-violet-400"
                }`}
              >
                RECOVERY RESULT
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {message}
              </p>

            </div>

            {lastRecoveryAmount !== null &&
              lastRecoveryAmount > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 text-center">

                  <div className="text-2xl font-bold text-emerald-400">
                    {money(lastRecoveryAmount)}
                  </div>

                  <div className="mt-1 text-[10px] uppercase tracking-wider text-emerald-500/70">
                    Revenue Recovered
                  </div>

                </div>
              )}

          </div>

        </div>
      )}

      {/* =========================================
          EMPTY STATE
      ========================================= */}

      {recoveries.length === 0 ? (

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-2xl text-violet-300">
            ◈
          </div>

          <h3 className="text-lg font-semibold">
            No recovery opportunities
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Add failed payments to activate the recovery agent.
          </p>

        </div>

      ) : (

        <div className="space-y-5">

          {recoveries.map((recovery) => {

            const payment = recovery.payment;

            const diagnosis = getDiagnosis(payment);

            const isRecovered =
              recovery.status === "RECOVERED";

            const isStopped =
              recovery.status === "STOPPED";

            const isProcessing =
              processing === recovery.id;

            const confidence =
              recovery.aiConfidence ?? 85;

            const amountAtRisk =
              Number(payment.amount) || 0;

            const amountRecovered =
              Number(recovery.amountRecovered) || 0;

            return (
              <div
                key={recovery.id}
                className={`overflow-hidden rounded-2xl border bg-white/[0.02] transition ${
                  isRecovered
                    ? "border-emerald-500/20"
                    : isStopped
                    ? "border-zinc-800"
                    : "border-white/10 hover:border-violet-500/20"
                }`}
              >

                {/* =====================================
                    TOP
                ===================================== */}

                <div className="border-b border-white/5 p-6">

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
                          isRecovered
                            ? "bg-emerald-500/10 text-emerald-400"
                            : isStopped
                            ? "bg-zinc-500/10 text-zinc-500"
                            : "bg-orange-500/10 text-orange-400"
                        }`}
                      >
                        {isRecovered
                          ? "✓"
                          : isStopped
                          ? "■"
                          : "!"}
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-white">
                            {payment.customer.name}
                          </h3>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                              isRecovered
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : isStopped
                                ? "border-zinc-700 bg-zinc-800 text-zinc-500"
                                : "border-orange-500/20 bg-orange-500/10 text-orange-300"
                            }`}
                          >
                            {isRecovered
                              ? "RECOVERED"
                              : isStopped
                              ? "STOPPED"
                              : payment.riskLevel}
                          </span>

                        </div>

                        <p className="mt-1 text-xs text-zinc-600">
                          {payment.customer.email}
                        </p>

                      </div>

                    </div>

                    {/* AMOUNT */}

                    <div className="text-left lg:text-right">

                      <div
                        className={`text-2xl font-bold ${
                          isRecovered
                            ? "text-emerald-400"
                            : "text-white"
                        }`}
                      >
                        {money(
                          isRecovered
                            ? amountRecovered
                            : amountAtRisk
                        )}
                      </div>

                      <div
                        className={`mt-1 text-[10px] uppercase tracking-wider ${
                          isRecovered
                            ? "text-emerald-500/70"
                            : "text-orange-400/60"
                        }`}
                      >
                        {isRecovered
                          ? "Amount Recovered"
                          : "Amount At Risk"}
                      </div>

                      <div className="mt-1 text-xs text-zinc-600">
                        Attempt #{recovery.attemptNumber}
                      </div>

                    </div>

                  </div>

                </div>

                {/* =====================================
                    AI ANALYSIS
                ===================================== */}

                <div className="grid gap-0 lg:grid-cols-3">

                  {/* DIAGNOSIS */}

                  <div className="border-b border-white/5 p-6 lg:border-b-0 lg:border-r">

                    <div className="mb-3 text-[10px] font-bold tracking-[0.18em] text-zinc-600">
                      AI DIAGNOSIS
                    </div>

                    <h4 className="font-semibold text-orange-300">
                      {diagnosis.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {diagnosis.description}
                    </p>

                    <div className="mt-5">

                      <div className="mb-2 flex justify-between text-xs">

                        <span className="text-zinc-600">
                          Recovery probability
                        </span>

                        <span className="font-semibold text-emerald-400">
                          {diagnosis.probability}%
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"
                          style={{
                            width: `${diagnosis.probability}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                  {/* DECISION */}

                  <div className="border-b border-white/5 p-6 lg:border-b-0 lg:border-r">

                    <div className="mb-3 text-[10px] font-bold tracking-[0.18em] text-zinc-600">
                      AI DECISION
                    </div>

                    <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.05] p-4">

                      <div className="text-xs text-zinc-500">
                        Recommended action
                      </div>

                      <div className="mt-2 font-semibold text-violet-300">
                        {actionLabel(recovery.actionType)}
                      </div>

                      <div className="mt-4 flex items-center justify-between">

                        <span className="text-xs text-zinc-600">
                          AI confidence
                        </span>

                        <span className="font-bold text-white">
                          {confidence}%
                        </span>

                      </div>

                    </div>

                    <p className="mt-3 text-xs leading-5 text-zinc-600">
                      {recovery.reason ||
                        "Selected using risk, failure reason, retry history and recovery probability."}
                    </p>

                  </div>

                  {/* GOVERNANCE */}

                  <div className="p-6">

                    <div className="mb-3 text-[10px] font-bold tracking-[0.18em] text-zinc-600">
                      GOVERNANCE
                    </div>

                    <div className="space-y-3 text-sm">

                      <div className="flex justify-between">

                        <span className="text-zinc-600">
                          Risk score
                        </span>

                        <span className="font-semibold text-orange-300">
                          {payment.riskScore}/100
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-zinc-600">
                          Previous retries
                        </span>

                        <span className="text-zinc-300">
                          {payment.retryCount}/3
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-zinc-600">
                          Customer language
                        </span>

                        <span className="text-zinc-300">
                          {payment.customer.language}
                        </span>

                      </div>

                    </div>

                    {/* ACTION BUTTONS */}

                    {!isRecovered &&
                      !isStopped && (
                        <div className="mt-6 flex gap-2">

                          <button
                            disabled={isProcessing}
                            onClick={() =>
                              executeRecovery(
                                recovery.id,
                                "APPROVE"
                              )
                            }
                            className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Executing..."
                              : "Approve & Execute"}
                          </button>

                          <button
                            disabled={isProcessing}
                            onClick={() =>
                              executeRecovery(
                                recovery.id,
                                "STOP"
                              )
                            }
                            className="rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                          >
                            Stop
                          </button>

                        </div>
                      )}

                    {/* RECOVERED */}

                    {isRecovered && (
                      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 text-center">

                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-500/70">
                          Revenue Recovered
                        </div>

                        <div className="mt-2 text-3xl font-bold text-emerald-400">
                          {money(amountRecovered)}
                        </div>

                        <div className="mt-2 text-xs text-emerald-500/60">
                          Payment successfully recovered
                        </div>

                      </div>
                    )}

                    {/* STOPPED */}

                    {isStopped && (
                      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center text-xs text-zinc-600">
                        Recovery stopped by merchant
                      </div>
                    )}

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* =========================================
          AUDIT PREVIEW
      ========================================= */}

      {auditLogs.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <div className="text-[10px] font-bold tracking-[0.18em] text-orange-400">
                GOVERNANCE
              </div>

              <h3 className="mt-1 text-lg font-semibold">
                Recent Agent Activity
              </h3>

            </div>

            <a
              href="/audit"
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              View full audit →
            </a>

          </div>

          <div className="space-y-3">

            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.015] p-4 md:flex-row md:items-center md:justify-between"
              >

                <div>

                  <div className="text-sm font-semibold text-zinc-300">
                    {log.event}
                  </div>

                  <div className="mt-1 text-xs text-zinc-600">
                    {log.reason ||
                      "Agent activity recorded"}
                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <span className="rounded-full border border-violet-500/10 bg-violet-500/5 px-2 py-1 text-[9px] font-bold text-violet-300">
                    {log.actor}
                  </span>

                  <span className="text-[10px] text-zinc-700">
                    {new Date(
                      log.createdAt
                    ).toLocaleString("en-IN")}
                  </span>

                </div>

              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}