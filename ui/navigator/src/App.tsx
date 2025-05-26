"use client";

import { useState } from "react";
import * as Examples from "./next.5/examples/all-in-one.js";
import navigationTrees from "./next.5/examples/nav-trees.js";

// Nav Tree Type Buttons Component
function NavTreeTypeButtons(props) {
  const types = ["simple", "complex"];
  return (
    <>
      {types.map(function (type) {
        return (
          <button
            key={type}
            onClick={function () {
              props.onChange(props.id, type);
            }}
            className={`px-3 py-1 text-sm ${
              props.currentType === type
                ? "bg-blue-500 text-white"
                : props.darkMode
                ? "bg-gray-700"
                : "bg-gray-100"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        );
      })}
    </>
  );
}

// Constants
const EXAMPLES = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Admin dashboard with sidebar navigation",
    component: Examples.DashboardExample,
    colorClass: "bg-indigo-500",
  },
  {
    id: "docs",
    title: "Documentation",
    description: "Documentation site with nested navigation",
    component: Examples.DocsExample,
    colorClass: "bg-blue-500",
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    description: "Store with mega menu navigation",
    component: Examples.EcommerceExample,
    colorClass: "bg-green-500",
  },
  {
    id: "news",
    title: "Google News",
    description: "News site with tabs navigation",
    component: Examples.NewsExample,
    colorClass: "bg-red-500",
  },
];

// Toggle Switch Component
function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none"
      aria-label="Toggle Dark Mode"
    >
      <span
        className={`absolute w-full h-full transition-colors rounded-full ${
          enabled ? "bg-blue-500" : "bg-gray-300"
        }`}
      />
      <span
        className={`transform transition-transform inline-block w-4 h-4 bg-white rounded-full ${
          enabled ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// Card Component
function ExampleCard({ example, darkMode, onSelect }) {
  return (
    <div
      onClick={function () {
        onSelect(example.id);
      }}
      className={`cursor-pointer rounded-lg overflow-hidden shadow-md transform transition hover:scale-105 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className={`${example.colorClass} h-2`} />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">{example.title}</h2>
        <p
          className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          {example.description}
        </p>
      </div>
    </div>
  );
}

// Navigation Tree Selector Component
function NavTreeSelector({ options, settings, updateSetting, darkMode }) {
  return (
    <div className="mt-4">
      <hr className="p-2" />

      <h3 className="text-md font-medium mb-3">Navigation Tree:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map(function (option) {
          return (
            <div key={option.id} className="flex items-center justify-between">
              <span className="font-medium">{option.title}:</span>
              <div className="flex border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
                <NavTreeTypeButtons
                  id={option.id}
                  currentType={settings[option.id]}
                  onChange={updateSetting}
                  darkMode={darkMode}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Settings Panel Component
function SettingsPanel(
  { darkMode, setDarkMode, treeSettings, setTreeSettings },
) {
  function toggleTree(id, type) {
    setTreeSettings(function (prev) {
      return { ...prev, [id]: type };
    });
  }

  return (
    <section
      className={`rounded-lg p-6 mt-6 ${
        darkMode ? "bg-gray-800" : "bg-gray-100"
      }`}
    >
      <h2 className="text-lg font-semibold mb-4">Demo Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <ToggleSwitch
            enabled={darkMode}
            onToggle={() => {
              setDarkMode((prev) => !prev);
            }}
          />
        </div>
        <NavTreeSelector
          options={EXAMPLES}
          settings={treeSettings}
          updateSetting={toggleTree}
          darkMode={darkMode}
        />
      </div>
    </section>
  );
}

// Header and Footer
function Header({ title, subtitle }) {
  return (
    <header className="py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-lg">{subtitle}</p>}
    </header>
  );
}

function Footer({ darkMode }) {
  return (
    <footer
      className={`py-4 text-center text-sm mt-8 ${
        darkMode ? "text-gray-400" : "text-gray-600"
      }`}
    >
      Navigator Component Demo
    </footer>
  );
}

// Back Button Component
function BackButton({ onBack }) {
  return (
    <button
      onClick={onBack}
      className="fixed bottom-4 right-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
    >
      ← Examples
    </button>
  );
}

// Example App View Component
function ExampleAppView({ appId, treeSettings, darkMode, onBack }) {
  const active = EXAMPLES.find(function (ex) {
    return ex.id === appId;
  });
  if (active) {
    const ActiveComponent = active.component;
    const navTree = navigationTrees[active.id][treeSettings[active.id]];
    const section = Object.keys(navTree)[0];
    const secondarySection = Object.keys(navTree)[1];
    console.log(
      "setting",
      treeSettings[active.id],
      "navTree",
      navTree,
      "section",
      section,
      "secondarySection",
      secondarySection,
    );
    if (ActiveComponent && navTree) {
      return (
        <>
          <ActiveComponent
            navTree={navTree}
            section={section}
            secondarySection={secondarySection}
            darkMode={darkMode}
          />
          <BackButton onBack={onBack} />
        </>
      );
    }
  }

  return null;
}

// Examples Home Component
function ExamplesHome(
  { examples, darkMode, onSelect, treeSettings, setDarkMode, setTreeSettings },
) {
  return (
    <>
      <Header title="Navigator Demo" subtitle="Choose a pattern" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {examples.map(function (example) {
          return (
            <ExampleCard
              key={example.id}
              example={example}
              darkMode={darkMode}
              onSelect={onSelect}
            />
          );
        })}
      </div>
      <SettingsPanel
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        treeSettings={treeSettings}
        setTreeSettings={setTreeSettings}
      />
    </>
  );
}

// Main Demo Component
export default function NavigatorDemo() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [treeSettings, setTreeSettings] = useState(
    Object.fromEntries(EXAMPLES.map(function (item) {
      return [item.id, "simple"];
    })),
  );

  const baseClasses = `min-h-screen ${
    darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
  }`;
  const wrapperClasses = `container mx-auto ${baseClasses}`;

  if (selectedId) {
    return (
      <div className={wrapperClasses}>
        <ExampleAppView
          appId={selectedId}
          treeSettings={treeSettings}
          darkMode={darkMode}
          onBack={() => setSelectedId(null)}
        />
        <Footer darkMode={darkMode} />
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <ExamplesHome
        examples={EXAMPLES}
        darkMode={darkMode}
        onSelect={(id) => setSelectedId(id)}
        treeSettings={treeSettings}
        setDarkMode={setDarkMode}
        setTreeSettings={setTreeSettings}
      />
      <Footer darkMode={darkMode} />
    </div>
  );
}
