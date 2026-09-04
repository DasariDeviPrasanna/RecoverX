"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToOverview() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-2.5 text-sm font-medium text-cyan-300 transition-all duration-200 hover:-translate-x-0.5 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Overview
    </Link>
  );
}