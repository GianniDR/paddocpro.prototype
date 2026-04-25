import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  sub,
  href,
  tone = "default",
  testId,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
  tone?: "default" | "warning" | "danger" | "success";
  testId?: string;
}) {
  const inner = (
    <CardContent className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-3xl font-semibold mt-1 tabular-nums",
          tone === "danger" && "text-destructive",
          tone === "warning" && "text-amber-600",
          tone === "success" && "text-primary",
        )}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </CardContent>
  );
  if (href) {
    return (
      <Link href={href} data-testid={testId} className="block">
        <Card className="transition-colors hover:bg-accent/40 cursor-pointer">{inner}</Card>
      </Link>
    );
  }
  return (
    <Card data-testid={testId}>
      {inner}
    </Card>
  );
}
