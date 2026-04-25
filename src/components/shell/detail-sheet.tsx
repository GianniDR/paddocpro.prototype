"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function DetailSheet({
  open,
  onClose,
  title,
  subtitle,
  testId,
  toolbar,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  testId: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[780px] lg:max-w-[85vw] xl:max-w-[1100px] p-0 flex flex-col bg-card"
        data-testid={testId}
      >
        <SheetHeader className="px-4 py-3 border-b flex-row items-center gap-2">
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-base font-medium truncate">{title}</SheetTitle>
            {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
            data-testid={`${testId}-close`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </SheetHeader>
        {toolbar && (
          <div
            className="border-b px-4 py-2 flex items-center gap-2 flex-wrap"
            data-testid={`${testId}-toolbar`}
          >
            {toolbar}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

/** Helper: read/write `?id=<entityId>` for sheet-based detail views. */
export function useIdParam(): [string | null, (id: string | null) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const setId = (next: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("id", next);
    else params.delete("id");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname);
  };
  return [id, setId];
}
