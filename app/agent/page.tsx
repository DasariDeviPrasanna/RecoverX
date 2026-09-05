"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BackToOverview from "@/components/layout/BackToOverview";

type DashboardData = {
  totalAtRisk?: number;
  recoveryPotential?: number;
  recoveredRevenue?: number;
  recoveryRate?: number;
  recoveryActions?: number;
  riskyPayments?: number;
  totalPayments?: number;
};

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
      language: string;
    };
  };
};

type Stage =
  | "DETECT"
  | "DIAGNOSE"
  | "DECIDE"
  | "VALIDATE"
  | "ACT"
  | "RECOVER"
  | "LEARN"
  | "AUDIT";

const stages: {
  id: Stage;
  number: string;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "DETECT",
    number: "01",
    title: "Detect",
    subtitle: "Find revenue at risk",
  },
  {
    id: "DIAGNOSE",
    number: "02",
    title: "Diagnose",
    subtitle: "Understand the failure",
  },
  {
    id: "DECIDE",
    number: "03",
    title: "Decide",
    subtitle: "Choose the best action",
  },
  {
    id: "VALIDATE",
    number: "04",
    title: "Validate",
    subtitle: "Apply safety rules",
  },
  {
    id: "ACT",
    number: "05",
    title: "Act",
    subtitle: "Execute recovery",
  },
  {
    id: "RECOVER",
    number: "06",
    title: "Recover",
    subtitle: "Measure revenue recovered",
  },
  {
    id: "LEARN",
    number: "07",
    title: "Learn",
    subtitle: "Capture outcome signals",
  },
  {
    id: "AUDIT",
    number: "08",
    title: "Audit",
    subtitle: "Record the decision",
  },
];

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function diagnosis(reason: string | null) {
  const value = (reason || "").toLowerCase();

  if (value.includes("insufficient")) {
    return {
      title: "Insufficient Funds",
      probability: 80,
      confidence: 88,
      explanation:
        "Customer balance may be temporarily insufficient. A controlled retry has a high recovery probability.",
      action: "RETRY_PAYMENT",
    };
  }

  if (value.includes("timeout")) {
    return {
      title: "Bank Timeout",
      probability: 75,
      confidence: 84,
      explanation:
        "The bank did not respond within the expected window. A retry is preferred over customer escalation.",
      action: "RETRY_PAYMENT",
    };
  }

  if (value.includes("abandoned")) {
    return {
      title: "Payment Abandoned",
      probability: 65,
      confidence: 81,
      explanation:
        "The customer started but did not complete payment. A reminder is safer than an automatic retry.",
      action: "SEND_REMINDER",
    };
  }

  if (value.includes("authentication")) {
    return {
      title: "Authentication Failed",
      probability: 60,
      confidence: 78,
      explanation:
        "The payment failed during authentication. Customer guidance is recommended.",
      action: "SEND_MESSAGE",
    };
  }

  if (value.includes("declined")) {
    return {
      title: "Card Declined",
      probability: 45,
      confidence: 86,
      explanation:
        "The issuing bank declined the transaction. Repeated retries could create poor customer experience.",
      action: "SEND_MESSAGE",
    };
  }

  return {
    title: "Payment Failure",
    probability: 50,
    confidence: 75,
    explanation:
      "The agent detected a potentially recoverable payment failure and evaluated the safest available action.",
    action: "SEND_MESSAGE",
  };
}

function actionName(action: string) {
  switch (action) {
    case "RETRY_PAYMENT":
      return "Smart Retry";

    case "SEND_MESSAGE":
      return "Customer Message";

    case "SEND_REMINDER":
      return "Payment Reminder";

    case "ESCALATE":
      return "Human Escalation";

    case "STOP":
      return "Stop Recovery";

    default:
      return action;
  }
}

