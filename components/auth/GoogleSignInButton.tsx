"use client";

import { useState } from "react";

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);

    window.location.href = "/api/auth/signin/google";
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition flex items-center justify-center gap-3 disabled:opacity-50"
    >
      <span className="font-semibold">
        G
      </span>

      <span>
        {loading ? "Connecting..." : "Continue with Google"}
      </span>
    </button>
  );
}