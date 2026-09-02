"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Payment = {
  amount: number;
  status: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  language: string;
  lifetimeValue: number;
  riskScore: number;
  payments: Payment[];
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data) => {
        const payments = data.payments || data || [];

        const map = new Map<string, Customer>();

        payments.forEach((payment: any) => {
          if (!payment.customer) return;

          const customer = payment.customer;

          if (!map.has(customer.id)) {
            map.set(customer.id, {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              language: customer.language,
              lifetimeValue: customer.lifetimeValue,
              riskScore: customer.riskScore,
              payments: [],
            });
          }

          map.get(customer.id)?.payments.push(payment);
        });

        setCustomers(Array.from(map.values()));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#08070D] text-white p-8">
      <div className="max-w-7xl mx-auto">

        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          ← Back to Overview
        </Link>

        <h1 className="text-4xl font-serif mt-4">
          Customers
        </h1>

        <p className="text-gray-400 mt-2 mb-8">
          Customer value, payment behavior and recovery risk.
        </p>

        {loading ? (
          <div className="text-gray-400">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="border border-white/10 rounded-2xl p-10 text-center">
            <h2 className="text-xl">
              No customers yet
            </h2>

            <p className="text-gray-500 mt-2">
              Customers will appear when payments are added.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {customers.map((customer) => (
              <div
                key={customer.id}
                className="border border-white/10 bg-white/[0.03] rounded-2xl p-6"
              >

                <div className="flex justify-between">

                  <div>
                    <h2 className="text-xl font-semibold">
                      {customer.name}
                    </h2>

                    <p className="text-gray-500 text-sm">
                      {customer.email}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300">
                    {customer.name.charAt(0)}
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">

                  <div>
                    <p className="text-gray-500 text-xs">
                      Lifetime Value
                    </p>

                    <p className="text-lg">
                      ₹
                      {Number(
                        customer.lifetimeValue
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">
                      Risk Score
                    </p>

                    <p className="text-lg">
                      {customer.riskScore}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">
                      Language
                    </p>

                    <p>
                      {customer.language}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">
                      Payments
                    </p>

                    <p>
                      {customer.payments.length}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}