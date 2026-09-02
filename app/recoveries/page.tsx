import RecoveryCenter from "@/components/recoveries/RecoveryCenter";

export default function RecoveriesPage() {
  return (
    <main className="min-h-screen bg-[#08070D] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            AI RECOVERY CENTER
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Recovery{" "}
            <span className="text-zinc-500">
              Opportunities
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Review AI-generated recovery strategies, understand why
            they were selected, and control their execution.
          </p>
        </div>

        {/* Recovery opportunities */}
        <RecoveryCenter />

      </div>
    </main>
  );
}