// file: next/examples/DocumentationExample.jsx
// Example of a documentation site using the composition-based Navigator API

import React, { useState } from "react";
import {
  Actions,
  Brand,
  Content,
  createIconRenderer,
  Drawer,
  Header,
  Navigator,
} from "../next";
import { Icons } from "../next/icons";

// Create the icon renderer with our icons registry
const renderIcon = createIconRenderer(Icons);

// Direct router implementation
const router = {
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ pathname: "/api/components/navigator" }),
  matchPath: (pattern, pathname) =>
    pathname === pattern || pathname.startsWith(pattern + "/")
      ? { pathname }
      : null,
};

// Create a documentation logo component
const DocLogo = () => (
  <div className="doc-logo">
    <span className="doc-logo-icon">D</span>
    <span className="doc-logo-text">DevDocs</span>
  </div>
);

// Documentation theme
const docTheme = {
  colors: {
    primary: "#3B82F6", // Blue for the primary brand color
    surface: "#FFFFFF",
    navSeparator: "#E5E7EB",
    activeTabIndicator: "#3B82F6",
    activeTabBackground: "#EFF6FF", // Light blue background
    text: "#1F2937",
    textMuted: "#6B7280",
    buttonPrimary: "#3B82F6",
    buttonPrimaryText: "#FFFFFF",
    headerBackground: "#FFFFFF",
    sidebarBackground: "#F9FAFB",
    codeBackground: "#F3F4F6",
    linkColor: "#2563EB",
    docsHeaderBg: "#F3F4F6",
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    headerSize: "16px",
    navSize: "14px",
    fontWeightNormal: 400,
    fontWeightBold: 600,
    monospace: "'Fira Code', 'SFMono-Regular', Consolas, monospace",
  },
  spacing: {
    headerHeight: "64px",
    navItemPadding: "8px 16px",
    sectionSpacing: "24px",
    sidebarWidth: "280px",
  },
  borders: {
    navSeparator: "1px solid #E5E7EB",
    radius: "6px",
  },
  transitions: {
    navHover: "all 0.2s ease",
    menuExpand: "all 0.25s ease",
  },
};

// Navigation data
const navigationData = [
  // Main sections
  {
    id: "main",
    label: "Documentation",
    items: [
      {
        id: "introduction",
        label: "Introduction",
        path: "/introduction",
        icon: "Book",
      },
      {
        id: "getting-started",
        label: "Getting Started",
        path: "/getting-started",
        icon: "Play",
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
    ],
  },

  // API Reference
  {
    id: "api",
    label: "API Reference",
    separator: true,
    items: [
      {
        id: "components",
        label: "Components",
        path: "/api/components",
        icon: "Layers",
        children: [
          {
            id: "navigator",
            label: "Navigator",
            path: "/api/components/navigator",
          },
          {
            id: "header",
            label: "Header",
            path: "/api/components/header",
          },
          {
            id: "navigation",
            label: "Navigation",
            path: "/api/components/navigation",
          },
          {
            id: "drawer",
            label: "Drawer",
            path: "/api/components/drawer",
          },
          { id: "brand", label: "Brand", path: "/api/components/brand" },
          {
            id: "actions",
            label: "Actions",
            path: "/api/components/actions",
          },
        ],
      },
      {
        id: "hooks",
        label: "Hooks",
        path: "/api/hooks",
        icon: "Anchor",
        children: [
          {
            id: "use-navigator",
            label: "useNavigator",
            path: "/api/hooks/use-navigator",
          },
          {
            id: "use-theme",
            label: "useTheme",
            path: "/api/hooks/use-theme",
          },
          {
            id: "use-responsive",
            label: "useResponsive",
            path: "/api/hooks/use-responsive",
          },
        ],
      },
      {
        id: "utilities",
        label: "Utilities",
        path: "/api/utilities",
        icon: "Tool",
        children: [
          {
            id: "create-icon-renderer",
            label: "createIconRenderer",
            path: "/api/utilities/create-icon-renderer",
          },
        ],
      },
    ],
  },

  // Examples
  {
    id: "examples",
    label: "Examples",
    separator: true,
    items: [
      {
        id: "basic",
        label: "Basic",
        path: "/examples/basic",
        icon: "Code",
      },
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/examples/dashboard",
        icon: "LayoutDashboard",
      },
      {
        id: "ecommerce",
        label: "E-commerce",
        path: "/examples/ecommerce",
        icon: "ShoppingCart",
      },
      {
        id: "docs",
        label: "Documentation",
        path: "/examples/docs",
        icon: "FileText",
      },
    ],
  },

  // Resources
  {
    id: "resources",
    label: "Resources",
    separator: true,
    items: [
      {
        id: "migration",
        label: "Migration Guide",
        path: "/resources/migration",
        icon: "GitBranch",
      },
      {
        id: "faq",
        label: "FAQ",
        path: "/resources/faq",
        icon: "HelpCircle",
      },
      {
        id: "release-notes",
        label: "Release Notes",
        path: "/resources/release-notes",
        icon: "Tag",
      },
    ],
  },
];

