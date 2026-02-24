"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/** Decode JWT payload and check if it is still valid (not expired) */
function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is Unix seconds, Date.now() is ms
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // null = still checking, true = ok to render
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const isLoginPage = pathname === "/admin/login";

    if (!token || !isTokenValid(token)) {
      // No token, or token is expired — clear it and redirect
      localStorage.removeItem("adminToken");
      if (!isLoginPage) {
        router.replace("/admin/login");
        // Keep ready = null so children never render during redirect
      } else {
        setReady(true); // On login page itself, allow it to render
      }
    } else {
      setReady(true);
    }
  }, [pathname]);

  // Block ALL rendering until check is done
  if (ready !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg
          className="w-10 h-10 text-indigo-400 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  return <>{children}</>;
}
