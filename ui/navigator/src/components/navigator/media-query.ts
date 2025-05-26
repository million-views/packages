// file: media-query.ts
// A modern, SSR-safe media query hook using React 19 features

import { useState, useEffect, cache } from "react";

// Cache the media query result for better performance across components
const createMediaQueryMatcher = cache((query: string) => {
  // Return a function that sets up the media query on the client
  return () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      // Default to false for SSR
      return false;
    }

    const mediaQuery = window.matchMedia(query);
    return mediaQuery.matches;
  };
});

export function useMediaQuery(query: string): boolean {
  // Get our cached matcher
  const getMatchingState = createMediaQueryMatcher(query);

  // Initialize state - false for SSR, then updated on client
  const [matches, setMatches] = useState(() => getMatchingState());

  useEffect(() => {
    // Safety check for SSR
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    // Get media query
    const mediaQuery = window.matchMedia(query);

    // Update on mount to ensure client-side value
    setMatches(mediaQuery.matches);

    // Handler function for updates
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (using modern API)
    mediaQuery.addEventListener("change", handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}