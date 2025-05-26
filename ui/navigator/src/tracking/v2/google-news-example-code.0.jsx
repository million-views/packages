// Example implementation of Google News-like navigation with improved Navigator API

import React from "react";
import { createRouterAdapter, Navigator } from "@m5nv/ui/navigator";
import { Link, useRouter } from "next/router";
import * as Icons from "@heroicons/react/24/outline";

const GoogleNewsExample = () => {
  // Create router adapter for Next.js
  const router = useRouter();
  const routerAdapter = createRouterAdapter(
    Link,
    () => ({ pathname: router.pathname }),
    (pattern, pathname) =>
      pathname === pattern ? { pathname, params: {} } : null,
  );

  // Example app icons
  const apps = [
    { id: "account", label: "Account", icon: "UserCircle", url: "#" },
    { id: "drive", label: "Drive", icon: "CloudArrowUp", url: "#" },
    { id: "gmail", label: "Gmail", icon: "EnvelopeOpen", url: "#" },
    { id: "youtube", label: "YouTube", icon: "PlayCircle", url: "#" },
    { id: "maps", label: "Maps", icon: "MapPin", url: "#" },
    { id: "search", label: "Search", icon: "MagnifyingGlass", url: "#" },
    { id: "calendar", label: "Calendar", icon: "Calendar", url: "#" },
    { id: "photos", label: "Photos", icon: "Photo", url: "#" },
  ];

  // Custom icon renderer using HeroIcons
  const renderIcon = (name) => {
    const Icon = Icons[name];
    return Icon ? <Icon className="w-5 h-5" /> : <span>{name}</span>;
  };

  return (
    <Navigator
      // Router integration
      router={routerAdapter}
      // Brand elements
      logo={<span className="text-blue-500 font-semibold">Google</span>}
      appTitle="News"
      // Navigation structure - simplified from previous API
      navigation={[
        {
          id: "main",
          items: [
            { id: "home", label: "Home", path: "/" },
            { id: "foryou", label: "For you", path: "/foryou" },
            { id: "following", label: "Following", path: "/following" },
            { id: "showcase", label: "News Showcase", path: "/showcase" },
          ],
        },
        {
          id: "categories",
          items: [
            { id: "us", label: "U.S.", path: "/section/us" },
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
          ],
        },
      ]}
      // Responsive configuration
      responsive={{
        mobile: {
          maxWidth: 767,
          primaryNav: "drawer",
          secondaryNav: "tabs",
          searchDisplay: "collapsed",
        },
        tablet: {
          maxWidth: 1023,
          primaryNav: "tabs",
          secondaryNav: "tabs",
          searchDisplay: "icon",
        },
        desktop: {
          primaryNav: "tabs",
          secondaryNav: "tabs",
          searchDisplay: "expanded",
        },
      }}
      // Active state styling
      activeState={{
        primary: { type: "underline", color: "blue" },
        secondary: { type: "pill", color: "blue-light" },
        drawer: { type: "background", color: "blue-light" },
      }}
      // Search functionality - more integrated with navigation
      search={{
        enabled: true,
        placeholder: "Search for topics, locations & sources",
        expandable: true,
        onSearch: (query) => console.log("Searching for:", query),
      }}
      // App Switcher - enhanced API
      appSwitcher={{
        type: "grid",
        layout: { columns: { mobile: 3, desktop: 3 } },
        position: "right",
        items: apps,
        trigger: {
          icon: "Squares2X2",
          label: "Apps",
        },
      }}
      // User actions - simplified API
      userActions={{
        icon: "UserCircle",
        items: [
          { id: "profile", label: "Profile", icon: "User", onClick: () => {} },
          { id: "settings", label: "Settings", icon: "Cog", onClick: () => {} },
          {
            id: "logout",
            label: "Logout",
            icon: "ArrowRightOnRectangle",
            onClick: () => {},
          },
        ],
      }}
      // Theme - simplified with preset
      theme="google-news"
      colorMode="dark"
      // Icons - simplified configuration
      icons={{
        renderer: renderIcon,
        showLabels: {
          mobile: false,
          desktop: true,
        },
      }}
    />
  );
};

export default GoogleNewsExample;