// Actions data
const actionsData = [
  {
    id: "github",
    icon: "Github",
    label: "GitHub",
    type: "icon",
    position: "right",
    onClick: () => console.log("GitHub clicked"),
  },
  {
    id: "theme",
    icon: "Moon",
    label: "Theme",
    type: "icon",
    position: "right",
    onClick: () => console.log("Theme toggle clicked"),
  },
];

// Custom version switcher component
const VersionSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("v2.0");

  const versions = ["v2.0", "v1.9", "v1.8", "v1.7", "v1.6"];

  return (
    <div className="version-switcher">
      <button
        className="version-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentVersion}
        {renderIcon("ChevronDown", 16)}
      </button>

      {isOpen && (
        <div className="version-switcher-menu">
          {versions.map((version) => (
            <button
              key={version}
              className={`version-switcher-item ${
                version === currentVersion ? "version-switcher-item-active" : ""
              }`}
              onClick={() => {
                setCurrentVersion(version);
                setIsOpen(false);
              }}
            >
              {version}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom Search Component
const DocsSearch = () => (
  <div className="docs-search">
    <div className="docs-search-container">
      <input
        type="text"
        placeholder="Search documentation..."
        className="docs-search-input"
      />
      <button className="docs-search-button">
        {renderIcon("Search", 18)}
      </button>
    </div>
  </div>
);

// Table of contents component
const TableOfContents = () => {
  // Mock TOC items
  const tocItems = [
    { id: "introduction", label: "Introduction", level: 1 },
    { id: "getting-started", label: "Getting Started", level: 1 },
    { id: "installation", label: "Installation", level: 2 },
    { id: "basic-usage", label: "Basic Usage", level: 2 },
    { id: "configuration-options", label: "Configuration Options", level: 1 },
    { id: "theming", label: "Theming", level: 2 },
    { id: "responsive-behavior", label: "Responsive Behavior", level: 2 },
    { id: "api-reference", label: "API Reference", level: 1 },
    { id: "components", label: "Components", level: 2 },
    { id: "hooks", label: "Hooks", level: 2 },
    { id: "utilities", label: "Utilities", level: 2 },
    { id: "advanced-usage", label: "Advanced Usage", level: 1 },
    { id: "examples", label: "Examples", level: 2 },
    { id: "troubleshooting", label: "Troubleshooting", level: 1 },
  ];

  return (
    <div className="table-of-contents">
      <h2 className="toc-title">On this page</h2>

      <ul className="toc-list">
        {tocItems.map((item) => (
          <li
            key={item.id}
            className={`toc-item toc-level-${item.level}`}
          >
            <a href={`#${item.id}`} className="toc-link">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Documentation page content
const DocContent = () => (
  <>
    {/* Main content header */}
    <div className="docs-header-banner">
      <div className="docs-breadcrumb">
        <span>API Reference</span>
        <span>{renderIcon("ChevronRight", 16)}</span>
        <span>Components</span>
      </div>

      <h1 className="docs-page-title">Navigator Component</h1>

      <p className="docs-page-description">
        A flexible, accessible navigation component for React applications
      </p>

      <div className="docs-badges">
        <span className="docs-badge docs-badge-blue">Stable</span>
        <span className="docs-badge docs-badge-gray">v2.0</span>
      </div>
    </div>

    {/* Main content */}
    <div className="docs-content-body">
      <div className="docs-section">
        <h2 id="introduction" className="docs-heading-2">
          Introduction
        </h2>

        <p className="docs-paragraph">
          The Navigator component provides an opinionated navigation solution
          for React applications that need to render site/app wide navigational
          UI. It provides a complete navigation system including an application
          header, multi-level navigation, and responsive adaptations.
        </p>
      </div>

      <div className="docs-section">
        <h2 id="getting-started" className="docs-heading-2">
          Getting Started
        </h2>

        <h3 id="installation" className="docs-heading-3">
          Installation
        </h3>

        <div className="docs-code-block">
          <code>npm install @m5nv/ui/navigator</code>
        </div>

        <h3 id="basic-usage" className="docs-heading-3">
          Basic Usage
        </h3>

        <p className="docs-paragraph">
          Here's a simple example of using the Navigator component:
        </p>

        <div className="docs-code-block">
          <pre className="docs-code">
{`import { Navigator, Header, Brand, Drawer } from '@m5nv/ui/navigator';
import { createIconRenderer } from '@m5nv/ui/navigator';

// Create icon renderer
const renderIcon = createIconRenderer({
  Home: (size) => <HomeIcon size={size} />,
  Settings: (size) => <SettingsIcon size={size} />
});

const App = () => {
  return (
    <Navigator
      brand={{ title: "My App" }}
      navigation={[
        {
          id: "main",
          items: [
            { id: "home", label: "Home", path: "/", icon: "Home" },
            { id: "about", label: "About", path: "/about" },
            { id: "contact", label: "Contact", path: "/contact" }
          ]
        }
      ]}
      router={routerAdapter}
      renderIcon={renderIcon}
    >
      <Header>
        <Brand title="My App" />
        <Actions />
      </Header>
      <Drawer mode="persistent" />
      <Content>
        Your content here
      </Content>
    </Navigator>
  );
};`}
          </pre>
        </div>
      </div>

      <div className="docs-section">
        <h2 id="configuration-options" className="docs-heading-2">
          Configuration Options
        </h2>

        <p className="docs-paragraph">
          The Navigator component offers extensive configuration options to
          customize its behavior and appearance.
        </p>

        <h3 id="theming" className="docs-heading-3">
          Theming
        </h3>

        <p className="docs-paragraph">
          You can customize the appearance of the Navigator using themes:
        </p>

        <div className="docs-code-block">
          <pre className="docs-code">
{`<Navigator
  theme="google-news" // Use a preset theme

  // OR provide custom theme overrides
  themeOverrides={{
    colors: {
      primary: "#4285F4",
      surface: "#FFFFFF",
      // More color overrides...
    }
  }}
  // Other props...
/>`}
          </pre>
        </div>
      </div>
    </div>
  </>
);

const DocumentationExample = () => {
  return (
    <Navigator
      brand={{ title: "DevDocs" }}
      navigation={navigationData}
      router={router}
      renderIcon={renderIcon}
      actions={actionsData}
      theme="default"
      themeOverrides={docTheme}
      responsive={{
        mobile: {
          breakpoint: 768,
          primaryNav: "drawer",
          categoryNav: "drawer",
          brand: { truncateTitle: true },
        },
        desktop: {
          primaryNav: "drawer",
          categoryNav: "drawer",
        },
      }}
    >
      {/* React 19 styles */}
      <style>
        {`
        /* Layout */
        .docs-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: calc(100vh - 64px);
        }
        
        .docs-main {
          padding: 48px 24px;
          background-color: #F9FAFB;
        }
        
        .docs-content-wrapper {
          display: grid;
          grid-template-columns: 1fr 250px;
          gap: 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        /* Logo */
        .doc-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          font-size: 20px;
        }
        
        .doc-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background-color: #3B82F6;
          color: white;
          border-radius: 8px;
          font-size: 16px;
        }
        
        .doc-logo-text {
          color: #3B82F6;
        }
        
        /* Header controls */
        .docs-header-controls {
          display: flex;
          align-items: center;
          flex: 1;
          margin-left: 24px;
        }
        
        /* Version switcher */
        .version-switcher {
          position: relative;
        }
        
        .version-switcher-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          background: none;
          font-size: 14px;
          cursor: pointer;
        }
        
        .version-switcher-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          width: 120px;
          background-color: white;
          border-radius: 6px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
          z-index: 10;
        }
        
        .version-switcher-item {
          display: block;
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          border: none;
          background: none;
          font-size: 14px;
          cursor: pointer;
        }
        
        .version-switcher-item:hover {
          background-color: #F9FAFB;
        }
        
        .version-switcher-item-active {
          background-color: #EFF6FF;
        }
        
        /* Search */
        .docs-search {
          flex: 1;
          max-width: 500px;
          margin-left: 24px;
        }
        
        .docs-search-container {
          display: flex;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .docs-search-input {
          flex: 1;
          padding: 8px 12px;
          border: none;
          font-size: 14px;
          outline: none;
        }
        
        .docs-search-button {
          padding: 0 12px;
          background-color: #3B82F6;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Content */
        .docs-header-banner {
          background-color: #F3F4F6;
          margin-bottom: 32px;
          padding: 32px;
          border-radius: 8px;
        }
        
        .docs-breadcrumb {
          font-size: 14px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6B7280;
        }
        
        .docs-page-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        
        .docs-page-description {
          font-size: 16px;
          color: #6B7280;
          margin-bottom: 24px;
        }
        
        .docs-badges {
          display: flex;
          gap: 12px;
        }
        
        .docs-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .docs-badge-blue {
          background-color: #EFF6FF;
          color: #3B82F6;
        }
        
        .docs-badge-gray {
          background-color: #F3F4F6;
          color: #6B7280;
        }
        
        .docs-content-body {
          font-size: 16px;
          line-height: 1.6;
        }
        
        .docs-section {
          margin-bottom: 32px;
        }
        
        .docs-heading-2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
          padding-top: 8px;
        }
        
        .docs-heading-3 {
          font-size: 20px;
          font-weight: 600;
          margin: 24px 0 16px;
        }
        
        .docs-paragraph {
          margin-bottom: 24px;
        }
        
        .docs-code-block {
          background-color: #F3F4F6;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
          font-family: 'Fira Code', monospace;
          font-size: 14px;
          overflow-x: auto;
          line-height: 1.5;
        }
        
        .docs-code {
          margin: 0;
        }
        
        /* Table of contents */
        .table-of-contents {
          position: sticky;
          top: 24px;
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          padding: 16px;
          background-color: white;
          border-radius: 6px;
          border: 1px solid #E5E7EB;
        }
        
        .toc-title {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          color: #6B7280;
          margin-bottom: 16px;
        }
        
        .toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .toc-item {
          margin-bottom: 8px;
        }
        
        .toc-level-1 {
          padding-left: 0;
        }
        
        .toc-level-2 {
          padding-left: 16px;
        }
        
        .toc-link {
          display: block;
          color: #1F2937;
          text-decoration: none;
          font-size: 14px;
          padding: 4px 0;
          transition: color 0.2s ease;
        }
        
        .toc-level-1 .toc-link {
          font-weight: 500;
        }
        
        .toc-level-2 .toc-link {
          font-weight: 400;
          color: #6B7280;
        }
        
        .toc-link:hover {
          color: #3B82F6;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .docs-layout {
            display: block;
          }
          
          .docs-content-wrapper {
            grid-template-columns: 1fr;
          }
          
          .table-of-contents {
            display: none;
          }
        }
      `}
      </style>

      {/* Header with brand, version switcher, and search */}
      <Header>
        <Brand logo={<DocLogo />} title="DevDocs" />
        <div className="docs-header-controls">
          <VersionSwitcher />
          <DocsSearch />
        </div>
        <Actions actions={actionsData} />
      </Header>

      <div className="docs-layout">
        {/* Sidebar */}
        <Drawer mode="persistent" />

        {/* Main content */}
        <div className="docs-main">
          <div className="docs-content-wrapper">
            <div className="docs-main-content">
              <DocContent />
            </div>

            <div className="docs-sidebar-right">
              <TableOfContents />
            </div>
          </div>
        </div>
      </div>
    </Navigator>
  );
};

export default DocumentationExample;
