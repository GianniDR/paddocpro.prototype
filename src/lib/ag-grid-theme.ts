import { type Theme, themeQuartz } from "ag-grid-community";

/**
 * PaddocPro AG Grid theme — re-tokened to match riskhub-1experience quartz spec.
 */
export const paddocproTheme: Theme = themeQuartz.withParams({
  accentColor: "#202228",
  backgroundColor: "#FFFFFF",
  borderColor: "#BDCCDB",
  borderRadius: 4,
  cellHorizontalPaddingScale: 1,
  cellTextColor: "#717a83",
  columnBorder: false,
  fontFamily: "var(--font-geist-sans)",
  fontSize: 14,
  foregroundColor: "#131416",
  headerBackgroundColor: "#FFFFFF",
  headerFontFamily: "var(--font-geist-sans)",
  headerRowBorder: true,
  headerTextColor: "#131416",
  iconSize: 16,
  oddRowBackgroundColor: "#FFFFFF",
  rowHoverColor: "#e3eeff80",
  selectedRowBackgroundColor: "#e3eeff",
  rowBorder: true,
  rowVerticalPaddingScale: 1,
  spacing: 8,
  wrapperBorder: true,
  wrapperBorderRadius: 12,
});
