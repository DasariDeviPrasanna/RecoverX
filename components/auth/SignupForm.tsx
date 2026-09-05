"use client";

import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase";
import GoogleSignInButton from "./GoogleSignInButton";

export default function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!businessName.trim()) {
      setError("Please enter your business name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Create Firebase account
      const result =
        await createUserWithEmailAndPassword(
          firebaseAuth,
          email.trim(),
          password
        );

      const user = result.user;

      // Store the user's display name in Firebase
      await updateProfile(user, {
        displayName: name.trim(),
      });

      // Get Firebase ID token
      const idToken = await user.getIdToken(true);

      // Create RecoverX server session
      const response = await fetch(
        "/api/auth/session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken,
            businessName:
              businessName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to create RecoverX session."
        );
      }

      // Store basic profile information
      localStorage.setItem(
        "recoverx_user_name",
        name.trim()
      );

      localStorage.setItem(
        "recoverx_user_email",
        email.trim()
      );

      localStorage.setItem(
        "recoverx_business_name",
        businessName.trim()
      );

      router.replace("/");
    } catch (error: unknown) {
      console.error(
        "Account creation error:",
        error
      );

      const firebaseError = error as {
        code?: string;
      };

      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError(
            "An account already exists with this email."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/weak-password":
          setError(
            "Password is too weak. Use at least 6 characters."
          );
          break;

        case "auth/operation-not-allowed":
          setError(
            "Email/password authentication is not enabled in Firebase."
          );
          break;

        default:
          setError(
            error instanceof Error
              ? error.message
              : "Unable to create your account."
          );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSignup}
        className="space-y-4"
      >
        {/* Name */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Your name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Prasanna Dasari"
            autoComplete="name"
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/30"
          />
        </div>

        {/* Business */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Business name
          </label>

          <input
            type="text"
            value={businessName}
            onChange={(event) =>
              setBusinessName(event.target.value)
            }
            placeholder="Your business"
            autoComplete="organization"
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/30"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="merchant@example.com"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/30"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="At least 6 characters"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/30"
          />
        </div>

        {/* Confirm password */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Confirm password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/30"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-5 text-red-300">
            {error}
          </div>
        )}

        {/* Create Account */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3.5 text-sm font-bold text-black shadow-lg shadow-cyan-500/10 transition hover:scale-[1.01] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Creating account..."
            : "Create RecoverX Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />

        <span className="text-xs uppercase tracking-wider text-zinc-600">
          or
        </span>

        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Google */}
      <GoogleSignInButton />

      {/* Sign in */}
      <div className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}