export default function AgentPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentStage, setCurrentStage] = useState<Stage>("DETECT");
  const [pipelineRunning, setPipelineRunning] = useState(true);

  async function loadAgentData() {
    try {
      const [dashboardResponse, recoveryResponse] = await Promise.all([
        fetch("/api/dashboard", { cache: "no-store" }),
        fetch("/api/recoveries", { cache: "no-store" }),
      ]);

      const dashboard = await dashboardResponse.json();
      const recoveryData = await recoveryResponse.json();

      setData(dashboard);
      setRecoveries(recoveryData.recoveries || []);
    } catch {
      console.error("Unable to load AI agent data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgentData();

    const interval = setInterval(loadAgentData, 10000);

    return () => clearInterval(interval);
  }, []);

  const activeCases = recoveries.filter(
    (item) => item.status !== "RECOVERED" && item.status !== "STOPPED"
  );

  const recoveredCases = recoveries.filter(
    (item) => item.status === "RECOVERED"
  );

  const latestCase =
    activeCases[0] || recoveredCases[0] || recoveries[0];

  const latestDiagnosis = latestCase
    ? diagnosis(latestCase.payment.failureReason)
    : null;

  /*
   * Pipeline automatically moves through every AI stage.
   * It pauses at ACT when human approval is needed.
   */
  useEffect(() => {
    if (!latestCase || !latestDiagnosis || !pipelineRunning) {
      return;
    }

    const stageOrder: Stage[] = [
      "DETECT",
      "DIAGNOSE",
      "DECIDE",
      "VALIDATE",
      "ACT",
      "RECOVER",
      "LEARN",
      "AUDIT",
    ];

    const index = stageOrder.indexOf(currentStage);

    if (index === -1 || currentStage === "AUDIT") {
      return;
    }

    const timer = setTimeout(() => {
      const nextStage = stageOrder[index + 1];

      if (nextStage) {
        setCurrentStage(nextStage);
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [
    currentStage,
    latestCase,
    latestDiagnosis,
    pipelineRunning,
  ]);

  const currentIndex = stages.findIndex(
    (stage) => stage.id === currentStage
  );

  const isHighValue =
    latestCase && latestCase.payment.amount >= 200000;

  const validationPassed =
    latestCase &&
    latestCase.payment.retryCount < 3 &&
    latestCase.payment.status !== "SUCCESS";

  const pipelineMessage = useMemo(() => {
    switch (currentStage) {
      case "DETECT":
        return "Scanning payment activity for revenue at risk...";

      case "DIAGNOSE":
        return "Analyzing failure signals and customer context...";

      case "DECIDE":
        return "Selecting the highest-probability bounded recovery action...";

      case "VALIDATE":
        return "Checking merchant policy, retry limits and safety rules...";

      case "ACT":
        return isHighValue
          ? "High-value action detected — merchant approval required."
          : "Recovery action is ready for execution.";

      case "RECOVER":
        return "Measuring actual payment recovery outcome...";

      case "LEARN":
        return "Capturing outcome signals for future decisions...";

      case "AUDIT":
        return "Recording the complete recovery decision trail.";

      default:
        return "";
    }
  }, [currentStage, isHighValue]);

  return (
    <main className="min-h-screen bg-[#08070D] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        <BackToOverview />

        {/* HEADER */}
        <header className="mt-8">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>

            <span className="text-xs font-bold tracking-[0.2em] text-emerald-400">
              AUTONOMOUS RECOVERY AGENT ONLINE
            </span>
          </div>

          <h1 className="mt-5 text-5xl font-serif">
            AI Recovery Agent
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-gray-400">
            RecoverX continuously detects revenue leakage, diagnoses
            payment failures, evaluates recovery probability, selects
            bounded actions, validates merchant policy, and records
            every decision.
          </p>
        </header>

        {/* LIVE METRICS */}
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <StatusCard
            label="Payments Analyzed"
            value={data?.totalPayments ?? 0}
            icon="◉"
          />

          <StatusCard
            label="Revenue At Risk"
            value={money(data?.totalAtRisk ?? 0)}
            icon="!"
          />

          <StatusCard
            label="Recovery Potential"
            value={money(data?.recoveryPotential ?? 0)}
            icon="⚡"
          />

          <StatusCard
            label="Recovered Revenue"
            value={money(data?.recoveredRevenue ?? 0)}
            icon="✓"
          />
        </div>

        {/* PIPELINE */}
        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-violet-400">
                AI REVENUE RECOVERY PIPELINE
              </p>

              <h2 className="mt-2 text-3xl font-semibold">
                Detect → Diagnose → Decide → Validate → Act → Recover
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Every recovery decision passes through bounded AI
                reasoning and merchant safety controls.
              </p>
            </div>

            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-2 text-xs text-emerald-400">
              ● {currentStage} IN PROGRESS
            </div>
          </div>

          {/* CONNECTED PIPELINE */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-8">

            <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
              {stages.map((stage, index) => {
                const completed = index < currentIndex;
                const active = index === currentIndex;

                return (
                  <div key={stage.id} className="relative">
                    <PipelineStage
                      number={stage.number}
                      title={stage.title}
                      subtitle={stage.subtitle}
                      active={active}
                      completed={completed}
                    />

                    {index < stages.length - 1 && (
                      <div className="absolute -right-2 top-1/2 hidden w-4 -translate-y-1/2 xl:block">
                        <div
                          className={`h-px w-full ${
                            completed
                              ? "bg-emerald-400"
                              : "bg-white/10"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CURRENT PIPELINE STATUS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mt-8 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-[0.2em] text-violet-400">
                      LIVE AGENT ACTIVITY
                    </p>

                    <p className="mt-2 text-lg font-medium">
                      {pipelineMessage}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        className="h-2 w-2 rounded-full bg-violet-400"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* CURRENT OUTPUT */}
        {latestCase && latestDiagnosis && (
          <section className="mt-8">
            <div className="mb-5">
              <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
                AGENT OUTPUT
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {currentStage} result
              </h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentStage}-${latestCase.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <StageOutput
                  stage={currentStage}
                  recovery={latestCase}
                  diagnosisData={latestDiagnosis}
                  validationPassed={Boolean(validationPassed)}
                  isHighValue={Boolean(isHighValue)}
                />
              </motion.div>
            </AnimatePresence>
          </section>
        )}

        {/* NO DATA */}
        {!loading && !latestCase && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <div className="text-4xl">◉</div>

            <h2 className="mt-4 text-xl font-semibold">
              Waiting for payment data
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add a failed or pending payment to start the AI recovery
              pipeline.
            </p>

            <Link
              href="/data-entry"
              className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
            >
              Add Payment →
            </Link>
          </div>
        )}

        {/* DECISION ENGINE */}
        <section className="mt-10 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-7">
          <p className="text-xs font-bold tracking-[0.2em] text-purple-400">
            DECISION ENGINE
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Bounded recovery strategies
          </h2>

          <p className="mt-2 max-w-3xl text-gray-500">
            The agent does not blindly retry every failed payment. It
            selects an action based on the failure cause, risk, retry
            history and recovery probability.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <Decision
              title="Smart Retry"
              probability="80%"
              description="Used for recoverable temporary failures such as insufficient funds or bank timeout."
            />

            <Decision
              title="Customer Message"
              probability="60%"
              description="Used when the customer needs to take action instead of repeatedly retrying."
            />

            <Decision
              title="Stop Recovery"
              probability="100%"
              description="Triggered by retry limits, merchant controls or unsafe recovery conditions."
            />
          </div>
        </section>

        {/* GOVERNANCE */}
        <section className="mt-8 rounded-2xl border border-white/10 p-7">
          <p className="text-xs tracking-[0.2em] text-gray-500">
            GOVERNANCE & SAFETY
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Human-in-the-loop protection
          </h2>

          <p className="mt-2 max-w-3xl text-gray-500">
            RecoverX keeps merchants in control of high-value and
            uncertain recovery actions while maintaining a complete
            audit trail.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Rule title="Maximum Retries" value="3" />
            <Rule title="High Value Review" value="₹2L+" />
            <Rule title="Audit Logging" value="Enabled" />
            <Rule title="Execution Mode" value="Test Mode" />
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-5 text-xs text-gray-700 sm:flex-row sm:justify-between">
          <span>RecoverX AI Revenue Intelligence</span>

          <span className="text-emerald-500/70">
            ● Agent operational
          </span>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* PIPELINE STAGE */
/* -------------------------------------------------------------------------- */

function PipelineStage({
  number,
  title,
  subtitle,
  active,
  completed,
}: {
  number: string;
  title: string;
  subtitle: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <motion.div
      animate={
        active
          ? {
              y: [0, -3, 0],
            }
          : {}
      }
      transition={{
        duration: 1.8,
        repeat: active ? Infinity : 0,
      }}
      className={`relative min-h-[125px] rounded-2xl border p-4 transition-all ${
        active
          ? "border-violet-400/60 bg-violet-500/[0.10] shadow-[0_0_35px_rgba(139,92,246,0.16)]"
          : completed
          ? "border-emerald-500/30 bg-emerald-500/[0.05]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-xs ${
            active
              ? "text-violet-300"
              : completed
              ? "text-emerald-400"
              : "text-gray-600"
          }`}
        >
          {number}
        </span>

        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
            active
              ? "bg-violet-500 text-white"
              : completed
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-white/5 text-gray-700"
          }`}
        >
          {completed ? "✓" : active ? "●" : "○"}
        </span>
      </div>

      <p
        className={`mt-5 font-semibold ${
          active
            ? "text-white"
            : completed
            ? "text-emerald-300"
            : "text-gray-500"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-gray-600">
        {subtitle}
      </p>

      <p
        className={`mt-3 text-[9px] font-bold tracking-[0.15em] ${
          active
            ? "text-violet-400"
            : completed
            ? "text-emerald-500"
            : "text-gray-700"
        }`}
      >
        {active ? "PROCESSING" : completed ? "COMPLETED" : "WAITING"}
      </p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* STAGE OUTPUT */
/* -------------------------------------------------------------------------- */

function StageOutput({
  stage,
  recovery,
  diagnosisData,
  validationPassed,
  isHighValue,
}: {
  stage: Stage;
  recovery: Recovery;
  diagnosisData: {
    title: string;
    probability: number;
    confidence: number;
    explanation: string;
    action: string;
  };
  validationPassed: boolean;
  isHighValue: boolean;
}) {
  if (stage === "DETECT") {
    return (
      <OutputCard
        label="PAYMENT DETECTED"
        title="Revenue at risk identified"
      >
        <div className="grid gap-5 md:grid-cols-4">
          <OutputMetric
            label="Customer"
            value={recovery.payment.customer.name}
          />

          <OutputMetric
            label="Amount at risk"
            value={money(recovery.payment.amount)}
            highlight
          />

          <OutputMetric
            label="Payment status"
            value={recovery.payment.status}
          />

          <OutputMetric
            label="Risk score"
            value={`${recovery.payment.riskScore}/100`}
          />
        </div>

        <div className="mt-6 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] p-4">
          <p className="text-xs text-orange-300">
            Failure detected
          </p>

          <p className="mt-2 font-medium text-white">
            {recovery.payment.failureReason || "Unknown failure"}
          </p>
        </div>
      </OutputCard>
    );
  }

  if (stage === "DIAGNOSE") {
    return (
      <OutputCard
        label="AI DIAGNOSIS"
        title={diagnosisData.title}
      >
        <div className="grid gap-6 md:grid-cols-3">
          <OutputMetric
            label="Root cause"
            value={diagnosisData.title}
          />

          <OutputMetric
            label="AI confidence"
            value={`${diagnosisData.confidence}%`}
            highlight
          />

          <OutputMetric
            label="Recovery probability"
            value={`${diagnosisData.probability}%`}
            highlight
          />
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs tracking-wider text-gray-600">
            REASONING
          </p>

          <p className="mt-3 leading-7 text-gray-400">
            {diagnosisData.explanation}
          </p>
        </div>
      </OutputCard>
    );
  }

  if (stage === "DECIDE") {
    return (
      <OutputCard
        label="AI DECISION"
        title={actionName(diagnosisData.action)}
      >
        <div className="grid gap-5 md:grid-cols-3">
          <OutputMetric
            label="Recommended action"
            value={actionName(diagnosisData.action)}
            highlight
          />

          <OutputMetric
            label="Recovery probability"
            value={`${diagnosisData.probability}%`}
            highlight
          />

          <OutputMetric
            label="Current retries"
            value={`${recovery.payment.retryCount}/3`}
          />
        </div>

        <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-5">
          <p className="text-xs tracking-wider text-violet-400">
            DECISION LOGIC
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Action selected using failure reason, risk score,
            retry history and predicted recovery probability.
          </p>
        </div>
      </OutputCard>
    );
  }

  if (stage === "VALIDATE") {
    return (
      <OutputCard
        label="POLICY VALIDATION"
        title={
          validationPassed
            ? "Recovery action passed safety checks"
            : "Recovery action blocked"
        }
      >
        <div className="space-y-3">
          <ValidationRow
            label="Retry limit"
            passed={recovery.payment.retryCount < 3}
            value={`${recovery.payment.retryCount}/3 attempts`}
          />

          <ValidationRow
            label="Payment still recoverable"
            passed={recovery.payment.status !== "SUCCESS"}
            value={recovery.payment.status}
          />

          <ValidationRow
            label="Human approval"
            passed={!isHighValue}
            value={isHighValue ? "Required — ₹2L+ payment" : "Not required"}
          />

          <ValidationRow
            label="Audit logging"
            passed
            value="Enabled"
          />
        </div>
      </OutputCard>
    );
  }

  if (stage === "ACT") {
    return (
      <OutputCard
        label="ACTION"
        title={isHighValue ? "Awaiting merchant approval" : "Action ready"}
      >
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-6">
          <p className="text-xs tracking-wider text-gray-600">
            SELECTED RECOVERY ACTION
          </p>

          <p className="mt-3 text-2xl font-bold text-violet-300">
            {actionName(diagnosisData.action)}
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Target amount:{" "}
            <span className="font-semibold text-white">
              {money(recovery.payment.amount)}
            </span>
          </p>

          {isHighValue ? (
            <div className="mt-5 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] p-4">
              <p className="font-semibold text-orange-300">
                Human approval required
              </p>

              <p className="mt-1 text-sm text-gray-500">
                This payment exceeds the configured high-value
                approval threshold.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
              <p className="font-semibold text-emerald-300">
                Action cleared for execution
              </p>
            </div>
          )}
        </div>
      </OutputCard>
    );
  }

  if (stage === "RECOVER") {
    const recovered = recovery.status === "RECOVERED";

    return (
      <OutputCard
        label="RECOVERY OUTCOME"
        title={recovered ? "Revenue recovered" : "Recovery outcome pending"}
      >
        <div
          className={`rounded-2xl border p-7 ${
            recovered
              ? "border-emerald-500/20 bg-emerald-500/[0.05]"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <p className="text-xs tracking-[0.2em] text-gray-500">
            ACTUAL RECOVERED REVENUE
          </p>

          <p
            className={`mt-3 text-5xl font-bold ${
              recovered ? "text-emerald-400" : "text-gray-400"
            }`}
          >
            {money(recovery.amountRecovered || 0)}
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Original amount: {money(recovery.payment.amount)}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
              Status: {recovery.status}
            </span>

            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
              Attempt #{recovery.attemptNumber}
            </span>
          </div>
        </div>
      </OutputCard>
    );
  }

  if (stage === "LEARN") {
    return (
      <OutputCard
        label="LEARNING SIGNAL"
        title="Recovery outcome captured"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <LearningSignal
            label="Failure pattern"
            value={diagnosisData.title}
          />

          <LearningSignal
            label="Selected strategy"
            value={actionName(diagnosisData.action)}
          />

          <LearningSignal
            label="Outcome"
            value={recovery.status}
          />
        </div>

        <p className="mt-6 text-sm leading-6 text-gray-500">
          This outcome becomes a decision signal for future
          recovery prioritization and strategy selection.
        </p>
      </OutputCard>
    );
  }

  return (
    <OutputCard
      label="AUDIT TRAIL"
      title="Decision recorded"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <OutputMetric
          label="Payment"
          value={recovery.payment.customer.name}
        />

        <OutputMetric
          label="Decision"
          value={actionName(diagnosisData.action)}
        />

        <OutputMetric
          label="Status"
          value={recovery.status}
        />

        <OutputMetric
          label="Amount"
          value={money(recovery.payment.amount)}
        />
      </div>

      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
        <p className="font-semibold text-emerald-300">
          ✓ Complete recovery decision trail recorded
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Detect, diagnose, decide, validate and execution
          signals are available for audit.
        </p>
      </div>
    </OutputCard>
  );
}

/* -------------------------------------------------------------------------- */
/* OUTPUT COMPONENTS */
/* -------------------------------------------------------------------------- */

function OutputCard({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
      <div className="border-b border-white/10 p-6">
        <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
          {label}
        </p>

        <h3 className="mt-2 text-2xl font-semibold">
          {title}
        </h3>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}

function OutputMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] tracking-[0.15em] text-gray-600">
        {label.toUpperCase()}
      </p>

      <p
        className={`mt-2 text-lg font-semibold ${
          highlight ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ValidationRow({
  label,
  value,
  passed,
}: {
  label: string;
  value: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
            passed
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {passed ? "✓" : "!"}
        </span>

        <span className="text-sm text-gray-400">
          {label}
        </span>
      </div>

      <span className="text-xs font-semibold text-gray-300">
        {value}
      </span>
    </div>
  );
}

function LearningSignal({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 p-5">
      <p className="text-[10px] tracking-[0.15em] text-gray-600">
        {label.toUpperCase()}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-violet-500/20">
      <div className="flex items-center justify-between">
        <span className="text-2xl text-violet-400">
          {icon}
        </span>

        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      </div>

      <p className="mt-5 text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Decision({
  title,
  probability,
  description,
}: {
  title: string;
  probability: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 p-5 transition hover:border-violet-500/20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>

        <span className="text-xs font-bold text-emerald-400">
          {probability}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-500">
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
    <div className="rounded-xl bg-white/[0.025] p-5">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}