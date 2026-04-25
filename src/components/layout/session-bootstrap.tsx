"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { hydrateSession, setSession, useSession } from "@/lib/auth/current";
import { readDataset } from "@/lib/mock/store";

/** Restores session from localStorage; redirects to /login if not authenticated. */
export function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    hydrateSession();
  }, []);

  useEffect(() => {
    if (session !== null) return;
    if (typeof window === "undefined") return;
    // Auto-login as the first yard manager for demo convenience if nothing in localStorage.
    const stored = window.localStorage.getItem("pp:session");
    if (stored) return;
    const dataset = readDataset();
    const tenant = dataset.tenants[0];
    const manager = dataset.users.find((u) => u.tenantId === tenant.id && u.role === "yard_manager");
    if (manager && tenant) {
      setSession({ userId: manager.id, tenantId: tenant.id, role: "yard_manager" });
    } else {
      router.replace("/login");
    }
  }, [session, router]);

  return <>{children}</>;
}
