import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

/** Bridle / tack icon — used for tack and equipment. */
export function BridleIcon({
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
      {/* Headpiece — top loop */}
      <path d="M6 6h12" />
      {/* Cheekpieces */}
      <path d="M7 6v8" />
      <path d="M17 6v8" />
      {/* Noseband */}
      <path d="M7 14h10" />
      {/* Bit ring */}
      <circle cx="12" cy="14" r="2.5" />
      {/* Reins */}
      <path d="M9.5 16.5l-2 4" />
      <path d="M14.5 16.5l2 4" />
    </svg>
  );
}
