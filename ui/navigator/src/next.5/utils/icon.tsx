// file: src/next/navigator/utils/icon.ts
// Utility functions for icon rendering

import React from "react";

/**
 * Create a default icon renderer that displays a fallback for missing icons
 *
 * @param icons Map of icon names to rendering functions
 * @returns A function that renders an icon by name
 */
export function createIconRenderer(
  icons: Record<string, (size: number) => React.ReactNode> = {},
) {
  return (nameOrIcon: React.ReactNode, size: number = 20) => {
    // If it's already a ReactNode, just return it
    if (React.isValidElement(nameOrIcon)) {
      return nameOrIcon;
    }

    // If it's a string name, look up in icons map
    if (typeof nameOrIcon === "string") {
      if (icons[nameOrIcon]) {
        return icons[nameOrIcon](size);
      } else {
        // Default letter icon when icon not found
        return <LetterIcon label={String(nameOrIcon)} size={size} />;
      }
    }

    return null;
  };
}

/**
 * Create a fallback letter icon
 */
export function LetterIcon(
  { label, size = 24 }: { label: string; size?: number },
) {
  const cp = label.codePointAt(0) || 0;
  const c = String.fromCodePoint(cp).toLocaleUpperCase();
  const s = +size;
  const h = s / 2;
  const r = h - 1;
  const fs = s * 0.6;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={h} cy={h} r={r} fill="none" />
      <text
        x="50%"
        y="50%"
        dy=".35em"
        textAnchor="middle"
        fontWeight="100"
        fontFamily="system-ui"
        fontSize={fs}
      >
        {c}
      </text>
    </svg>
  );
}
