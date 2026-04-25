import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

/**
 * Stylised horse-head icon — lucide doesn't include one.
 * 24×24 viewBox, currentColor stroke, default 1.75 stroke-width to match lucide.
 */
export function HorseIcon({
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
      {/* Horse head silhouette: forehead curve → muzzle → throat → mane */}
      <path d="M5 21c0-4 1-7 3-9 1.5-1.5 2.5-2 3-3.5.5-1.5 1-3 2.5-3.5 1.5-.5 3 .5 3.5 2 .5 1.5 0 3-1 4" />
      {/* Mane */}
      <path d="M6 12c-1-1-2-2.5-1.5-4 .5-1.5 2-2 3.5-1" />
      {/* Eye */}
      <circle cx="13.5" cy="8.5" r="0.5" fill="currentColor" stroke="none" />
      {/* Bridle / cheek line */}
      <path d="M11 11.5l2 1" />
    </svg>
  );
}
