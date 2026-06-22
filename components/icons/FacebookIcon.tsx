import type { SVGProps } from "react";

export function FacebookIcon({ size = 20, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M14 21v-8h3l.5-3H14V8.3c0-1.1.4-1.8 1.9-1.8H18V3.8c-.7-.1-1.5-.2-2.5-.2-2.6 0-4.5 1.6-4.5 4.6V10H8v3h3v8" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
