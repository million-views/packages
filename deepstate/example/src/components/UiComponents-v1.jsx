import { useMemo, useState } from "preact/hooks";

const UIComponentExplorer = () => {
  // State for view mode
  const [viewMode, setViewMode] = useState("explorer"); // 'explorer' or 'comparison'

  // State for explorer view
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [selectedComponent, setSelectedComponent] = useState(null);

  // State for comparison view
  const [comparisonFilter, setComparisonFilter] = useState("all");
  const [showEquivalentComponents, setShowEquivalentComponents] = useState(
    true,
  );

  // Parse the component data
  const componentData = useMemo(() => {
    // This is your structured data - converted from the YAML format
    const data = parseYamlData();
    return data;
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    if (!componentData?.vendors) return ["all"];

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

  // Calculate filteredComponents for Explorer view
  const filteredComponents = useMemo(() => {
    if (!componentData?.vendors) return [];

    let results = [];

    componentData.vendors.forEach((vendor) => {
      if (selectedVendor !== "all" && vendor.name !== selectedVendor) return;

      vendor.components.forEach((component) => {
        if (
          selectedCategory !== "all" && component.category !== selectedCategory
        ) return;

        // Search through name, description, and also_known_as
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
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
    return results.toSorted((a, b) => a.name.localeCompare(b.name));
  }, [componentData, selectedCategory, selectedVendor, searchTerm]);

  // Get detailed component information across all vendors
  const componentDetails = useMemo(() => {
    if (!selectedComponent || !componentData?.vendors) return null;

    const details = {
      name: selectedComponent.name,
      implementations: [],
    };

    // Find this component (or similar ones) across vendors
    componentData.vendors.forEach((vendor) => {
      const matchingComponents = vendor.components.filter((comp) => {
        // Exact name match
        if (comp.name === selectedComponent.name) return true;

        // Check if this component is in the selected component's also_known_as
        if (selectedComponent.alsoKnownAs?.includes(comp.name)) return true;

        // Check if selected component name is in this component's also_known_as
        if (comp.alsoKnownAs?.includes(selectedComponent.name)) return true;

        return false;
      });

      if (matchingComponents.length > 0) {
        matchingComponents.forEach((comp) => {
          details.implementations.push({
            vendor: vendor.name,
            ...comp,
          });
        });
      }
    });

    return details;
  }, [componentData, selectedComponent]);

  // Component equivalence groups for comparison view
  const componentEquivalenceGroups = {
    "Dialog/Modal": ["dialog", "modal", "alertdialog"],
    "Radio": ["radio", "radiogroup"],
    "Table": ["table", "datatable", "tableview"],
    "Menu": ["menu", "menubar", "commandmenu", "contextmenu"],
    "Dropdown/Select": ["dropdown", "dropdownmenu", "select", "picker"],
    "Toast/Notifications": ["toast", "sonner"],
    "Toggle/Switch": ["toggle", "switch"],
    "Sheet/Drawer": ["drawer", "sheet", "tray"],
  };

  // Create a normalized component list for comparison
  const normalizedComponents = useMemo(() => {
    if (!componentData?.vendors) return { allComponents: [] };

    const frameworkData = {};
    componentData.vendors.forEach((vendor) => {
      frameworkData[vendor.name] = vendor.components.map((comp) => comp.name);
    });

    // Normalize component names for comparison
    const normalizedFrameworkData = {};
    Object.keys(frameworkData).forEach((framework) => {
      normalizedFrameworkData[framework] = frameworkData[framework].map(
        (component) => component.toLowerCase().replace(/\s+/g, "")
      );
    });

    // Create display name map
    const displayNameMap = {};
    Object.keys(frameworkData).forEach((framework) => {
      frameworkData[framework].forEach((component) => {
        const normalized = component.toLowerCase().replace(/\s+/g, "");
        displayNameMap[normalized] = component;
      });
    });

    // Get all unique components
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
          if (group && showEquivalentComponents) {
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

    return {
      allComponents,
      displayNameMap,
      componentFrameworkMap,
      getEquivalenceGroup,
      frameworkData,
    };
  }, [componentData, showEquivalentComponents]);

  // Calculate comparison view components
  const comparisonComponents = useMemo(() => {
    if (!normalizedComponents.allComponents) return [];

    let filtered = [...normalizedComponents.allComponents];

    // Filter by common/unique
    if (comparisonFilter === "common") {
      filtered = filtered.filter((component) =>
        Object.keys(normalizedComponents.frameworkData).every((framework) =>
          normalizedComponents.componentFrameworkMap[component].includes(
            framework,
          )
        )
      );
    } else if (comparisonFilter === "unique") {
      filtered = filtered.filter((component) => {
        // With group consideration
        const group = normalizedComponents.getEquivalenceGroup(component);
        if (!group || !showEquivalentComponents) {
          // If not part of a group, just check if it's in one framework
          return normalizedComponents.componentFrameworkMap[component]
            .length === 1;
        } else {
          // For components in a group, we need a special check
          // This component should be in just one framework
          // AND no other components from this group should be in other frameworks
          if (
            normalizedComponents.componentFrameworkMap[component].length !== 1
          ) return false;

          // Get the framework this component is in
          const framework =
            normalizedComponents.componentFrameworkMap[component][0];

          // Check if any other component in the same group exists in other frameworks
          for (const otherComp of normalizedComponents.allComponents) {
            const otherGroup = normalizedComponents.getEquivalenceGroup(
              otherComp,
            );
            if (otherComp !== component && otherGroup === group) {
              // If this other component from the same group exists in a different framework,
              // then the concept isn't unique
              for (
                const fw of normalizedComponents
                  .componentFrameworkMap[otherComp]
              ) {
                if (fw !== framework) return false;
              }
            }
          }

          return true;
        }
      });
    }

    return filtered;
  }, [normalizedComponents, comparisonFilter, showEquivalentComponents]);

  // Stats for comparison view
  const comparisonStats = useMemo(() => {
    if (!normalizedComponents.allComponents) return {};

    return {
      total: normalizedComponents.allComponents.length,
      common: normalizedComponents.allComponents.filter((component) =>
        Object.keys(normalizedComponents.frameworkData).every((framework) =>
          normalizedComponents.componentFrameworkMap[component].includes(
            framework,
          )
        )
      ).length,
      unique: normalizedComponents.allComponents.filter((component) => {
        // With group consideration
        const group = normalizedComponents.getEquivalenceGroup(component);
        if (!group || !showEquivalentComponents) {
          // If not part of a group, just check if it's in one framework
          return normalizedComponents.componentFrameworkMap[component]
            .length === 1;
        } else {
          // Complex logic for unique within groups (same as above)
          if (
            normalizedComponents.componentFrameworkMap[component].length !== 1
          ) {
            return false;
          }
          const framework =
            normalizedComponents.componentFrameworkMap[component][0];
          for (const otherComp of normalizedComponents.allComponents) {
            const otherGroup = normalizedComponents.getEquivalenceGroup(
              otherComp,
            );
            if (otherComp !== component && otherGroup === group) {
              for (
                const fw of normalizedComponents
                  .componentFrameworkMap[otherComp]
              ) {
                if (fw !== framework) return false;
              }
            }
          }
          return true;
        }
      }).length,
    };
  }, [normalizedComponents, showEquivalentComponents]);

  // Helper function to get component tooltip content for comparison view
  const getTooltipContent = (component) => {
    const group = normalizedComponents.getEquivalenceGroup(component);
    let content = normalizedComponents.displayNameMap[component];

    if (group) {
      content += ` (Part of ${group} group)`;
    }

    return content;
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">UI Component Explorer</h1>

      {/* View Toggle */}
      <div className="flex mb-6 border-b pb-4">
        <button
          className={`px-6 py-2 font-medium rounded-t-lg ${
            viewMode === "explorer" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setViewMode("explorer")}
        >
          Component Explorer
        </button>
        <button
          className={`px-6 py-2 font-medium rounded-t-lg ${
            viewMode === "comparison" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setViewMode("comparison")}
        >
          Framework Comparison
        </button>
      </div>

      {/* Component Explorer View */}
      {viewMode === "explorer" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="md:col-span-3">
            <div className="sticky top-4 space-y-6">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search Components
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Search name, description, aliases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-600">
                  Searches component names, descriptions, and aliases
                </p>
              </div>

              {/* Category Selector as Pills */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Filter by Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedCategory === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    All
                  </button>
                  {categories.filter((c) => c !== "all").map((category) => (
                    <button
                      key={category}
                      className={`px-3 py-1 text-sm rounded-full ${
                        selectedCategory === category
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vendor Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Filter by Framework
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                >
                  <option value="all">All Frameworks</option>
                  {componentData.vendors.map((vendor) => (
                    <option key={vendor.name} value={vendor.name}>
                      {vendor.name} ({vendor.components.length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Framework Stats */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Component Count by Framework
                </h3>
                <div className="space-y-2">
                  {componentData.vendors.map((vendor) => {
                    const maxCount = Math.max(
                      ...componentData.vendors.map((v) => v.components.length),
                    );
                    const percentage = (vendor.components.length / maxCount) *
                      100;

                    return (
                      <div key={vendor.name} className="flex items-center">
                        <div className="w-1/2 text-sm truncate">
                          {vendor.name}
                        </div>
                        <div className="w-1/2 pl-2">
                          <div className="bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${percentage}%` }}
                            >
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Component Count */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800">Components Found</h3>
                <p className="text-2xl font-bold">
                  {filteredComponents.length}
                </p>
              </div>
            </div>
          </div>

          {/* Middle Section - Component List */}
          <div className="md:col-span-3">
            <div className="sticky top-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium">Component List</h2>
                <span className="text-sm text-gray-500">
                  {filteredComponents.length} results
                </span>
              </div>
              <div className="border rounded h-[75vh] overflow-y-auto">
                <div className="divide-y">
                  {filteredComponents.map((component, idx) => (
                    <div
                      key={`${component.vendor}-${component.name}-${idx}`}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedComponent &&
                          selectedComponent.name === component.name &&
                          selectedComponent.vendor === component.vendor
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() => setSelectedComponent(component)}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium">{component.name}</h3>
                        <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded">
                          {component.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {component.vendor}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {component.description}
                      </p>
                    </div>
                  ))}
                  {filteredComponents.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      No components match your search criteria
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Component Details */}
          <div className="md:col-span-6">
            <div className="sticky top-4 border rounded p-6 h-[75vh] overflow-y-auto">
              {selectedComponent
                ? (
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold">
                            {selectedComponent.name}
                          </h2>
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                            {selectedComponent.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">
                            {selectedComponent.vendor}
                          </span>
                          {selectedComponent.alsoKnownAs &&
                            selectedComponent.alsoKnownAs.length > 0 && (
                            <span className="text-gray-400 text-sm ml-2">
                              Also: {selectedComponent.alsoKnownAs.join(", ")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-gray-700">
                        {selectedComponent.description}
                      </p>
                    </div>

                    {componentDetails &&
                      componentDetails.implementations.length > 1 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Cross-Framework Implementations
                        </h3>
                        <div className="space-y-4">
                          {componentDetails.implementations
                            .map((impl) => (
                              <div
                                key={impl.vendor}
                                className={`border rounded-lg p-4 hover:shadow-sm ${
                                  impl.vendor === selectedComponent.vendor
                                    ? "border-blue-200 bg-blue-50"
                                    : ""
                                }`}
                              >
                                <div className="flex justify-between">
                                  <h4 className="font-medium">{impl.name}</h4>
                                  <span
                                    className={`text-sm ${
                                      impl.vendor === selectedComponent.vendor
                                        ? "font-medium text-blue-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {impl.vendor}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-700">
                                  {impl.description}
                                </p>
                                {impl.alsoKnownAs &&
                                  impl.alsoKnownAs.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {impl.alsoKnownAs.map((alias) => (
                                      <span
                                        key={alias}
                                        className="inline-block px-2 py-1 text-xs bg-gray-100 rounded"
                                      >
                                        {alias}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
                : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto mb-4"
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
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Matrix View */}
      {viewMode === "comparison" && (
        <div>
          {/* Stats Dashboard */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-2">Total Components</h2>
              <p className="text-3xl font-bold">{comparisonStats.total || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-2">Common to All</h2>
              <p className="text-3xl font-bold">
                {comparisonStats.common || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-2">
                Unique to One Framework
              </h2>
              <p className="text-3xl font-bold">
                {comparisonStats.unique || 0}
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
          <div className="mb-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded ${
                    comparisonFilter === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setComparisonFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    comparisonFilter === "common"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setComparisonFilter("common")}
                >
                  Common
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    comparisonFilter === "unique"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setComparisonFilter("unique")}
                >
                  Unique
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showEquivalentComponents}
                    onChange={() =>
                      setShowEquivalentComponents(!showEquivalentComponents)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                  </div>
                  <span className="ms-3 text-sm font-medium">
                    Group equivalent components
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="border rounded mb-6">
            <table className="w-full table-fixed bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="w-40 p-2 border text-left">Component</th>
                  {componentData.vendors.map((vendor) => (
                    <th key={vendor.name} className="p-2 border">
                      {vendor.name}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full table-fixed bg-white">
                <tbody>
                  {comparisonComponents.length > 0
                    ? (
                      comparisonComponents.map((normalizedComponent) => {
                        const equivalentGroup = normalizedComponents
                          .getEquivalenceGroup(normalizedComponent);
                        const isPartOfGroup = !!equivalentGroup;

                        // Skip group members if grouping is enabled
                        if (showEquivalentComponents && isPartOfGroup) {
                          const groupComponents =
                            componentEquivalenceGroups[equivalentGroup];
                          const componentIndex = groupComponents.findIndex(
                            (gc) => normalizedComponent.includes(gc)
                          );

                          // Only show the first match from each group
                          const matchingComponents = comparisonComponents
                            .filter((comp) => {
                              const compGroup = normalizedComponents
                                .getEquivalenceGroup(comp);
                              return compGroup === equivalentGroup;
                            });

                          if (matchingComponents[0] !== normalizedComponent) {
                            return null;
                          }
                        }

                        return (
                          <tr
                            key={normalizedComponent}
                            className={`hover:bg-gray-50 ${
                              isPartOfGroup && showEquivalentComponents
                                ? "bg-yellow-50"
                                : ""
                            }`}
                          >
                            <td
                              className="w-40 p-2 border font-medium text-left"
                              title={getTooltipContent(normalizedComponent)}
                            >
                              {normalizedComponents
                                .displayNameMap[normalizedComponent]}
                              {isPartOfGroup && showEquivalentComponents &&
                                (
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
                                {normalizedComponents
                                    .componentFrameworkMap[normalizedComponent]
                                    .includes(vendor.name)
                                  ? (
                                    <span
                                      className="text-green-500 font-bold"
                                      title={`Available in ${vendor.name}`}
                                    >
                                      ✓
                                    </span>
                                  )
                                  : (
                                    <span
                                      className="text-gray-300"
                                      title={`Not available in ${vendor.name}`}
                                    >
                                      -
                                    </span>
                                  )}
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
          </div>

          {/* Component Equivalence Groups */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              Component Equivalence Groups
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(componentEquivalenceGroups).map((
                [group, components],
              ) => (
                <div key={group} className="p-3 border rounded bg-yellow-50">
                  <h3 className="font-bold">{group}</h3>
                  <div className="mt-1 text-sm">
                    {components.map((comp) => {
                      // Find actual component names that match this normalized name
                      const matchingNames = normalizedComponents.allComponents
                        .filter((c) => c.includes(comp))
                        .map((c) => normalizedComponents.displayNameMap[c])
                        .filter(Boolean);

                      return matchingNames.map((name) => (
                        <span
                          key={name}
                          className="inline-block bg-yellow-100 rounded px-2 py-1 m-1"
                        >
                          {name}
                        </span>
                      ));
                    })}
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

// Helper function to parse YAML data
function parseYamlData() {
  // This simulates parsing the YAML data and returns the structured object
  return {
    vendors: [
      {
        name: "Geist (Vercel)",
        components: [
          {
            category: "Navigation",
            name: "Tabs",
            description:
              "Tabs organize content into multiple sections, allowing one section to be viewed at a time",
            alsoKnownAs: ["TabView", "Tabbed navigation"],
          },
          {
            category: "Navigation",
            name: "Link",
            description:
              "A link allows a user to navigate to another page or resource",
            alsoKnownAs: ["Anchor", "Hyperlink"],
          },
          {
            category: "Navigation",
            name: "Breadcrumbs",
            description:
              "Displays a hierarchy of links to the current page or resource",
            alsoKnownAs: ["Breadcrumb trail"],
          },
          {
            category: "Navigation",
            name: "Disclosure",
            description:
              "A collapsible section of content (toggle to hide/show content)",
            alsoKnownAs: ["Expandable panel", "Details"],
          },
          {
            category: "Navigation",
            name: "Accordion",
            description:
              "A grouping of related disclosure panels (multiple collapsible sections)",
            alsoKnownAs: ["Expansion panel"],
          },
          {
            category: "Form",
            name: "Button",
            description:
              "Triggers an action or event, such as submitting a form or opening a dialog",
            alsoKnownAs: ["Push button", "CTA"],
          },
          {
            category: "Form",
            name: "Toggle",
            description:
              "Displays a boolean value as an interactive switch (on/off state)",
            alsoKnownAs: ["Toggle Switch"],
          },
          {
            category: "Form",
            name: "Switch",
            description:
              "Allows the user to choose between a set of options (often rendered as a segmented control)",
            alsoKnownAs: ["Segmented switch", "Option toggle"],
          },
          {
            category: "Form",
            name: "Checkbox",
            description:
              "A control that toggles between two states: checked or unchecked",
            alsoKnownAs: ["Checkbox input"],
          },
          {
            category: "Form",
            name: "Checkbox Group",
            description:
              "A group of checkboxes allowing multiple selections from a list",
            alsoKnownAs: ["Checkbox list"],
          },
          {
            category: "Form",
            name: "Radio",
            description:
              "Provides a single selection from a set of options (radio button)",
            alsoKnownAs: ["Radio button"],
          },
          {
            category: "Form",
            name: "Radio Group",
            description:
              "A group of radio buttons allowing one item to be selected at a time",
            alsoKnownAs: ["Option group"],
          },
          {
            category: "Form",
            name: "Choicebox",
            description:
              "A larger selectable card acting like a radio or checkbox with a bigger tap area and details",
            alsoKnownAs: ["Selection card", "Option card"],
          },
          {
            category: "Form",
            name: "Input",
            description:
              "Retrieves text input from a user (single-line text field)",
            alsoKnownAs: ["Text field", "Textbox"],
          },
          {
            category: "Form",
            name: "Textarea",
            description:
              "Allows a user to enter a multi-line text value via keyboard",
            alsoKnownAs: ["Multiline text field"],
          },
          {
            category: "Overlay",
            name: "Dialog",
            description:
              "An overlay shown above other content, typically to present important information or a prompt",
            alsoKnownAs: ["Dialog box", "Pop-up"],
          },
          {
            category: "Overlay",
            name: "Alert Dialog",
            description:
              "A modal window that alerts users with important information and awaits their acknowledgment or action",
            alsoKnownAs: ["Confirmation prompt"],
          },
          {
            category: "Overlay",
            name: "Tooltip",
            description:
              "Displays a brief description of an element when the user hovers or focuses on it",
            alsoKnownAs: ["Hint", "Info tooltip"],
          },
          {
            category: "Overlay",
            name: "Toast",
            description:
              "A succinct message displayed temporarily as feedback for an action",
            alsoKnownAs: ["Snackbar", "Notification toast"],
          },
          {
            category: "Data Display",
            name: "Avatar",
            description:
              "Represents a user or entity with an image, initials, or icon",
            alsoKnownAs: ["User avatar", "Profile image"],
          },
          {
            category: "Data Display",
            name: "Badge",
            description:
              "A label that highlights an item or categorizes it, often to draw attention",
            alsoKnownAs: ["Tag", "Pill"],
          },
        ],
      },
      {
        name: "Radix Primitives",
        components: [
          {
            category: "Disclosure",
            name: "Accordion",
            description:
              "A vertically stacked set of interactive headings that each reveal an associated section of content",
            alsoKnownAs: ["Collapsible panel set", "Expansion panel"],
          },
          {
            category: "Overlay",
            name: "Alert Dialog",
            description:
              "A modal dialog that interrupts the user with important content and expects a response",
            alsoKnownAs: ["Confirmation dialog", "Critical dialog"],
          },
          {
            category: "Layout",
            name: "Aspect Ratio",
            description:
              "Maintains a consistent width-to-height ratio for its child content (e.g., 16:9)",
            alsoKnownAs: ["Ratio box"],
          },
          {
            category: "Data Display",
            name: "Avatar",
            description:
              "A visual representation of a user or entity, shown as an image, icon, or initials",
            alsoKnownAs: ["Profile avatar"],
          },
          {
            category: "Data Display",
            name: "Badge",
            description:
              "A small label used to denote status or category, often displayed adjacent to other content",
            alsoKnownAs: ["Tag", "Pill"],
          },
          {
            category: "Navigation",
            name: "Breadcrumb",
            description:
              "Shows the navigation path (hierarchy) to the current page, with links for each level",
            alsoKnownAs: ["Breadcrumb trail"],
          },
        ],
      },
      {
        name: "shadcn/ui (ShadCN)",
        components: [
          {
            category: "Disclosure",
            name: "Accordion",
            description:
              "A collapsible set of sections with titled headers that can each expand or collapse",
            alsoKnownAs: ["Accordion (Tailwind, Radix-based)"],
          },
          {
            category: "Feedback",
            name: "Alert",
            description:
              "A component for displaying important messages or statuses, typically colored (success, error, etc.)",
            alsoKnownAs: ["Banner", "Flash message"],
          },
          {
            category: "Overlay",
            name: "Alert Dialog",
            description:
              "A modal confirmation dialog requiring user action (with integrated Tailwind styles)",
            alsoKnownAs: ["Confirm modal (shadcn)"],
          },
          {
            category: "Layout",
            name: "Aspect Ratio",
            description:
              "Enforces a specific aspect ratio on content, using Radix AspectRatio under the hood",
            alsoKnownAs: ["Aspect box"],
          },
          {
            category: "Form",
            name: "Input",
            description:
              "A text input component styled with the shadcn theme (includes variants for different sizes, etc.)",
            alsoKnownAs: ["Text field (shadcn)"],
          },
          {
            category: "Data Display",
            name: "Avatar",
            description:
              "A user avatar component (with support for image fallback to initials)",
            alsoKnownAs: ["User avatar (shadcn)"],
          },
        ],
      },
      {
        name: "Bits UI (Svelte)",
        components: [
          {
            category: "Disclosure",
            name: "Accordion",
            description:
              "A vertically stacked set of sections that can expand/collapse one at a time",
            alsoKnownAs: ["Accordion (headless)"],
          },
          {
            category: "Overlay",
            name: "Alert Dialog",
            description:
              "A modal dialog that interrupts the flow to present critical information and options",
            alsoKnownAs: ["Alert modal"],
          },
          {
            category: "Layout",
            name: "Aspect Ratio",
            description:
              "A container that maintains a set aspect ratio for its children (e.g., 16:9)",
            alsoKnownAs: ["AspectRatio (headless)"],
          },
          {
            category: "Data Display",
            name: "Avatar",
            description:
              "A headless avatar component for displaying user images or initials",
            alsoKnownAs: ["Avatar (headless)"],
          },
          {
            category: "Form",
            name: "Pin Input",
            description:
              "A set of inputs for entering a multi-digit PIN or verification code (headless logic)",
            alsoKnownAs: ["OTP input (headless)"],
          },
          {
            category: "Data Display",
            name: "Link Preview",
            description:
              "Displays a preview (e.g., title or thumbnail) when hovering over or focusing on a hyperlink",
            alsoKnownAs: ["URL preview"],
          },
        ],
      },
      {
        name: "React Spectrum",
        components: [
          {
            category: "Actions",
            name: "ActionButton",
            description:
              "A button that typically contains an icon or short text, allowing the user to perform an action",
            alsoKnownAs: ["Icon button", "Shortcut button"],
          },
          {
            category: "Actions",
            name: "ActionGroup",
            description:
              "A grouping of related action buttons displayed together",
            alsoKnownAs: ["Button group (actions)"],
          },
          {
            category: "Navigation",
            name: "Breadcrumbs",
            description:
              "Displays a hierarchy of links representing the current page's location",
            alsoKnownAs: ["Breadcrumb trail"],
          },
          {
            category: "Navigation",
            name: "Tabs",
            description:
              "Organizes content into multiple tabs, with one section visible at a time",
            alsoKnownAs: ["TabView"],
          },
          {
            category: "Color",
            name: "ColorArea",
            description:
              "Allows users to adjust two channels of a color (displayed as a 2D area, e.g., saturation vs. brightness)",
            alsoKnownAs: ["Color area picker"],
          },
          {
            category: "Color",
            name: "ColorPicker",
            description:
              "Combines a color swatch with a popover for selecting and editing a color",
            alsoKnownAs: ["Color picker (swatch + picker)"],
          },
        ],
      },
      {
        name: "Geist Shyakadavis",
        components: [
          {
            category: "Data Display",
            name: "Avatar",
            description:
              "Avatars represent a user or a team. Stacked avatars represent a group of people",
            alsoKnownAs: ["Profile picture", "User avatar"],
          },
          {
            category: "Data Display",
            name: "Badge",
            description:
              "A label that emphasizes an element that requires attention, or helps categorize with other similar elements.",
            alsoKnownAs: ["Tag", "Pill", "Label"],
          },
          {
            category: "Data Display",
            name: "Book",
            description: "A responsive book component.",
            alsoKnownAs: [],
          },
        ],
      },
    ],
  };
}

export default UIComponentExplorer;
