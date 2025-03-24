throw Error(
  `Please import '@m5nv/deepstate/react' for React, '@m5nv/deepstate' for Preact, and '@m5nv/deepstate/core' for CLI and Svelte instead`,
);

/*--
========================================================================
   Deepstate API
========================================================================
--*/

/**
 * Marks an object as shallow so that it is not deeply wrapped.
 * @typedef {function} shallow
 * @param {object} obj - The object to mark as shallow.
 * @returns {object} The same object, now marked as shallow.
 */

/**
 * Creates a reactive state from initial and optional computed properties;
 * returns a fluent interface that includes the reactive state and an API to attach actions.
 *
 * @typedef {function} reify
 * @param {object} initial - The initial state object.
 * @param {object} [computed_fns={}] - An object mapping computed property names to functions.
 * @param {boolean} [permissive=false] - Whether to allow adding new properties.
 * @returns {object} An API object containing:
 *   - state: The reactive state proxy.
 *   - attach: A function to attach actions to the state.
 *   - toJSON: A function to serialize the state (including computed properties).
 */
