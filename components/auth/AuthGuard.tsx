"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Login page is public.
    if (
  pathname === "/login" ||
  pathname === "/signup"
) {
  setChecking(false);
  return;
}

    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (user) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        setChecking(false);
      }
    );

    return () => unsubscribe();
  }, [pathname, router]);

  if (checking && pathname !== "/login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08070D] text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

          <p className="mt-4 text-sm text-white/40">
            Verifying RecoverX session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}