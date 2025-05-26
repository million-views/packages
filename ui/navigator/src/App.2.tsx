"use client";

import { useState } from "react";
import DashboardExample from "./examples/DashboardExample.jsx";
import DocumentationExample from "./examples/DocumentationExample.jsx";
import EcommerceExample from "./examples/EcommerceExample.jsx";
import GoogleNewsExample from "./examples/GoogleNewsExample.jsx";

// Example definitions
const examples = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Admin dashboard with sidebar navigation",
    component: DashboardExample,
    color: "bg-indigo-500",
  },
  {
    id: "docs",
    title: "Documentation",
    description: "Documentation site with nested navigation",
    component: DocumentationExample,
    color: "bg-blue-500",
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    description: "Store with mega menu navigation",
    component: EcommerceExample,
    color: "bg-green-500",
  },
  {
    id: "news",
    title: "Google News",
    description: "News site with tabs navigation",
    component: GoogleNewsExample,
    color: "bg-red-500",
  },
];

// Navigation tree variants
const navigationTrees = {
  // Dashboard navigation trees
  dashboard: {
    simple: {
      main: [
        {
          id: "dashboard",
          label: "Dashboard",
          path: "/dashboard",
          iconName: "LayoutDashboard",
        },
        {
          id: "analytics",
          label: "Analytics",
          path: "/analytics",
          iconName: "BarChart",
        },
        {
          id: "settings",
          label: "Settings",
          path: "/settings",
          iconName: "Settings",
        },
      ],
    },
    complex: {
      main: [
        {
          id: "dashboard",
          label: "Dashboard",
          path: "/dashboard",
          iconName: "LayoutDashboard",
        },
        {
          id: "analytics",
          label: "Analytics",
          path: "/analytics",
          iconName: "BarChart",
          children: [
            {
              id: "overview",
              label: "Overview",
              path: "/analytics/overview",
              iconName: "PieChart",
            },
            {
              id: "reports",
              label: "Reports",
              path: "/analytics/reports",
              iconName: "FileText",
            },
          ],
        },
        {
          id: "users",
          label: "User Management",
          path: "/users",
          iconName: "Users",
          children: [
            {
              id: "list",
              label: "User List",
              path: "/users/list",
              iconName: "List",
            },
            {
              id: "roles",
              label: "Roles",
              path: "/users/roles",
              iconName: "Shield",
            },
          ],
        },
        {
          id: "settings",
          label: "Settings",
          path: "/settings",
          iconName: "Settings",
        },
      ],
    },
  },

  // Documentation navigation trees
  docs: {
    simple: {
      main: [
        {
          id: "introduction",
          label: "Introduction",
          path: "/introduction",
          iconName: "Book",
        },
        {
          id: "getting-started",
          label: "Getting Started",
          path: "/getting-started",
          iconName: "Play",
        },
        {
          id: "components",
          label: "Components",
          path: "/components",
          iconName: "Layers",
        },
      ],
    },
    complex: {
      main: [
        {
          id: "introduction",
          label: "Introduction",
          path: "/introduction",
          iconName: "Book",
        },
        {
          id: "getting-started",
          label: "Getting Started",
          path: "/getting-started",
          iconName: "Play",
          children: [
            {
              id: "installation",
              label: "Installation",
              path: "/getting-started/installation",
            },
            {
              id: "basic-usage",
              label: "Basic Usage",
              path: "/getting-started/basic-usage",
            },
            {
              id: "configuration",
              label: "Configuration",
              path: "/getting-started/configuration",
            },
          ],
        },
        {
          id: "components",
          label: "Components",
          path: "/components",
          iconName: "Layers",
          children: [
            {
              id: "navigator",
              label: "Navigator",
              path: "/components/navigator",
            },
            { id: "header", label: "Header", path: "/components/header" },
            { id: "drawer", label: "Drawer", path: "/components/drawer" },
          ],
        },
        {
          id: "hooks",
          label: "Hooks",
          path: "/hooks",
          iconName: "Anchor",
          children: [
            {
              id: "use-navigator",
              label: "useNavigator",
              path: "/hooks/use-navigator",
            },
            { id: "use-theme", label: "useTheme", path: "/hooks/use-theme" },
          ],
        },
      ],
    },
  },

  // E-commerce navigation trees
  ecommerce: {
    simple: {
      store: [
        {
          id: "clothing",
          label: "Clothing",
          path: "/clothing",
          iconName: "ShoppingBag",
          displayType: "megamenu",
        },
        {
          id: "electronics",
          label: "Electronics",
          path: "/electronics",
          iconName: "Smartphone",
          displayType: "megamenu",
        },
        {
          id: "home",
          label: "Home & Garden",
          path: "/home",
          iconName: "Home",
          displayType: "megamenu",
        },
      ],
    },
    complex: {
      store: [
        {
          id: "clothing",
          label: "Clothing",
          path: "/clothing",
          iconName: "ShoppingBag",
          displayType: "megamenu",
          children: [
            {
              id: "mens",
              label: "Men's",
              path: "/clothing/mens",
              parent: "clothing",
              group: "categories",
            },
            {
              id: "womens",
              label: "Women's",
              path: "/clothing/womens",
              parent: "clothing",
              group: "categories",
            },
            {
              id: "kids",
              label: "Kids",
              path: "/clothing/kids",
              parent: "clothing",
              group: "categories",
            },
            {
              id: "tshirt",
              label: "Summer T-Shirt",
              path: "/clothing/tshirt",
              parent: "clothing",
              group: "featured",
            },
            {
              id: "jeans",
              label: "Slim Fit Jeans",
              path: "/clothing/jeans",
              parent: "clothing",
              group: "featured",
            },
          ],
        },
        {
          id: "electronics",
          label: "Electronics",
          path: "/electronics",
          iconName: "Smartphone",
          displayType: "megamenu",
          children: [
            {
              id: "phones",
              label: "Phones",
              path: "/electronics/phones",
              parent: "electronics",
              group: "categories",
            },
            {
              id: "laptops",
              label: "Laptops",
              path: "/electronics/laptops",
              parent: "electronics",
              group: "categories",
            },
            {
              id: "audio",
              label: "Audio",
              path: "/electronics/audio",
              parent: "electronics",
              group: "categories",
            },
            {
              id: "headphones",
              label: "Wireless Earbuds",
              path: "/electronics/headphones",
              parent: "electronics",
              group: "featured",
            },
            {
              id: "watch",
              label: "Smart Watch",
              path: "/electronics/watch",
              parent: "electronics",
              group: "featured",
            },
          ],
        },
        {
          id: "home",
          label: "Home & Garden",
          path: "/home",
          iconName: "Home",
          displayType: "megamenu",
        },
        { id: "beauty", label: "Beauty", path: "/beauty", iconName: "Heart" },
        {
          id: "sports",
          label: "Sports",
          path: "/sports",
          iconName: "Activity",
        },
      ],
    },
  },

  // News navigation trees
  news: {
    simple: {
      main: [
        { id: "home", label: "Home", path: "/", iconName: "Home", end: true },
        { id: "foryou", label: "For you", path: "/foryou", iconName: "Star" },
        {
          id: "following",
          label: "Following",
          path: "/following",
          iconName: "Bell",
        },
      ],
      categories: [
        { id: "us", label: "U.S.", path: "/section/us", iconName: "Flag" },
        {
          id: "world",
          label: "World",
          path: "/section/world",
          iconName: "Globe",
        },
        {
          id: "local",
          label: "Local",
          path: "/section/local",
          iconName: "MapPin",
        },
      ],
    },
    complex: {
      main: [
        { id: "home", label: "Home", path: "/", iconName: "Home", end: true },
        { id: "foryou", label: "For you", path: "/foryou", iconName: "Star" },
        {
          id: "following",
          label: "Following",
          path: "/following",
          iconName: "Bell",
        },
        {
          id: "showcase",
          label: "News Showcase",
          path: "/showcase",
          iconName: "Layout",
        },
        {
          id: "saved",
          label: "Saved searches",
          path: "/saved",
          iconName: "Bookmark",
        },
      ],
      categories: [
        {
          id: "us",
          label: "U.S.",
          path: "/section/us",
          iconName: "Flag",
          contextActions: [
            { id: "star", label: "Save", iconName: "Star" },
            { id: "share", label: "Share", iconName: "Share" },
          ],
        },
        {
          id: "world",
          label: "World",
          path: "/section/world",
          iconName: "Globe",
        },
        {
          id: "local",
          label: "Local",
          path: "/section/local",
          iconName: "MapPin",
        },
        {
          id: "business",
          label: "Business",
          path: "/section/business",
          iconName: "Briefcase",
        },
        {
          id: "technology",
          label: "Technology",
          path: "/section/technology",
          iconName: "Cpu",
        },
        {
          id: "entertainment",
          label: "Entertainment",
          path: "/section/entertainment",
          iconName: "Film",
        },
        {
          id: "sports",
          label: "Sports",
          path: "/section/sports",
          iconName: "Activity",
        },
        {
          id: "science",
          label: "Science",
          path: "/section/science",
          iconName: "Flask",
        },
        {
          id: "health",
          label: "Health",
          path: "/section/health",
          iconName: "Health",
        },
      ],
    },
  },
};

