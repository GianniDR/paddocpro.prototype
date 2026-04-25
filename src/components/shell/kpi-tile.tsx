import type { LucideIcon } from "lucide-react";

interface KpiTileProps {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  variant: "amber" | "danger" | "success" | "info" | "neutral";
  onClick?: () => void;
  testId?: string;
}

const TONE: Record<KpiTileProps["variant"], { bg: string; text: string }> = {
  amber: { bg: "#fef3c7", text: "#92400e" },
  danger: { bg: "#fee2e2", text: "#991b1b" },
  success: { bg: "#dcfce7", text: "#166534" },
  info: { bg: "#dbeafe", text: "#0c2d6b" },
  neutral: { bg: "#f3f4f6", text: "#374151" },
};

export function KpiTile({ label, value, Icon, variant, onClick, testId }: KpiTileProps) {
  const tone = TONE[variant];
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className="rounded-[12px] border border-[#cad6e2] bg-white shadow-sm hover:shadow-md transition-shadow p-4 flex items-start justify-between text-left w-full"
      data-testid={testId}
    >
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-[32px] font-semibold text-foreground mt-1 tabular-nums">{value}</p>
      </div>
      <div
        style={{ background: tone.bg }}
        className="flex size-9 items-center justify-center rounded-lg shrink-0"
      >
        <Icon size={20} style={{ color: tone.text }} />
      </div>
    </Wrapper>
  );
}
