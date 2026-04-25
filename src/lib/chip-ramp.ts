export interface ChipRamp {
  pressedBg: string;
  pressedBorder: string;
  pressedDot: string;
}

export const CHIP_RAMP_FALLBACK: ChipRamp = {
  pressedBg: "#f2f5f8",
  pressedBorder: "#bdccdb",
  pressedDot: "#4c5258",
};

export const CHIP_RAMP: Record<string, ChipRamp> = {
  // Health
  healthy: { pressedBg: "#f0fdf4", pressedBorder: "#86efac", pressedDot: "#16a34a" },
  isolating: { pressedBg: "#fef2f2", pressedBorder: "#fca5a5", pressedDot: "#dc2626" },
  vet_care: { pressedBg: "#fff7ed", pressedBorder: "#fdba74", pressedDot: "#ea580c" },

  // Vacc / due
  current: { pressedBg: "#f0fdf4", pressedBorder: "#86efac", pressedDot: "#16a34a" },
  due_30d: { pressedBg: "#fffbeb", pressedBorder: "#fcd34d", pressedDot: "#d97706" },
  overdue: { pressedBg: "#fef2f2", pressedBorder: "#fca5a5", pressedDot: "#dc2626" },

  // Stable status
  vacant: { pressedBg: "#f0fdf4", pressedBorder: "#86efac", pressedDot: "#16a34a" },
  occupied: { pressedBg: "#eff6ff", pressedBorder: "#93c5fd", pressedDot: "#2563eb" },
  maintenance: { pressedBg: "#f5f3ff", pressedBorder: "#c4b5fd", pressedDot: "#7c3aed" },

  // Invoice / finance
  draft: { pressedBg: "#f3f4f6", pressedBorder: "#d1d5db", pressedDot: "#4b5563" },
  sent: { pressedBg: "#eff6ff", pressedBorder: "#93c5fd", pressedDot: "#2563eb" },
  paid: { pressedBg: "#f0fdf4", pressedBorder: "#86efac", pressedDot: "#16a34a" },
  partial: { pressedBg: "#fffbeb", pressedBorder: "#fcd34d", pressedDot: "#d97706" },
  voided: { pressedBg: "#f5f5f4", pressedBorder: "#d6d3d1", pressedDot: "#78716c" },

  // Generic states
  all: { pressedBg: "#202228", pressedBorder: "#202228", pressedDot: "#fefdfc" },
  open: { pressedBg: "#eff6ff", pressedBorder: "#93c5fd", pressedDot: "#2563eb" },
  closed: { pressedBg: "#f3f4f6", pressedBorder: "#d1d5db", pressedDot: "#4b5563" },
  resolved: { pressedBg: "#f0fdf4", pressedBorder: "#86efac", pressedDot: "#16a34a" },
};

export function rampFor(slug: string): ChipRamp {
  return CHIP_RAMP[slug] ?? CHIP_RAMP_FALLBACK;
}
