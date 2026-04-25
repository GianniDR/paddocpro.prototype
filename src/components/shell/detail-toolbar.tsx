import { cn } from "@/lib/utils";

interface DetailToolbarProps {
  className?: string;
  children: React.ReactNode;
  testId?: string;
}

export function DetailToolbar({ className, children, testId }: DetailToolbarProps) {
  return (
    <div
      className={cn(
        "h-16 bg-white border-t border-[#e5ebf1] px-4 py-4 flex items-center justify-end gap-2 shrink-0",
        className,
      )}
      data-testid={testId ?? "detail-toolbar"}
    >
      {children}
    </div>
  );
}
