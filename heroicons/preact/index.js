// The only reason this file exists is to appease Vite's optimizeDeps feature which requires a root-level import.

module.exports = new Proxy(
  {},
  {
    get: (_, property) => {
      if (property === "__esModule") {
        return {};
      }

      throw new Error(
        `Importing from \`@heroicons/preact\` directly is not supported. Please import from either \`@heroicons/preact/16/solid\`, \`@heroicons/preact/20/solid\`, \`@heroicons/preact/24/solid\`, or \`@heroicons/preact/24/outline\` instead.`,
      );
    },
  },
);
