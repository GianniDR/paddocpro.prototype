export const STATUS_PALETTE: Record<string, { dot: string; bg: string; text: string; label?: string }> = {
  // Generic
  healthy: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Healthy" },
  active: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Active" },
  current: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Current" },
  paid: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Paid" },
  resolved: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Resolved" },
  completed: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Completed" },
  confirmed: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Confirmed" },
  occupied: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Occupied" },
  good: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Good" },

  // Pending / scheduled / amber
  pending: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-900", label: "Pending" },
  scheduled: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-900", label: "Scheduled" },
  authorised: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-900", label: "Authorised" },
  due_30d: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-900", label: "Due 30 d" },
  in_progress: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-900", label: "In progress" },
  tentative: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-900", label: "Tentative" },
  fair: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-900", label: "Fair" },
  invited: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-900", label: "Invited" },

  // Red / destructive
  overdue: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-900", label: "Overdue" },
  missed: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-900", label: "Missed" },
  expired: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-900", label: "Expired" },
  critical: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-900", label: "Critical" },
  serious: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-900", label: "Serious" },
  vet_care: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-900", label: "Vet care" },
  poor: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-900", label: "Poor" },
  voided: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-900", label: "Voided" },

  // Brass / warning
  monitoring: { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-900", label: "Monitoring" },
  moderate: { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-900", label: "Moderate" },
  under_review: { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-900", label: "Under review" },
  action_taken: { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-900", label: "Action taken" },

  // Royal purple — isolation
  isolating: { dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-900", label: "Isolating" },
  isolation: { dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-900", label: "Isolation" },

  // Slate — vacant / inactive
  vacant: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700", label: "Vacant" },
  inactive: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700", label: "Inactive" },
  archived: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700", label: "Archived" },
  cancelled: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700", label: "Cancelled" },
  closed: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700", label: "Closed" },
  draft: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700", label: "Draft" },
  maintenance: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700", label: "Maintenance" },

  // Severity minor
  minor: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-900", label: "Minor" },

  // Default
  default: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700" },
};

export function statusEntry(key: string) {
  return STATUS_PALETTE[key] ?? STATUS_PALETTE.default;
}
