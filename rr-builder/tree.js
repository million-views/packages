// Input data as an array of objects with 'path' and optional 'label'
const inputData = [
  { path: "/", label: "[Home]" },
  { path: "/settings", label: "[Settings]" },
  { path: "/dashboard", label: "[Dashboard]" },
  { path: "/dashboard/overview", label: "[Overview]" },
  { path: "/dashboard/overview/performance" }, // Label will be derived if not explicitly set later
  { path: "/dashboard/overview/metrics" }, // Label will be derived if not explicitly set later
  { path: "/dashboard/analytics", label: "[Analytics]" },
  { path: "/dashboard/analytics/traffic" }, // Label will be derived if not explicitly set later
  { path: "/dashboard/analytics/conversion" }, // Label will be derived if not explicitly set later
  { path: "/dashboard/reports", label: "[Reports]" },
  { path: "/dashboard/reports/monthly" }, // Label will be derived if not explicitly set later
  { path: "/dashboard/reports/quarterly" }, // Label will be derived if not explicitly set later
  { path: "/dashboard/reports/annual" }, // Label will be derived if not explicitly set later
  // { path: "/users", label: "[Users]" }, // Removed this entry for testing the new logic
  { path: "/users/active", label: "[Active Users]" },
  { path: "/users/inactive", label: "[Inactive Users]" },
  { path: "/users/roles", label: "[All Roles]" },
  { path: "/users/roles/admin", label: "[Administrators]" },
  { path: "/users/roles/editor", label: "[Editors]" },
  { path: "/users/roles/viewer", label: "[Viewers]" },
  // { path: "/users", label: "[Tricked You!]" }, // Add/remove this entry for testing the new logic
];

/**
 * Converts a string to PascalCase.
 * @param {string} str - The input string.
 * @returns {string} The string in PascalCase.
 */
function toPascalCase(str) {
  if (!str) return "";
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")) // Remove hyphens/underscores and capitalize next char
    .replace(/^(.)/, (_, c) => c.toUpperCase()); // Capitalize the first character
}

/**
 * Parses the input data (array of objects) and builds a hierarchical tree structure
 * in the form of nested objects. Intermediate nodes will get a derived label
 * (PascalCase of their name) unless a specific label is provided in the input data
 * for that path, in which case the provided label overrides the derived one.
 * @param {object[]} data - An array of objects, each with 'path' and optional 'label'.
 * @returns {object} The root node of the tree structure.
 */
function buildTree(data) {
  // Initialize the root node. The root path '/' is handled explicitly.
  const root = { name: "/", label: "", children: {} }; // Label for root will be set from input data
  const nodes = { "/": root }; // Use a map for quick access to nodes by path

  data.forEach((item) => {
    const path = item.path;
    const explicitLabel = item.label; // Store the explicit label from the input

    // Handle the root path separately
    if (path === "/") {
      root.label = explicitLabel !== undefined
        ? explicitLabel
        : `[${toPascalCase(root.name)}]`;
      nodes["/"] = root; // Ensure root is in the map with its label
      return; // Skip further processing for the root path
    }

    // Split the path into segments, filtering out empty strings
    const segments = path.split("/").filter((segment) => segment !== "");

    let currentNode = root;
    let currentPath = ""; // To build the path string for the nodes map

    // Traverse or create nodes for each segment
    segments.forEach((segment, index) => {
      // Build the path for the current segment
      currentPath = (currentPath === "/" ? "" : currentPath) + "/" + segment;
      if (currentPath === "") currentPath = "/"; // Handle case for the first segment relative to root

      // If the segment doesn't exist as a child of the current node, create it
      if (!currentNode.children[segment]) {
        currentNode.children[segment] = {
          name: segment,
          // Assign a derived label when the node is first created
          label: `[${toPascalCase(segment)}]`,
          children: {},
        };
        // Add the newly created node to the nodes map
        nodes[currentPath] = currentNode.children[segment];
      }

      // Move to the next node
      currentNode = currentNode.children[segment];

      // If this is the last segment of the original path AND an explicit label was provided
      // for this path in the input data, override the derived label with the explicit one.
      if (index === segments.length - 1 && explicitLabel !== undefined) {
        currentNode.label = explicitLabel;
        // Ensure the final node in the map has the correct label
        nodes[path] = currentNode;
      }
    });
  });

  return root;
}

/**
 * Recursively generates the tree string representation.
 * @param {object} node - The current node being processed.
 * @param {string} prefix - The prefix string for the current level (indentation and connectors).
 * @param {boolean} isLast - True if the current node is the last sibling.
 * @returns {string} The tree string representation for the current node and its children.
 */
function generateTreeString(node, prefix = "", isLast = true) {
  // Determine the connector and indentation
  const connector = isLast ? "└── " : "├── ";
  // The indentation for children depends on whether the current node was the last sibling
  const indentation = prefix + (isLast ? "    " : "│   ");

  // Format the current node's line
  let result = `${prefix}${connector}${node.name} ${node.label}\n`;

  // Get children keys and sort them alphabetically for consistent output
  const childrenKeys = Object.keys(node.children).sort();
  const numChildren = childrenKeys.length;

  // Recursively process children
  childrenKeys.forEach((key, index) => {
    const childNode = node.children[key];
    const isLastChild = index === numChildren - 1;
    // Recursively call for children, updating the prefix
    result += generateTreeString(childNode, indentation, isLastChild);
  });

  return result;
}

// --- Main execution ---

// Build the tree structure from the input data
const treeStructure = buildTree(inputData);

// Generate the final tree output string, starting with the root node's representation
let treeOutput = `/ ${treeStructure.label}\n`; // Start with the root node's line

// Generate the string for the children of the root node
const rootChildrenKeys = Object.keys(treeStructure.children).sort();
const numRootChildren = rootChildrenKeys.length;

rootChildrenKeys.forEach((key, index) => {
  const childNode = treeStructure.children[key];
  const isLastChild = index === numRootChildren - 1;
  // Start the recursive generation from the root's children, with initial prefix
  treeOutput += generateTreeString(childNode, "", isLastChild);
});

// Output the result to the console
console.log(treeOutput);

// The 'treeOutput' variable now contains the formatted tree string.
// You can use this variable to display the tree in a console or on a webpage.
