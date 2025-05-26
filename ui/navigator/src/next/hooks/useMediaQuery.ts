// file: next/hooks/useMediaQuery.ts
// Custom hook for responsive media queries with SSR support

import { useState, useEffect } from 'react';

/**
 * Hook to handle media queries in a SSR-safe way
 * 
 * @param query The media query to evaluate (e.g., "(min-width: 768px)")
 * @returns Boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with SSR-friendly default (false)
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    // Create media query
    const mediaQuery = window.matchMedia(query);

    // Update state initially
    setMatches(mediaQuery.matches);

    // Handler for media query changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener using the appropriate method
    if (mediaQuery.addEventListener) {
      // Modern browsers
      mediaQuery.addEventListener('change', handler);
    } else {
      // Legacy browsers
      // @ts-ignore - for older browsers that don't support addEventListener
      mediaQuery.addListener(handler);
    }

    // Cleanup when component unmounts or query changes
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // @ts-ignore - for older browsers that don't support removeEventListener
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}