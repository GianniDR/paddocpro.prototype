"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PaddyTrigger() {
  return (
    <Button
      variant="outline"
      size="sm"
      data-testid="topbar-paddy-trigger"
      className="h-8 gap-2 border-foreground/15 bg-card hover:bg-accent/50"
      onClick={() => {
        // Plan 22 lands the actual panel; for now show a friendly toast.
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("paddy:toggle"));
        }
      }}
    >
      <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      <span className="hidden sm:inline">Ask Paddy</span>
      <kbd className="hidden md:inline-flex items-center rounded border bg-muted px-1 text-[10px] font-medium text-muted-foreground">
        ⌘J
      </kbd>
    </Button>
  );
}
