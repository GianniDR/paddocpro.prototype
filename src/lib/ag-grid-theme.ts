import { type Theme,themeQuartz } from "ag-grid-community";

/**
 * PaddocPro AG Grid theme — derives from quartz with brand tokens.
 * All colours reference CSS custom properties so dark-mode toggles automatically.
 *
 * Source of truth: design/brand-tokens.md §4 + design/fitness-checklists.md §1.
 */
export const paddocproTheme: Theme = themeQuartz.withParams({
  fontFamily: "var(--font-geist-sans)",
  fontSize: 14,
  headerFontWeight: 500,
  headerBackgroundColor: "var(--muted)",
  headerTextColor: "var(--muted-foreground)",
  oddRowBackgroundColor: "transparent",
  rowHoverColor: "color-mix(in oklch, var(--accent) 35%, transparent)",
  selectedRowBackgroundColor: "color-mix(in oklch, var(--primary) 8%, transparent)",
  borderColor: "var(--border)",
  wrapperBorderRadius: 6,
  rowHeight: 44,
  headerHeight: 40,
});
