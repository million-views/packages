import { useEffect, useState } from "react";

// ===========================================================
// Mock React Router Functions
// (MAYBE SSR SAFE, MEANT TO BE USED FOR DEMO/PREVIEW ARTIFACTS)
// ===========================================================

// SSR-safe mock Link component to simulate React Router's Link
export function Link({ to, children, className, ...rest }) {
  const handleClick = (e) => {
    e.preventDefault();
    // Only update history in the browser
    if (typeof window !== "undefined") {
      // Update the URL without page reload
      window.history.pushState({}, "", to);
      // Trigger a URL change event
      window.dispatchEvent(new Event("popstate"));
    }
  };

  return (
    <a href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

// SSR-safe mock useLocation hook to simulate React Router's useLocation
export function useLocation() {
  // Start with a safe default value for SSR
  const [pathname, setPathname] = useState("/section/us");

  // Update pathname after component mounts in the browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);

      const handleLocationChange = () => {
        setPathname(window.location.pathname);
      };

      window.addEventListener("popstate", handleLocationChange);
      return () => window.removeEventListener("popstate", handleLocationChange);
    }
  }, []);

  console.log({ pathname });
  return { pathname };
}

// Mock matchPath function to simulate React Router's matchPath
export function matchPath(pattern, pathname) {
  // Convert string pattern to PathPattern
  const patternObj = typeof pattern === "string"
    ? { path: pattern, caseSensitive: false, end: false }
    : pattern;

  // Simple implementation for demo purposes
  // Convert route patterns with params like '/user/:id' to regex
  const regexPattern = patternObj.path
    .replace(/:[^/]+/g, "[^/]+") // Replace :param with regex for any character except /
    .replace(/\//g, "\\/"); // Escape forward slashes

  const regex = new RegExp(
    `^${regexPattern}${patternObj.end ? "$" : "(\\/.*)?$"}`,
  );

  if (regex.test(pathname)) {
    // Extract params
    const params = {};

    // Extract param names from pattern
    const paramNames = (patternObj.path.match(/:[^/]+/g) || [])
      .map((param) => param.substring(1));

    // Extract param values from pathname
    const pathSegments = pathname.split("/").filter(Boolean);
    const patternSegments = patternObj.path.split("/").filter(Boolean);

    patternSegments.forEach((segment, index) => {
      if (segment.startsWith(":")) {
        const paramName = segment.substring(1);
        params[paramName] = pathSegments[index];
      }
    });

    return {
      params,
      pathname,
      pattern: patternObj,
    };
  }

  return null;
}
