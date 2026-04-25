"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ReseedPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__paddocpro_reseed?.();
    }
    router.replace("/");
  }, [router]);
  return null;
}
