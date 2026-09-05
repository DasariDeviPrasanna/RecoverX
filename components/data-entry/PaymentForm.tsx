"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    amount: "",
    status: "FAILED",
    failureReason: "Insufficient funds",
    dueDate: "",
    retryCount: "0",
    language: "English",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (!form.customerName.trim()) {
      setMessage("Please enter the customer name.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setMessage("Please enter a valid payment amount.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          amount: Number(form.amount),
          status: form.status,
          failureReason: form.failureReason,
          dueDate: form.dueDate || null,
          retryCount: Number(form.retryCount),
          language: form.language,
        }),
      });

      const text = await response.text();

      let data: {
        error?: string;
        success?: boolean;
      };

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to add payment");
      }

      // Payment successfully saved
      setMessage("Payment added successfully! Analyzing...");

      // Give the success message a moment to appear
      setTimeout(() => {
        router.push("/agent");
      }, 500);
    } catch (error) {
      console.error("PAYMENT FORM ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while adding the payment."
      );

      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Information */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          Customer Information
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Enter the customer associated with this payment.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label="Customer Name"
            name="customerName"
            placeholder="Rahul Kumar"
            value={form.customerName}
            onChange={handleChange}
            required
          />

          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="rahul@example.com"
            value={form.email}
            onChange={handleChange}
          />

          <Field
            label="Phone"
            name="phone"
            placeholder="9876543210"
            value={form.phone}
            onChange={handleChange}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Language
            </label>

            <select
              name="language"
              value={form.language}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-violet-500"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          Payment Information
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Enter the payment details RecoverX should analyze.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label="Payment Amount (₹)"
            name="amount"
            type="number"
            placeholder="8500"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Payment Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-violet-500"
            >
              <option value="FAILED">Failed</option>
              <option value="ABANDONED">Abandoned</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Successful</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Failure Reason
            </label>

            <select
              name="failureReason"
              value={form.failureReason}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-violet-500"
            >
              <option value="Insufficient funds">
                Insufficient funds
              </option>
              <option value="Card declined">Card declined</option>
              <option value="Bank timeout">Bank timeout</option>
              <option value="Authentication failed">
                Authentication failed
              </option>
              <option value="Payment abandoned">
                Payment abandoned
              </option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <Field
            label="Due Date"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
          />

          <Field
            label="Previous Retry Attempts"
            name="retryCount"
            type="number"
            min="0"
            max="10"
            placeholder="0"
            value={form.retryCount}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.includes("successfully")
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 px-6 py-4 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Analyzing Payment..." : "Add Payment & Analyze →"}
      </button>

      <p className="text-center text-xs text-zinc-600">
        RecoverX will analyze this payment after it is added.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-700 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
      />
    </div>
  );
}