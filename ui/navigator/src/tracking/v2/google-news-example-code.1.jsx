// GoogleNewsExample.tsx
// Implementation of Google News navigation using the new Navigator API

import React from "react";
import { Navigator } from "@m5nv/ui/navigator";
import { createRouterAdapter } from "@m5nv/ui/navigator/utils";
import { Link, matchPath, useLocation } from "react-router-dom";
import { HelpCircle, Search, Settings } from "lucide-react";

// Google logo component
const GoogleLogo = () => (
  <div className="google-logo">
    <span className="logo-g">G</span>
    <span className="logo-o1">o</span>
    <span className="logo-o2">o</span>
    <span className="logo-g2">g</span>
    <span className="logo-l">l</span>
    <span className="logo-e">e</span>
  </div>
);

// Create custom sections header components if needed
const USSectionHeader = () => (
  <div className="section-header us-section">
    <div className="section-image">
      <img src="/us-statue-liberty.jpg" alt="U.S." className="section-icon" />
    </div>
    <h2 className="section-title">U.S.</h2>
  </div>
);

const GoogleNewsExample = () => {
  // Create router adapter for React Router
  const routerAdapter = createRouterAdapter({
    Link,
    useLocation,
    matchPath,
  });

  // Pre-defined icon components
  const icons = {
    Search: () => <Search size={20} />,
    Help: () => <HelpCircle size={20} />,
    Settings: () => <Settings size={20} />,
  };

  // Custom icon renderer
  const renderIcon = (name) => {
    return icons[name] ? icons[name]() : <span>{name}</span>;
  };

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
            { id: "home", label: "Home", path: "/" },
            { id: "foryou", label: "For you", path: "/foryou" },
            { id: "following", label: "Following", path: "/following" },
            { id: "showcase", label: "News Showcase", path: "/showcase" },
          ],
        },

        // Categories with separator
        {
          id: "categories",
          separator: true, // Add visual separator
          items: [
            {
              id: "us",
              label: "U.S.",
              path: "/section/us",
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
            { id: "world", label: "World", path: "/section/world" },
            { id: "local", label: "Local", path: "/section/local" },
            { id: "business", label: "Business", path: "/section/business" },
            {
              id: "technology",
              label: "Technology",
              path: "/section/technology",
            },
            {
              id: "entertainment",
              label: "Entertainment",
              path: "/section/entertainment",
            },
            { id: "sports", label: "Sports", path: "/section/sports" },
            { id: "science", label: "Science", path: "/section/science" },
          ],
        },
      ]}
      // Global actions
      actions={[
        {
          id: "search",
          icon: "Search",
          label: "Search",
          type: "icon",
          position: "right",
          onClick: () => console.log("Search clicked"),
        },
        {
          id: "help",
          icon: "Help",
          label: "Help",
          type: "icon",
          position: "right",
          onClick: () => console.log("Help clicked"),
        },
        {
          id: "settings",
          icon: "Settings",
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
        tablet: {
          breakpoint: 1024,
          primaryNav: "tabs",
          categoryNav: "tabs",
        },
        desktop: {
          primaryNav: "tabs",
          categoryNav: "tabs",
        },
      }}
      // Router integration
      router={routerAdapter}
      // Use Google News theme
      theme="google-news"
      // Override specific theme tokens if needed
      themeOverrides={{
        colors: {
          primary: "#4285F4",
          buttonPrimary: "#1a73e8",
        },
      }}
      // Component overrides for custom rendering
      components={{
        // Custom section header for U.S. section
        SectionHeader: ({ section }) => {
          if (section?.id === "us") {
            return <USSectionHeader />;
          }
          return null; // Use default for other sections
        },

        // Custom icon renderer
        Icon: ({ name, ...props }) => renderIcon(name, props),
      }}
    />
  );
};

export default GoogleNewsExample;
