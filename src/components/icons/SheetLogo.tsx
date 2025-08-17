import type { SVGProps } from 'react';

export default function SheetLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" fill="hsl(var(--primary))" stroke="none" />
      <path d="M8 12h8" stroke="hsl(var(--primary-foreground))" />
      <path d="M12 8v8" stroke="hsl(var(--primary-foreground))" />
      <path
        d="M17.5 3.5c1.1 0 2 .9 2 2v0c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2v-1c0-1.1.9-2 2-2h1z"
        fill="hsl(var(--accent))"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
      />
    </svg>
  );
}
