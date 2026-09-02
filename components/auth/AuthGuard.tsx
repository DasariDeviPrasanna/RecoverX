"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/login") {
      setChecking(false);
      return;
    }

    const loggedIn =
      localStorage.getItem("recoverx_logged_in") === "true" ||
      sessionStorage.getItem("recoverx_logged_in") === "true";

    if (!loggedIn) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-[#08070D] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-gray-500 mt-4">
            Loading RecoverX...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}