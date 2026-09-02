import PaymentForm from "@/components/data-entry/PaymentForm";

export default function DataEntryPage() {
  return (
    <main className="min-h-screen bg-[#08070D] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            MERCHANT DATA
          </div>

          <h1 className="text-4xl font-bold">
            Add Payment Data
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Enter your customer and payment information. RecoverX will
            analyze the data and identify revenue recovery opportunities.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <PaymentForm />
        </div>

      </div>
    </main>
  );
}