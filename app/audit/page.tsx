"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AuditLog = {
  id: string;
  actor: string;
  event: string;
  action?: string | null;
  reason?: string | null;
  createdAt: string;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recoveries")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.auditLogs || data.logs || []);
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

        <div className="mt-6">
          <p className="text-purple-400 text-xs tracking-[0.3em]">
            GOVERNANCE
          </p>

          <h1 className="text-5xl font-serif mt-3">
            Audit Trail
          </h1>

          <p className="text-gray-400 mt-3">
            Every recovery decision and action is recorded here.
          </p>
        </div>

        <div className="mt-10 border border-white/10 rounded-2xl overflow-hidden">

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading audit events...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-xl">
                No audit events yet
              </p>

              <p className="text-gray-500 mt-2">
                Recovery decisions will appear here automatically.
              </p>
            </div>
          ) : (
            <div>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-6 border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />

                      <span className="text-purple-300 font-medium">
                        {log.event}
                      </span>
                    </div>

                    <span className="text-gray-600 text-xs">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </span>

                  </div>

                  <div className="mt-4 grid md:grid-cols-3 gap-4">

                    <div>
                      <p className="text-gray-600 text-xs">
                        ACTOR
                      </p>

                      <p className="text-gray-300 mt-1">
                        {log.actor}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-xs">
                        ACTION
                      </p>

                      <p className="text-gray-300 mt-1">
                        {log.action || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-xs">
                        REASON
                      </p>

                      <p className="text-gray-400 mt-1">
                        {log.reason || "—"}
                      </p>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </main>
  );
}