// Demo card grid component
function ExampleCards({ examples, onSelect, darkMode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {examples.map((example) => (
        <div
          key={example.id}
          className={`cursor-pointer rounded-lg shadow-md overflow-hidden transform transition hover:scale-105 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
          onClick={() => onSelect(example.id)}
        >
          <div className={`h-2 ${example.color}`}></div>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">{example.title}</h2>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {example.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Settings panel
function SettingsPanel(
  { darkMode, setDarkMode, treeSettings, setTreeSettings },
) {
  return (
    <div
      className={`rounded-lg p-6 mt-6 ${
        darkMode ? "bg-gray-800" : "bg-gray-100"
      }`}
    >
      <h2 className="text-lg font-semibold mb-4">Demo Settings</h2>

      <div className="grid grid-cols-1 gap-4">
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

        {/* Navigation Tree Selectors */}
        <div className="mt-4">
          <h3 className="text-md font-medium mb-3">Select Navigation Tree:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {examples.map((example) => (
              <div
                key={example.id}
                className="flex items-center justify-between"
              >
                <span className="font-medium">{example.title}:</span>
                <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
                  <button
                    className={`px-3 py-1 text-sm ${
                      treeSettings[example.id] === "simple"
                        ? "bg-blue-500 text-white"
                        : darkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                    }`}
                    onClick={() =>
                      setTreeSettings({
                        ...treeSettings,
                        [example.id]: "simple",
                      })}
                  >
                    Simple
                  </button>
                  <button
                    className={`px-3 py-1 text-sm ${
                      treeSettings[example.id] === "complex"
                        ? "bg-blue-500 text-white"
                        : darkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                    }`}
                    onClick={() =>
                      setTreeSettings({
                        ...treeSettings,
                        [example.id]: "complex",
                      })}
                  >
                    Complex
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Back button
function BackButton({ onClick }) {
  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={onClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
      >
        <span>←</span> Back to Examples
      </button>
    </div>
  );
}

// Header
function Header({ title, subtitle }) {
  return (
    <header className="py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-lg mb-4">{subtitle}</p>}
    </header>
  );
}

// Footer
function Footer({ darkMode }) {
  return (
    <footer
      className={`py-4 text-center text-sm mt-8 ${
        darkMode ? "text-gray-400" : "text-gray-600"
      }`}
    >
      Navigator Component Demo - A versatile navigation system for React
      applications
    </footer>
  );
}

// Main NavigatorDemo component
const NavigatorDemo = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);

  // Initialize tree settings for all examples
  const [treeSettings, setTreeSettings] = useState({
    dashboard: "simple",
    docs: "simple",
    ecommerce: "simple",
    news: "simple",
  });

  // Get the active Navigator component
  const activeExample = selectedExample
    ? examples.find((ex) => ex.id === selectedExample)
    : null;

  const ActiveComponent = activeExample?.component;

  // Get the appropriate navigation tree based on the selected example and type
  const activeNavTree = selectedExample
    ? navigationTrees[selectedExample][treeSettings[selectedExample]]
    : null;

  return (
    <div
      className={darkMode
        ? "dark bg-gray-900 text-white min-h-screen"
        : "bg-white text-gray-900 min-h-screen"}
    >
      <div className="container mx-auto">
        {selectedExample
          ? (
            <>
              {/* Show the selected navigator example with proper navigation tree */}
              {ActiveComponent && (
                <ActiveComponent
                  navigationTree={activeNavTree}
                  section={Object.keys(activeNavTree)[0]} // Use first section as active
                  secondarySection={Object.keys(activeNavTree)[1]} // Use second section if it exists
                  darkMode={darkMode}
                />
              )}

              {/* Back button */}
              <BackButton onClick={() => setSelectedExample(null)} />
            </>
          )
          : (
            <>
              {/* Selection screen */}
              <Header
                title="Navigator Component Demo"
                subtitle="Select a navigation pattern to explore"
              />

              <ExampleCards
                examples={examples}
                onSelect={setSelectedExample}
                darkMode={darkMode}
              />

              <SettingsPanel
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                treeSettings={treeSettings}
                setTreeSettings={setTreeSettings}
              />
            </>
          )}
      </div>

      <Footer darkMode={darkMode} />

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
