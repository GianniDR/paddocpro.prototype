"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface Ctx {
  setEntityLabel: (id: string, label: string) => void;
  entityLabels: Map<string, string>;
}

const BreadcrumbTrailCtx = createContext<Ctx | null>(null);

export function BreadcrumbTrailProvider({ children }: { children: React.ReactNode }) {
  const [labels, setLabels] = useState<Map<string, string>>(new Map());
  const setEntityLabel = useCallback((id: string, label: string) => {
    setLabels((prev) => {
      if (prev.get(id) === label) return prev;
      const next = new Map(prev);
      next.set(id, label);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ setEntityLabel, entityLabels: labels }), [labels, setEntityLabel]);
  return <BreadcrumbTrailCtx.Provider value={value}>{children}</BreadcrumbTrailCtx.Provider>;
}

export function useBreadcrumbTrail() {
  const ctx = useContext(BreadcrumbTrailCtx);
  if (!ctx) throw new Error("useBreadcrumbTrail must be used inside BreadcrumbTrailProvider");
  return ctx;
}
