import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

/** Fenced field / paddock icon. */
export function PaddockIcon({
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
      {/* Top + bottom rails */}
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      {/* Vertical posts */}
      <path d="M6 6v15" />
      <path d="M12 6v15" />
      <path d="M18 6v15" />
      {/* Top — gate finials */}
      <path d="M6 6l1-2" />
      <path d="M12 6l1-2" />
      <path d="M18 6l1-2" />
    </svg>
  );
}
