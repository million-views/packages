import { useMemo, useState } from "preact/hooks";
import { reify } from "@m5nv/deepstate";

const UIComponentExplorerCombined = () => {

  const [{state: explorer}] = useState(() => 
    reify(
      { view_mode: "explorer",
        search_term: "",
        selected_category: "all",
        selected_framework: "all",
        selected_component: null
      }
    ));

  const [{state: comparison}] = useState(() =>
    reify(
      { filter: "all",
        show_equivalent_components: true
      }
    ));

  // Simple version of the data - you'll replace this with file loading
  const componentData = useMemo(() => {
    return {
      vendors: [
        {
          name: "Geist (Vercel)",
          components: [
            {
              category: "Form",
              name: "Button",
              description:
                "Triggers an action or event, such as submitting a form or opening a dialog",
              alsoKnownAs: ["Push button", "CTA"],
            },
            {
              category: "Data Display",
              name: "Avatar",
              description:
                "Represents a user or entity with an image, initials, or icon",
              alsoKnownAs: ["User avatar", "Profile image"],
            },
          ],
        },
        {
          name: "Radix Primitives",
          components: [
            {
              category: "Form",
              name: "Button",
              description:
                "A clickable element that triggers an action or event",
              alsoKnownAs: ["Push button", "CTA"],
            },
            {
              category: "Layout",
              name: "Aspect Ratio",
              description:
                "Maintains a consistent width-to-height ratio for its child content (e.g., 16:9)",
              alsoKnownAs: ["Ratio box"],
            },
          ],
        },
      ],
    };
  }, []);

  // Get all categories for filtering
  const categories = useMemo(() => {
    if (!componentData.vendors) return ["all"];

    const allCategories = new Set();
    componentData.vendors.forEach((vendor) => {
      vendor.components.forEach((component) => {
        if (component.category) {
          allCategories.add(component.category);
        }
      });
    });
    return ["all", ...Array.from(allCategories).sort()];
  }, [componentData]);

  // Filter components based on search and filters
  const filteredComponents = useMemo(() => {
    if (!componentData.vendors) return [];

    let results = [];

    componentData.vendors.forEach((vendor) => {
      if (explorer.selected_framework !== "all" && vendor.name !== explorer.selected_framework) {
        return;
      }

      vendor.components.forEach((component) => {
        if (
          explorer.selected_category !== "all" && component.category !== explorer.selected_category
        ) return;

        // Search through name, description, and also_known_as
        if (explorer.search_term) {
          const searchLower = explorer.search_term.toLowerCase();
          const nameMatch = component.name.toLowerCase().includes(searchLower);
          const descMatch = component.description?.toLowerCase().includes(
            searchLower,
          );
          const akaMatch = component.alsoKnownAs?.some((aka) =>
            aka.toLowerCase().includes(searchLower)
          );

          if (!nameMatch && !descMatch && !akaMatch) return;
        }

        results.push({
          ...component,
          vendor: vendor.name,
        });
      });
    });

    // Sort by name
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [componentData, explorer.selected_category, explorer.selected_framework, explorer.search_term]);

  // Component equivalence groups for comparison view
  const componentEquivalenceGroups = {
    "Dialog/Modal": ["dialog", "modal", "alertdialog"],
    "Button/Action": ["button", "action"],
    "Toggle/Switch": ["toggle", "switch"],
  };

  // Component comparison data
  const comparisonData = useMemo(() => {
    if (!componentData.vendors) return {};

    // Create a normalized list of all components
    const frameworkData = {};
    componentData.vendors.forEach((vendor) => {
      frameworkData[vendor.name] = vendor.components.map((comp) => comp.name);
    });

    const normalizedFrameworkData = {};
    Object.keys(frameworkData).forEach((framework) => {
      normalizedFrameworkData[framework] = frameworkData[framework].map(
        (component) => component.toLowerCase().replace(/\s+/g, ""),
      );
    });

    const displayNameMap = {};
    Object.keys(frameworkData).forEach((framework) => {
      frameworkData[framework].forEach((component) => {
        const normalized = component.toLowerCase().replace(/\s+/g, "");
        displayNameMap[normalized] = component;
      });
    });

    const allComponents = [
      ...new Set(
        Object.values(frameworkData).flat().map((component) =>
          component.toLowerCase().replace(/\s+/g, "")
        ),
      ),
    ].sort();

    // Check if a component belongs to an equivalence group
    const getEquivalenceGroup = (componentName) => {
      const normalized = componentName.toLowerCase().replace(/\s+/g, "");
      for (
        const [group, components] of Object.entries(componentEquivalenceGroups)
      ) {
        if (components.some((c) => normalized.includes(c))) {
          return group;
        }
      }
      return null;
    };

    // Create a component framework map
    const componentFrameworkMap = {};
    allComponents.forEach((component) => {
      const group = getEquivalenceGroup(component);

      componentFrameworkMap[component] = Object.keys(normalizedFrameworkData)
        .filter((framework) => {
          // Direct match
          if (normalizedFrameworkData[framework].includes(component)) {
            return true;
          }

          // Group match (if this component is part of an equivalence group)
          if (group && comparison.show_equivalent_components) {
            const groupComponents = componentEquivalenceGroups[group];
            return normalizedFrameworkData[framework].some((frameworkComp) =>
              groupComponents.some((groupComp) =>
                frameworkComp.includes(groupComp)
              )
            );
          }

          return false;
        });
    });

    // Filter components for comparison view
    let filteredComponents = [...allComponents];

    if (comparison.filter === "common") {
      filteredComponents = filteredComponents.filter((component) =>
        Object.keys(normalizedFrameworkData).every((framework) =>
          componentFrameworkMap[component].includes(framework)
        )
      );
    } else if (comparison_filter === "unique") {
      filteredComponents = filteredComponents.filter((component) => {
        return componentFrameworkMap[component].length === 1;
      });
    }

    // Stats for comparison
    const stats = {
      total: allComponents.length,
      common: allComponents.filter((component) =>
        Object.keys(normalizedFrameworkData).every((framework) =>
          componentFrameworkMap[component].includes(framework)
        )
      ).length,
      unique: allComponents.filter((component) =>
        componentFrameworkMap[component].length === 1
      ).length,
    };

    return {
      allComponents,
      displayNameMap,
      componentFrameworkMap,
      getEquivalenceGroup,
      filteredComponents,
      stats,
    };
  }, [componentData, comparison.filter, comparison.show_equivalent_components]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">UI Component Explorer</h1>

      {/* View Toggle */}
      <div className="flex mb-6 border-b pb-4">
        <button
          className={`px-6 py-2 font-medium rounded-t-lg ${
            explorer.view_mode === "explorer" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => explorer.view_mode = "explorer"}
        >
          Component Explorer
        </button>
        <button
          className={`px-6 py-2 font-medium rounded-t-lg ${
            explorer.view_mode === "comparison" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => explorer.view_mode = "comparison"}
        >
          Framework Comparison
        </button>
      </div>

      {/* Component Explorer View */}
      {explorer.view_mode === "explorer" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Panel - Filters */}
          <div className="border rounded-lg p-4">
            <h2 className="font-bold text-lg mb-4">Filters</h2>

            {/* Search Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Search Components
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Search name, description, aliases..."
                value={explorer.search_term}
                onChange={(e) => explorer.search_term = e.target.value}
              />
              <p className="mt-1 text-xs text-gray-500">
                Searches through names, descriptions, and alternate names
              </p>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-1 text-sm rounded-full ${
                      explorer.selected_category === category
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                    onClick={() => explorer.selected_category = category}
                  >
                    {category === "all" ? "All" : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Framework Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Filter by Framework
              </label>
              <select
                className="w-full p-2 border rounded"
                value={explorer.selected_framework}
                onChange={(e) => explorer.selected_framework = e.target.value}
              >
                <option value="all">All Frameworks</option>
                {componentData.vendors.map((vendor) => (
                  <option key={vendor.name} value={vendor.name}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <div className="p-3 bg-blue-50 rounded-lg mt-4">
              <h3 className="font-medium text-blue-800">Components Found</h3>
              <p className="text-2xl font-bold">{filteredComponents.length}</p>
            </div>
          </div>

          {/* Middle Panel - Component List */}
          <div className="border rounded-lg p-4">
            <h2 className="font-bold text-lg mb-4">Components</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredComponents.map((component, idx) => (
                <div
                  key={`${component.vendor}-${component.name}-${idx}`}
                  className={`p-3 border rounded hover:bg-gray-50 cursor-pointer ${
                    explorer.selected_component === component
                      ? "bg-blue-50 border-blue-300"
                      : ""
                  }`}
                  onClick={() => explorer.selected_component(component)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{component.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {component.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{component.vendor}</p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {component.description}
                  </p>
                </div>
              ))}
              {filteredComponents.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No components match your criteria
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Component Details */}
          <div className="border rounded-lg p-4">
            <h2 className="font-bold text-lg mb-4">Component Details</h2>

            {explorer.selected_component
              ? (
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">
                        {explorer.selected_component.name}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {explorer.selected_component.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Framework: {explorer.selected_component.vendor}
                    </p>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p>{explorer.selected_component.description}</p>
                  </div>

                  {explorer.selected_component.alsoKnownAs &&
                    explorer.selected_component.alsoKnownAs.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Also Known As</h4>
                      <div className="flex flex-wrap gap-2">
                        {explorer.selected_component.alsoKnownAs.map((aka) => (
                          <span
                            key={aka}
                            className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm"
                          >
                            {aka}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Similar implementations in other frameworks would go here */}
                  <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    This component explorer will show implementation details
                    across frameworks when loaded with your complete dataset.
                  </div>
                </div>
              )
              : (
                <div className="p-6 text-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                  <p>Select a component to view its details</p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Framework Comparison View */}
      {explorer.view_mode === "comparison" && (
        <div>
          {/* Stats Dashboard */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-2">Total Components</h2>
              <p className="text-3xl font-bold">
                {comparisonData.stats?.total || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-2">Common to All</h2>
              <p className="text-3xl font-bold">
                {comparisonData.stats?.common || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-2">
                Unique to One Framework
              </h2>
              <p className="text-3xl font-bold">
                {comparisonData.stats?.unique || 0}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-2">Equivalence Groups</h2>
              <p className="text-3xl font-bold">
                {Object.keys(componentEquivalenceGroups).length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div>
              <button
                className={`px-3 py-1 rounded ${
                  comparison.filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => comparison.filter = "all"}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded ml-2 ${
                  comparison.filter === "common"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => comparison.filter ="common"}
              >
                Common
              </button>
              <button
                className={`px-3 py-1 rounded ml-2 ${
                  comparison.filter === "unique"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => comparison.filter ="unique"}
              >
                Unique
              </button>
            </div>

            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={comparison.show_equivalent_components}
                  onChange={() =>
                    comparison.show_equivalent_components = !comparison.show_equivalent_components}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                </div>
                <span className="ms-3 text-sm font-medium">
                  Group equivalent components
                </span>
              </label>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="border rounded">
            <table className="w-full table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border text-left w-60">Component</th>
                  {componentData.vendors.map((vendor) => (
                    <th key={vendor.name} className="p-2 border">
                      {vendor.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.filteredComponents &&
                    comparisonData.filteredComponents.length > 0
                  ? (
                    comparisonData.filteredComponents.map((component) => {
                      const equivalentGroup = comparisonData
                        .getEquivalenceGroup(component);

                      // Skip some group members when grouped
                      if (comparison.show_equivalent_components && equivalentGroup) {
                        const components =
                          componentEquivalenceGroups[equivalentGroup];
                        const matchingComponents = comparisonData
                          .filteredComponents.filter((c) =>
                            components.some((groupComp) =>
                              c.includes(groupComp)
                            )
                          );
                        if (matchingComponents[0] !== component) return null;
                      }

                      return (
                        <tr
                          key={component}
                          className={`hover:bg-gray-50 ${
                            equivalentGroup && comparison.show_equivalent_components
                              ? "bg-yellow-50"
                              : ""
                          }`}
                        >
                          <td className="p-2 border font-medium">
                            {comparisonData.displayNameMap[component]}
                            {equivalentGroup && comparison.show_equivalent_components && (
                              <span className="text-xs text-gray-500 block">
                                ({equivalentGroup} group)
                              </span>
                            )}
                          </td>
                          {componentData.vendors.map((vendor) => (
                            <td
                              key={vendor.name}
                              className="p-2 border text-center"
                            >
                              {comparisonData.componentFrameworkMap[component]
                                  .includes(vendor.name)
                                ? (
                                  <span className="text-green-500 font-bold">
                                    ✓
                                  </span>
                                )
                                : <span className="text-gray-300">-</span>}
                            </td>
                          ))}
                        </tr>
                      );
                    }).filter(Boolean)
                  )
                  : (
                    <tr>
                      <td
                        colSpan={componentData.vendors.length + 1}
                        className="p-4 text-center text-gray-500"
                      >
                        No components match the current filters
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          {/* Equivalence Groups */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">
              Component Equivalence Groups
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(componentEquivalenceGroups).map((
                [group, components],
              ) => (
                <div key={group} className="p-4 border rounded bg-yellow-50">
                  <h3 className="font-bold mb-2">{group}</h3>
                  <div className="flex flex-wrap gap-2">
                    {components.map((comp) => (
                      <span
                        key={comp}
                        className="px-2 py-1 bg-yellow-100 rounded text-sm"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UIComponentExplorerCombined;
