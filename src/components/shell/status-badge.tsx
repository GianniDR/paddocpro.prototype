import { cn } from "@/lib/utils";

import { statusEntry } from "./palette";

export function StatusBadge({
  status,
  className,
  testId,
}: {
  status: string;
  className?: string;
  testId?: string;
}) {
  const entry = statusEntry(status);
  return (
    <span
      role="status"
      aria-label={`Status: ${entry.label ?? status}`}
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        entry.bg,
        entry.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", entry.dot)} aria-hidden="true" />
      {entry.label ?? status.replace("_", " ")}
    </span>
  );
}
