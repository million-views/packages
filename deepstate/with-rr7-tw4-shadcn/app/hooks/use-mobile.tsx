"use client";

import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < 768);

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Add event listener
    window.addEventListener("resize", checkIsMobile);

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // For debugging
  // console.log("useIsMobile returning:", isMobile);

  return isMobile;
}
