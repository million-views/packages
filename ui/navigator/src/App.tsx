import { useState } from "react";
import Navigator from "./components/navigator";
import { navigationTree } from "./nav.js";
import { Link, matchPath, useLocation } from "./routing";
import { Icon } from "./icons.js";
import "./App.css";

// ========================================
// Demo Application
// ========================================
function getContentForPath(path) {
  if (path === "/") {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Welcome to Navigator Demo</h1>
        <p className="mb-4">
          This demo showcases a flexible, responsive navigation component with
          features like:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>Multi-level navigation (primary, secondary, tertiary)</li>
          <li>Section-based app switcher</li>
          <li>Responsive design with mobile adaptations</li>
          <li>Breadcrumb navigation on smaller screens</li>
          <li>Dark mode support</li>
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
        <code className="px-2 py-1 rounded">
          {path}
        </code>
      </p>
      <p>
        This is the content area for this route. In a real application, this
        would contain the actual page content.
      </p>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentSection, setCurrentSection] = useState("main");
  const [displayMode, setDisplayMode] = useState("adaptive");
  const [density, setDensity] = useState("default");

  // Function to render icons
  const renderIcon = (name) => <Icon name={name} size={16} />;

  // Get content based on current path
  const { pathname } = useLocation();
  return (
    <div
      className={darkMode
        ? "dark bg-gray-900 text-white min-h-screen"
        : "bg-white text-gray-900 min-h-screen"}
    >
      {/* Navigation Component */}
      <Navigator
        navigationTree={navigationTree}
        section={currentSection}
        onSectionChange={setCurrentSection}
        Link={Link}
        useLocation={useLocation}
        matchPath={matchPath}
        renderIcon={renderIcon}
        appTitle="Navigator Demo"
        darkMode={darkMode}
        displayMode={displayMode}
        navigationLevelDefaults={{
          tertiary: {
            alwaysShow: false,
            userToggleable: true,
          },
        }}
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
    </div>
  );
}

export default App;
