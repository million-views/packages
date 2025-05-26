// file: next/examples/GoogleNewsExample.tsx
// Example implementation of Google News-like navigation updated with new structure

import { createIconRenderer, Navigator } from "../next";
import { Link, matchPath, useLocation } from "./MockRouter";
import { Icons } from "../next/icons"; // Import our example icon registry

// Simulated router for the example
const router = {
  // Link,
  // useLocation,
  // matchPath,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ pathname: "/section/us" }),
  matchPath: (pattern, pathname) => pathname === pattern ? { pathname } : null,
};

// Create the icon renderer with our icons registry
const renderIcon = createIconRenderer(Icons);

// Example implementation of a custom icon
const CustomIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#4285F4" />
    <path d="M12 6L19 18H5L12 6Z" fill="white" />
  </svg>
);

// Google logo component
const GoogleLogo = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      fontSize: "20px",
      fontWeight: "bold",
      color: "#4285F4",
    }}
  >
    <span style={{ color: "#4285F4" }}>G</span>
    <span style={{ color: "#EA4335" }}>o</span>
    <span style={{ color: "#FBBC05" }}>o</span>
    <span style={{ color: "#4285F4" }}>g</span>
    <span style={{ color: "#34A853" }}>l</span>
    <span style={{ color: "#EA4335" }}>e</span>
  </div>
);

const GoogleNewsExample = () => {
  return (
    <Navigator
      // Brand configuration
      brand={{
        logo: <GoogleLogo />,
        title: "News",
        url: "/",
      }}
      // Navigation structure
      navigation={[
        // Primary navigation
        {
          id: "main",
          items: [
            { id: "home", label: "Home", path: "/", icon: "Home" },
            { id: "foryou", label: "For you", path: "/foryou", icon: "Star" },
            {
              id: "following",
              label: "Following",
              path: "/following",
              icon: <CustomIcon />,
            },
            {
              id: "showcase",
              label: "News Showcase",
              path: "/showcase",
              icon: "Apps",
            },
          ],
        },

        // Categories with separator
        {
          id: "categories",
          separator: true,
          items: [
            {
              id: "us",
              label: "U.S.",
              path: "/section/us",
              icon: "User",
              // Context actions shown when in U.S. section
              contextActions: [
                {
                  id: "star",
                  icon: "Star",
                  label: "Save",
                  onClick: () => console.log("Save U.S. section"),
                },
                {
                  id: "share",
                  icon: "Share",
                  label: "Share",
                  onClick: () => console.log("Share U.S. section"),
                },
              ],
            },
            {
              id: "world",
              label: "World",
              path: "/section/world",
              icon: "Search",
            },
            {
              id: "local",
              label: "Local",
              path: "/section/local",
              icon: "Home",
            },
            {
              id: "business",
              label: "Business",
              path: "/section/business",
              icon: "Settings",
            },
            {
              id: "technology",
              label: "Technology",
              path: "/section/technology",
              icon: <CustomIcon />,
            },
            {
              id: "entertainment",
              label: "Entertainment",
              path: "/section/entertainment",
              icon: "Star",
            },
          ],
        },
      ]}
      // Global actions
      actions={[
        {
          id: "search",
          icon: "SearchIcon",
          label: "Search",
          type: "icon",
          position: "right",
          onClick: () => console.log("Search clicked"),
        },
        {
          id: "help",
          icon: "HelpIcon",
          label: "Help",
          type: "icon",
          position: "right",
          onClick: () => console.log("Help clicked"),
        },
        {
          id: "settings",
          icon: "SettingsIcon",
          label: "Settings",
          type: "icon",
          position: "right",
          onClick: () => console.log("Settings clicked"),
        },
        {
          id: "signin",
          label: "Sign in",
          type: "button",
          variant: "primary",
          position: "right",
          onClick: () => console.log("Sign in clicked"),
        },
      ]}
      // Responsive configuration
      responsive={{
        mobile: {
          breakpoint: 768,
          primaryNav: "drawer",
          categoryNav: "tabs",
          brand: {
            truncateTitle: true, // "Google News" becomes "Google N..."
            useIcon: true, // Show hamburger menu icon
          },
          actions: {
            // Show only these actions on mobile
            visible: ["search", "signin"],
            // Put these in overflow menu
            overflowMenu: ["help", "settings"],
          },
        },
        desktop: {
          primaryNav: "tabs",
          categoryNav: "tabs",
        },
      }}
      // Router integration
      router={router}
      // Use Google News theme
      theme="google-news"
      // Pass the renderIcon function
      renderIcon={renderIcon}
    />
  );
};

export default GoogleNewsExample;
