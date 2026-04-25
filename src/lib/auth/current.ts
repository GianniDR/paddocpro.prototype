"use client";

import { useSyncExternalStore } from "react";

import type { Role } from "@/types";

interface Session {
  userId: string;
  tenantId: string;
  role: Role;
}

let snapshot: Session | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => null,
  );
}

export function setSession(s: Session | null) {
  snapshot = s;
  emit();
  if (typeof window !== "undefined") {
    if (s) {
      window.localStorage.setItem("pp:session", JSON.stringify(s));
    } else {
      window.localStorage.removeItem("pp:session");
    }
  }
}

export function setRole(role: Role) {
  if (!snapshot) return;
  snapshot = { ...snapshot, role };
  emit();
  if (typeof window !== "undefined") {
    window.localStorage.setItem("pp:session", JSON.stringify(snapshot));
  }
}

export function setTenant(tenantId: string) {
  if (!snapshot) return;
  snapshot = { ...snapshot, tenantId };
  emit();
  if (typeof window !== "undefined") {
    window.localStorage.setItem("pp:session", JSON.stringify(snapshot));
  }
}

/** Restore session from localStorage on first client render. */
export function hydrateSession() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem("pp:session");
  if (raw && !snapshot) {
    try {
      snapshot = JSON.parse(raw) as Session;
      emit();
    } catch {
      // ignore corrupt
    }
  }
}

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__paddocpro_setRole = setRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__paddocpro_setTenant = setTenant;
}
