"use client";

import { FormEvent, useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase";
import GoogleSignInButton from "./GoogleSignInButton";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result =
        await signInWithEmailAndPassword(
          firebaseAuth,
          email.trim(),
          password
        );

      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken(true);

      // Create secure RecoverX session
      const response = await fetch(
        "/api/auth/session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to create RecoverX session"
        );
      }

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

      router.replace("/");
    } catch (error: unknown) {
      console.error(
        "Email sign-in error:",
        error
      );

      const firebaseError = error as {
        code?: string;
      };

      switch (firebaseError.code) {
        case "auth/invalid-credential":
          setError(
            "Incorrect email or password."
          );
          break;

        case "auth/user-not-found":
          setError(
            "No account exists with this email."
          );
          break;

        case "auth/wrong-password":
          setError(
            "Incorrect password."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many attempts. Please try again later."
          );
          break;

        default:
          setError(
            error instanceof Error
              ? error.message
              : "Sign in failed. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError(
        "Enter your email address first."
      );
      return;
    }

    setResetting(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(
        firebaseAuth,
        email.trim()
      );

      setMessage(
        "Password reset email sent. Check your inbox."
      );
    } catch (error: unknown) {
      console.error(
        "Password reset error:",
        error
      );

      setError(
        "Unable to send password reset email."
      );
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleLogin}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@company.com"
            autoComplete="email"
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/50 focus:bg-white/[0.06]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/50 focus:bg-white/[0.06]"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Signing in..."
            : "Sign In"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={resetting}
          className="w-full text-center text-sm text-cyan-300 transition hover:text-cyan-200 disabled:opacity-50"
        >
          {resetting
            ? "Sending reset email..."
            : "Forgot password?"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />

        <span className="text-xs uppercase tracking-wider text-white/30">
          OR
        </span>

        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleSignInButton />
    </div>
  );
}