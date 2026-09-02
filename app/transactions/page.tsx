"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Payment = {
  id: string;
  amount: number;
  status: string;
  failureReason?: string | null;
  riskScore: number;
  riskLevel: string;
  recoveryStatus: string;
  retryCount: number;
  customer?: {
    name: string;
    email: string;
  };
};

export default function TransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data) => {
        setPayments(data.payments || data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#08070D] text-white p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              ← Back to Overview
            </Link>

            <h1 className="text-4xl font-serif mt-4">
              Transactions
            </h1>

            <p className="text-gray-400 mt-2">
              Monitor payment activity and revenue risk.
            </p>
          </div>

          <Link
            href="/data-entry"
            className="bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl"
          >
            + Add Payment
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              Loading transactions...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-xl">
                No transactions yet
              </p>

              <p className="text-gray-500 mt-2">
                Add a payment to start monitoring revenue.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="border-b border-white/10">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-5">Customer</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Risk</th>
                    <th className="p-5">Recovery</th>
                    <th className="p-5">Retries</th>
                  </tr>
                </thead>

                <tbody>

                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-white/5 hover:bg-white/[0.03]"
                    >

                      <td className="p-5">
                        <div>
                          {payment.customer?.name || "Unknown"}
                        </div>

                        <div className="text-xs text-gray-500">
                          {payment.customer?.email || ""}
                        </div>
                      </td>

                      <td className="p-5 font-semibold">
                        ₹
                        {Number(payment.amount).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="p-5">
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">
                          {payment.status}
                        </span>
                      </td>

                      <td className="p-5">

                        <span
                          className={
                            payment.riskLevel === "CRITICAL"
                              ? "text-red-400"
                              : payment.riskLevel === "HIGH"
                              ? "text-orange-400"
                              : payment.riskLevel === "MEDIUM"
                              ? "text-yellow-400"
                              : "text-green-400"
                          }
                        >
                          {payment.riskScore} ·{" "}
                          {payment.riskLevel}
                        </span>

                      </td>

                      <td className="p-5 text-gray-300">
                        {payment.recoveryStatus}
                      </td>

                      <td className="p-5 text-gray-400">
                        {payment.retryCount}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}