import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
  testId,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  cta?: React.ReactNode;
  testId?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn("flex flex-col items-center justify-center py-16 px-6 text-center gap-3", className)}
      data-testid={testId}
    >
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/70" aria-hidden="true" />}
      <h2 className="text-base font-medium">{title}</h2>
      {body && <p className="text-sm text-muted-foreground max-w-md">{body}</p>}
      {cta && <div className="pt-2">{cta}</div>}
    </div>
  );
}
