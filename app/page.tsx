import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard";

function formatMoney(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const hasData = data.totalPayments > 0;

  return (
    <main className="min-h-screen bg-[#08070D] text-white">

      {/* ========================================================= */}
      {/* SIDEBAR                                                   */}
      {/* ========================================================= */}

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[270px] border-r border-white/10 bg-[#090811] lg:flex lg:flex-col">

        {/* Brand */}
        <div className="flex h-[82px] items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-xl text-violet-400">
              ◈
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                Recover<span className="text-violet-400">X</span>
              </div>

              <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-600">
                AI Revenue Intelligence
              </div>
            </div>

          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">

          {/* MAIN */}
          <div className="mb-7">

            <div className="mb-3 px-3 text-[10px] font-bold tracking-[0.2em] text-zinc-600">
              MAIN
            </div>

            <div className="space-y-1">

              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-3 text-sm text-cyan-300 shadow-lg shadow-cyan-500/5"
              >
                <span className="text-cyan-400">◉</span>
                <span className="font-medium">Overview</span>
              </Link>

              <Link
                href="/data-entry"
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-500 transition hover:border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-300"
              >
                <span className="text-blue-400">◇</span>
                <span>Data Entry</span>
              </Link>

              <Link
                href="/recoveries"
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-500 transition hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-300"
              >
                <span className="text-emerald-400">⚡</span>
                <span>Recovery Center</span>

                <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                  LIVE
                </span>
              </Link>

            </div>
          </div>

          {/* OPERATIONS */}
          <div className="mb-7">

            <div className="mb-3 px-3 text-[10px] font-bold tracking-[0.2em] text-zinc-600">
              OPERATIONS
            </div>

            <div className="space-y-1">

              <Link
                href="/transactions"
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-500 transition hover:border-indigo-500/20 hover:bg-indigo-500/5 hover:text-indigo-300"
              >
                <span className="text-indigo-400">▣</span>
                <span>Transactions</span>
              </Link>

              <Link
                href="/customers"
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-500 transition hover:border-pink-500/20 hover:bg-pink-500/5 hover:text-pink-300"
              >
                <span className="text-pink-400">♙</span>
                <span>Customers</span>
              </Link>

              <Link
                href="/agent"
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-500 transition hover:border-violet-500/20 hover:bg-violet-500/5 hover:text-violet-300"
              >
                <span className="text-violet-400">◎</span>
                <span>AI Agent</span>
              </Link>

              <Link
                href="/simulator"
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-500 transition hover:border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-300"
              >
                <span className="text-amber-400">▶</span>
                <span>Simulator</span>
              </Link>

            </div>
          </div>

          {/* GOVERNANCE */}
          <div>

            <div className="mb-3 px-3 text-[10px] font-bold tracking-[0.2em] text-zinc-600">
              GOVERNANCE
            </div>

            <div className="space-y-1">

              <Link
                href="/audit"
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-500 transition hover:border-orange-500/20 hover:bg-orange-500/5 hover:text-orange-300"
              >
                <span className="text-orange-400">◈</span>
                <span>Audit Trail</span>
              </Link>

              <Link
                href="/settings"
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-500 transition hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-300"
              >
                <span className="text-rose-400">⚙</span>
                <span>Recovery Policy</span>
              </Link>

            </div>
          </div>

        </nav>

        {/* Bottom sidebar */}
        <div className="border-t border-white/10 p-4">

          {/* Agent status */}
          <div className="mb-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3">

            <div className="flex items-center gap-3">

              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                ●

                <span className="absolute right-1 top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              </div>

              <div>
                <div className="text-xs font-semibold text-emerald-300">
                  Agent Online
                </div>

                <div className="text-[10px] text-zinc-600">
                  Monitoring revenue
                </div>
              </div>

            </div>

          </div>

          {/* Merchant profile */}
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold">
              PD
            </div>

            <div className="min-w-0 flex-1">

              <div className="truncate text-xs font-semibold text-zinc-200">
                Prasanna Dasari
              </div>

              <div className="text-[10px] text-zinc-600">
                Merchant Admin
              </div>

            </div>

            <span className="text-sm text-emerald-400">
              ✓
            </span>

          </div>

        </div>

      </aside>


      {/* ========================================================= */}
      {/* TOP BAR                                                    */}
      {/* ========================================================= */}

      <header className="fixed left-0 right-0 top-0 z-40 hidden h-[76px] items-center justify-between border-b border-white/10 bg-[#08070D]/90 px-6 backdrop-blur-xl lg:flex lg:left-[270px]">

        {/* Search */}
        <div className="flex w-[340px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">

          <span className="text-lg text-zinc-600">
            ⌕
          </span>

          <span className="text-sm text-zinc-600">
            Search payments, customers...
          </span>

          <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[9px] text-zinc-600">
            /
          </span>

        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-2">

            <span className="text-emerald-400">
              ✓
            </span>

            <span className="text-xs text-emerald-300">
              Razorpay Test Mode
            </span>

          </div>

          <button className="rounded-xl p-2.5 text-zinc-500 transition hover:bg-white/5 hover:text-white">
            ?
          </button>

          <button className="relative rounded-xl p-2.5 text-zinc-500 transition hover:bg-white/5 hover:text-white">
            ♢

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[10px] font-bold">
              PD
            </div>

            <div className="hidden sm:block">

              <div className="text-xs font-semibold text-zinc-200">
                Prasanna Dasari
              </div>

              <div className="text-[10px] text-zinc-600">
                Merchant Admin
              </div>

            </div>

            <span className="text-xs text-zinc-600">
              ▾
            </span>

          </div>

        </div>

      </header>


      {/* ========================================================= */}
      {/* MAIN CONTENT                                               */}
      {/* ========================================================= */}

      <div className="lg:ml-[270px] lg:pt-[76px]">

        <div className="mx-auto max-w-[1500px] px-6 py-8 xl:px-8">

          {/* Header */}
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                {hasData ? "AGENT ONLINE" : "WAITING FOR DATA"}

              </div>

              <h1 className="text-4xl font-bold tracking-tight">
                Revenue Recovery{" "}
                <span className="text-zinc-600">
                  Center
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Detect revenue leakage, diagnose the cause, and recover lost
                revenue intelligently.
              </p>

            </div>

            <Link
              href="/data-entry"
              className="rounded-xl bg-violet-600 px-6 py-3 text-center font-semibold shadow-lg shadow-violet-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-500 hover:shadow-violet-500/30"
            >
              + Add Payment
            </Link>

          </div>


          {/* ===================================================== */}
          {/* METRICS                                                */}
          {/* ===================================================== */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              title="Revenue at Risk"
              value={formatMoney(data.revenueAtRisk)}
              description={
                hasData
                  ? `${data.failedPayments} payment(s) need attention`
                  : "No payment data yet"
              }
              accent="orange"
            />

            <MetricCard
              title="Recovery Potential"
              value={formatMoney(data.recoveryPotential)}
              description={
                hasData
                  ? "Estimated recoverable revenue"
                  : "Waiting for merchant data"
              }
              accent="violet"
            />

            <MetricCard
              title="Recovered Revenue"
              value={formatMoney(data.recoveredRevenue)}
              description={
                hasData
                  ? "Revenue successfully recovered"
                  : "No recovery activity yet"
              }
              accent="emerald"
            />

            <MetricCard
              title="Recovery Rate"
              value={`${data.recoveryRate.toFixed(1)}%`}
              description={
                hasData
                  ? `${data.aiActions} AI recovery actions`
                  : "No recovery actions yet"
              }
              accent="cyan"
            />

          </div>


          {/* ===================================================== */}
          {/* MAIN PANELS                                            */}
          {/* ===================================================== */}

          <div className="mt-6 grid gap-6 lg:grid-cols-3">

            {/* Revenue panel */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 lg:col-span-2">

              <div className="mb-8 flex items-start justify-between">

                <div>
                  <h2 className="text-xl font-semibold">
                    Revenue Recovery
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Recovery performance from merchant data
                  </p>
                </div>

                <div className="rounded-lg border border-violet-500/10 bg-violet-500/5 px-3 py-2 text-xs text-violet-300">
                  LIVE ANALYTICS
                </div>

              </div>

              {!hasData ? (
                <EmptyState />
              ) : (
                <div className="grid min-h-[300px] place-items-center">

                  <div className="w-full max-w-md text-center">

                    <div className="text-6xl font-bold text-violet-400">
                      {formatMoney(data.recoveredRevenue)}
                    </div>

                    <p className="mt-3 text-zinc-500">
                      Total recovered revenue
                    </p>

                    <div className="mt-8 h-3 w-full overflow-hidden rounded-full bg-white/10">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 transition-all duration-1000"
                        style={{
                          width: `${Math.min(
                            Math.max(data.recoveryRate, 0),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    <div className="mt-3 flex justify-between text-xs text-zinc-600">
                      <span>₹0 recovered</span>
                      <span>{data.recoveryRate.toFixed(1)}%</span>
                      <span>100%</span>
                    </div>

                  </div>

                </div>
              )}

            </section>


            {/* AI Agent */}
            <section className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-cyan-500/[0.04] p-6">

              <div className="mb-8 flex items-center gap-3">

                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-xl text-violet-300">
                  ◈

                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Recovery Agent
                  </h2>

                  <p className="text-sm text-emerald-400">
                    ● {hasData ? "Analyzing data" : "Waiting for data"}
                  </p>
                </div>

              </div>


              <AgentStep
                number="01"
                title="Detect"
                value={
                  hasData
                    ? `${data.totalPayments} events analyzed`
                    : "Waiting for transactions"
                }
                active={hasData}
              />

              <AgentStep
                number="02"
                title="Diagnose"
                value={
                  hasData
                    ? `${data.highRiskPayments} high-risk payment(s)`
                    : "Waiting for risks"
                }
                active={hasData}
              />

              <AgentStep
                number="03"
                title="Decide"
                value={
                  hasData
                    ? `${data.aiActions} action(s) available`
                    : "Waiting for opportunities"
                }
                active={hasData}
              />

              <AgentStep
                number="04"
                title="Recover"
                value={
                  data.recoveredRevenue > 0
                    ? `${formatMoney(data.recoveredRevenue)} recovered`
                    : "No recovery yet"
                }
                active={data.recoveredRevenue > 0}
                last
              />

            </section>

          </div>


          {/* ===================================================== */}
          {/* QUICK INTELLIGENCE                                     */}
          {/* ===================================================== */}

          <section className="mt-6">

            {!hasData ? (

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-2xl text-violet-300">
                  ✦
                </div>

                <h2 className="text-2xl font-semibold">
                  Your recovery intelligence starts here
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-zinc-500">
                  Add your first payment or customer entry. RecoverX will
                  automatically calculate revenue at risk, recovery potential,
                  risk levels, and recovery opportunities.
                </p>

                <Link
                  href="/data-entry"
                  className="mt-6 inline-flex rounded-xl border border-violet-500/30 bg-violet-500/10 px-6 py-3 font-medium text-violet-300 transition hover:bg-violet-500/20"
                >
                  Add Your First Payment →
                </Link>

              </div>

            ) : (

              <div className="grid gap-4 md:grid-cols-3">

                <InfoBox
                  title="Payments"
                  value={data.totalPayments.toString()}
                  description="Total payment events"
                  accent="cyan"
                />

                <InfoBox
                  title="Failed / Abandoned"
                  value={data.failedPayments.toString()}
                  description="Require recovery attention"
                  accent="orange"
                />

                <InfoBox
                  title="High Risk"
                  value={data.highRiskPayments.toString()}
                  description="Priority recovery cases"
                  accent="rose"
                />

              </div>

            )}

          </section>


          {/* ===================================================== */}
          {/* FOOTER STATUS                                          */}
          {/* ===================================================== */}

          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/5 pt-5 text-[11px] text-zinc-600 sm:flex-row">

            <div>
              RecoverX AI Revenue Intelligence
            </div>

            <div className="flex items-center gap-4">

              <span>
                Test Environment
              </span>

              <span className="flex items-center gap-1.5 text-emerald-500/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Systems operational
              </span>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}


/* =============================================================== */
/* COMPONENTS                                                       */
/* =============================================================== */

function MetricCard({
  title,
  value,
  description,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  accent: "orange" | "violet" | "emerald" | "cyan";
}) {
  const accentClasses = {
    orange: "hover:border-orange-500/30",
    violet: "hover:border-violet-500/30",
    emerald: "hover:border-emerald-500/30",
    cyan: "hover:border-cyan-500/30",
  };

  const valueClasses = {
    orange: "group-hover:text-orange-300",
    violet: "group-hover:text-violet-300",
    emerald: "group-hover:text-emerald-300",
    cyan: "group-hover:text-cyan-300",
  };

  return (
    <div
      className={`group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.045] ${accentClasses[accent]}`}
    >
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p
        className={`mt-4 text-3xl font-bold tracking-tight transition ${valueClasses[accent]}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  );
}


function EmptyState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-2xl text-violet-300">
        ◌
      </div>

      <h3 className="font-semibold">
        No recovery data yet
      </h3>

      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Add payment entries to start generating recovery intelligence.
      </p>

    </div>
  );
}


function AgentStep({
  number,
  title,
  value,
  active,
  last = false,
}: {
  number: string;
  title: string;
  value: string;
  active: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative mb-5 flex items-center gap-4">

      {!last && (
        <div className="absolute left-[17px] top-9 h-7 w-px bg-violet-500/20" />
      )}

      <div
        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs transition ${
          active
            ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
            : "border-white/10 text-zinc-600"
        }`}
      >
        {number}
      </div>

      <div className="min-w-0">

        <p className="font-medium">
          {title}
        </p>

        <p className="text-sm text-zinc-500">
          {value}
        </p>

      </div>

    </div>
  );
}


function InfoBox({
  title,
  value,
  description,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  accent: "cyan" | "orange" | "rose";
}) {
  const styles = {
    cyan: "border-cyan-500/10 bg-cyan-500/[0.025]",
    orange: "border-orange-500/10 bg-orange-500/[0.025]",
    rose: "border-rose-500/10 bg-rose-500/[0.025]",
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 ${styles[accent]}`}
    >
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  );
}