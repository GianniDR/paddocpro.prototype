import { differenceInDays, differenceInHours, differenceInMinutes, format, parseISO } from "date-fns";

export function formatDate(d: string | Date | null | undefined, variant: "long" | "short" = "long"): string {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  if (variant === "short") return format(date, "d MMM");
  return format(date, "d MMM yyyy");
}

export function formatDateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "d MMM yyyy HH:mm");
}

export function formatTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "HH:mm");
}

export function formatRelative(d: string | Date | null | undefined, ref: Date = new Date()): string {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  const mins = differenceInMinutes(date, ref);
  const hours = differenceInHours(date, ref);
  const days = differenceInDays(date, ref);
  if (Math.abs(mins) < 60) return mins >= 0 ? `in ${mins} min` : `${-mins} min ago`;
  if (Math.abs(hours) < 36) return hours >= 0 ? `in ${hours} h` : `${-hours} h ago`;
  if (Math.abs(days) < 14) return days >= 0 ? `in ${days} d` : `${-days} d ago`;
  return formatDate(d);
}

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export function formatGbp(pence: number | null | undefined): string {
  if (pence == null) return "—";
  return GBP.format(pence / 100);
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-GB").format(n);
}

export function formatPercent(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

export function formatHands(h: number): string {
  const whole = Math.floor(h);
  const tenth = Math.round((h - whole) * 10);
  return `${whole}.${tenth}hh`;
}
