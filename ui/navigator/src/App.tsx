"use client";

import { useEffect, useState } from "react";
import { Navigator } from "./components/navigator";
import icons from "./components/icons.jsx";
import { createIconRenderer } from "./components/navigator/utils.js";
import { navigationTree } from "./nav.js";
import logo from "./assets/react.svg";

/// helpers
const renderIcon = createIconRenderer(icons);
// ========================================
// Mock React Router Functions
// ========================================

// SSR-safe mock Link component to simulate React Router's Link
const Link = ({ to, children, className, ...rest }) => {
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
};

// SSR-safe mock useLocation hook to simulate React Router's useLocation
const useLocation = () => {
  // Start with a safe default value for SSR
  const [pathname, setPathname] = useState("/");

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

  return { pathname };
};

// Mock matchPath function to simulate React Router's matchPath
const matchPath = (pattern, pathname) => {
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
};

const routerAdapter = {
  Link,
  useLocation,
  matchPath,
};

// ========================================
// Demo Application
// ========================================

const NavigatorDemo = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentSection, setCurrentSection] = useState("main");
  const [displayMode, setDisplayMode] = useState("adaptive");
  const [density, setDensity] = useState("default");

  // User actions for the header
  const userActions = {
    label: "My Account",
    iconName: "Users",
    items: [
      {
        id: "signin",
        label: "Sign in",
        iconName: "LogIn",
        onClick: () => alert("Sign in clicked"),
      },
      {
        id: "settings",
        label: "Settings",
        iconName: "Settings",
        onClick: () => alert("Settings clicked"),
      },
      {
        id: "help",
        label: "Help",
        iconName: "HelpCircle",
        onClick: () => alert("Help clicked"),
      },
    ],
  };

  // Get content based on current path
  const { pathname } = useLocation();
  const getContentForPath = (path) => {
    if (path === "/") {
      return (
        <div>
          <h1 className="text-2xl font-bold mb-4">Welcome to Navigator Demo</h1>
          <p className="mb-4">
            This demo showcases our revised Navigation architecture with:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>AppHeader with logo, title, search, and user actions</li>
            <li>
              NavigationSystem with primary, secondary, tertiary navigation rows
            </li>
            <li>Composite Navigator that combines both components</li>
            <li>Section-based app switching</li>
            <li>Responsive design with mobile adaptations</li>
          </ul>
          <p>
            Try navigating through the different sections and options to see how
            the navigation responds.
          </p>
        </div>
      );
    }

    // Extract the last part of the path for a title
    const pathSegments = path.split("/").filter(Boolean);
    const title = pathSegments.length > 0
      ? pathSegments[pathSegments.length - 1]
      : "Home";

    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">
          {title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, " ")}
        </h1>
        <p className="mb-4">
          Current path:{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {path}
          </code>
        </p>
        <p>
          This is the content area for this route. In a real application, this
          would contain the actual page content.
        </p>
      </div>
    );
  };

  return (
    <div
      className={darkMode
        ? "dark bg-gray-900 text-white min-h-screen"
        : "bg-white text-gray-900 min-h-screen"}
    >
      {/* Main Navigator Component (AppHeader + NavigationSystem) */}
      <Navigator
        // NavigationSystem props
        navigationTree={navigationTree}
        section={currentSection}
        onSectionChange={setCurrentSection}
        router={routerAdapter}
        renderIcon={renderIcon}
        // AppHeader props
        appTitle="Navigator Demo"
        logo={<img src={logo} alt="Logo" />}
        search={true}
        onSearch={() => alert("Yay! Search clicked")}
        actions={userActions}
        // Shared props
        darkMode={darkMode}
        theme="corporate"
      />

      {/* Main Content Area */}
      <main
        className={`content-area container mx-auto p-6 ${
          darkMode ? "text-gray-100" : "text-gray-800"
        }`}
      >
        {getContentForPath(pathname)}

        {/* Demo Controls */}
        <div
          className={`mt-8 p-4 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4">Navigation Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Section Selector */}
            <div className="flex items-center justify-between">
              <span>Active Section</span>
              <select
                value={currentSection}
                onChange={(e) => setCurrentSection(e.target.value)}
                className={`rounded px-2 py-1 ${
                  darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
                }`}
              >
                {Object.keys(navigationTree).map((section) => (
                  <option key={section} value={section}>
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Mode */}
            <div className="flex items-center justify-between">
              <span>Display Mode</span>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className={`rounded px-2 py-1 ${
                  darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
                }`}
              >
                <option value="adaptive">Adaptive</option>
                <option value="tabs">Always Tabs</option>
                <option value="breadcrumbs">Always Breadcrumbs</option>
              </select>
            </div>

            {/* Density */}
            <div className="flex items-center justify-between">
              <span>Density</span>
              <select
                value={density}
                onChange={(e) => setDensity(e.target.value)}
                className={`rounded px-2 py-1 ${
                  darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
                }`}
              >
                <option value="default">Default</option>
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`py-4 text-center text-sm ${
          darkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Navigator Component Demo - A versatile navigation system for React
        applications
      </footer>

      {/* CSS for Toggle Switch */}
      <style>
        {`
        /* Toggle switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #3b82f6;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }
      `}
      </style>
    </div>
  );
};

export default NavigatorDemo;
