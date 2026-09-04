"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase";

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(
        firebaseAuth,
        provider
      );

      const user = result.user;

      // Keep RecoverX login state
      localStorage.setItem(
        "recoverx_logged_in",
        "true"
      );

      // Store basic display information
      if (user.email) {
        localStorage.setItem(
          "recoverx_user_email",
          user.email
        );
      }

      if (user.displayName) {
        localStorage.setItem(
          "recoverx_user_name",
          user.displayName
        );
      }

      if (user.photoURL) {
        localStorage.setItem(
          "recoverx_user_photo",
          user.photoURL
        );
      }

      // Go to dashboard
      router.replace("/");
    } catch (error: unknown) {
      console.error("Google sign-in error:", error);

      const firebaseError = error as {
        code?: string;
      };

      if (
        firebaseError.code ===
        "auth/popup-closed-by-user"
      ) {
        setError("Google sign-in was cancelled.");
      } else if (
        firebaseError.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "Your browser blocked the Google sign-in popup."
        );
      } else {
        setError(
          "Google sign-in failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] font-semibold transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
          G
        </span>

        <span>
          {loading
            ? "Connecting to Google..."
            : "Continue with Google"}
        </span>
      </button>

      {error && (
        <p className="mt-3 text-center text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}