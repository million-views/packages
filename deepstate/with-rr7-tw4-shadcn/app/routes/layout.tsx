import { useState } from "react";
import {
  Link,
  matchPath,
  Outlet,
  useLocation,
  useNavigation,
} from "react-router";
import { Loader } from "lucide-react";
import { navigationTree, useHydratedMatches } from "@/lib/nav";
import { Icon } from "~/components/icon-mapper";

// import Navigator from "@/components/navigator5";
import { Navigator } from "~/components/navigator";

const renderIcon = (iconName: string) => <Icon name={iconName} />;

/*
// SSR-safe mock Link component to simulate React Router's Link
const Link = ({ to, children, className, ...rest }: any) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Only update history in the browser
    if (typeof window !== "undefined") {
      // Update the URL without page reload
      window.history.pushState({}, "", to)
      // Trigger a URL change event
      window.dispatchEvent(new Event("popstate"))
    }
  }

  return (
    <a href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}

// SSR-safe mock useLocation hook to simulate React Router's useLocation
const useLocation = () => {
  // Start with a safe default value for SSR
  const [pathname, setPathname] = useState("/")

  // Update pathname after component mounts in the browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname)

      const handleLocationChange = () => {
        setPathname(window.location.pathname)
      }

      window.addEventListener("popstate", handleLocationChange)
      return () => window.removeEventListener("popstate", handleLocationChange)
    }
  }, [])

  return { pathname }
}

// Mock matchPath function to simulate React Router's matchPath
const matchPath = <ParamKey extends string = string>(
  pattern: PathPattern | string,
  pathname: string,
): PathMatch<ParamKey> | null => {
  // Convert string pattern to PathPattern
  const patternObj = typeof pattern === "string" ? { path: pattern, caseSensitive: false, end: false } : pattern

  // Simple implementation for demo purposes
  // Convert route patterns with params like '/user/:id' to regex
  const regexPattern = patternObj.path
    .replace(/:[^/]+/g, "[^/]+") // Replace :param with regex for any character except /
    .replace(/\//g, "\\/") // Escape forward slashes

  const regex = new RegExp(`^${regexPattern}${patternObj.end ? "$" : "(\\/.*)?$"}`)

  if (regex.test(pathname)) {
    // Extract params
    const params: Params<ParamKey> = {} as Params<ParamKey>

    // Extract param names from pattern
    const paramNames = (patternObj.path.match(/:[^/]+/g) || []).map((param) => param.substring(1)) as ParamKey[]

    // Extract param values from pathname
    const pathSegments = pathname.split("/").filter(Boolean)
    const patternSegments = patternObj.path.split("/").filter(Boolean)

    patternSegments.forEach((segment, index) => {
      if (segment.startsWith(":")) {
        const paramName = segment.substring(1) as ParamKey
        params[paramName] = pathSegments[index] as string
      }
    })

    return {
      params,
      pathname,
      pattern: patternObj,
    }
  }

  return null
}
*/

/**
 * Root layout component that includes the Navigator and content area
 */
export default function RootLayout() {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const isNavigating = navigation.state !== "idle";
  return (
    <div className="min-h-screen flex flex-col">
      {/* Global navigation loading indicator */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}
      <Navigator
        navigationTree={navigationTree}
        section="main"
        Link={Link}
        useLocation={useLocation}
        appTitle="Navigator Demo"
        darkMode={darkMode}
        onSearch={() => alert("Search clicked")}
        // emptyNavPlaceholder="Select an item from the menu above"
        renderIcon={renderIcon}
        matchPath={matchPath}
        showMobileBreadcrumbs={false}
      />
      <main className="flex-1 container p-6">
        <Outlet />
      </main>
    </div>
  );
}
