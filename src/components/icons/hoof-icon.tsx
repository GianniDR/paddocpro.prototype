import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

/** Hoof print silhouette — used for paddock / turnout. */
export function HoofIcon({
  size = 24,
  strokeWidth = 1.75,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer hoof — rounded U-shape */}
      <path d="M12 3c-3.5 0-6 2.5-6 6.5 0 3 1.5 5 3 7l1.5 4c.3 1 1.7 1 2 0L14 16.5c1.5-2 3-4 3-7 0-4-2.5-6.5-5-6.5z" />
      {/* Frog (V groove) */}
      <path d="M10 11l2 3 2-3" />
    </svg>
  );
}
