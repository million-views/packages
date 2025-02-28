import { computed, signal } from "@preact/signals";

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");

export function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

function should_proxy(val) {
  return (
    val &&
    typeof val === "object" &&
    !val[IS_SHALLOW] &&
    (val.constructor === Object || Array.isArray(val))
  );
}

function deep_wrap(val, permissive) {
  return should_proxy(val) ? deep_proxy(val, permissive) : val;
}

function init_signals(obj, permissive) {
  const s = {};
  for (const k in obj) {
    s[k] = signal(deep_wrap(obj[k], permissive));
  }
  return s;
}

function create_handler(
  target,
  permissive,
  signals,
  computed = {},
  extra = {},
) {
  return {
    get(t, prop, receiver) {
      if (prop in extra) return extra[prop];
      if (typeof prop === "string" && prop.startsWith("$")) {
        const key = prop.slice(1);
        if (!(key in signals) && permissive) {
          signals[key] = signal(deep_wrap(t[key], permissive));
        }
        return signals[key];
      }
      if (prop in signals) return signals[prop].value;
      if (prop in computed) return computed[prop].value;
      return Reflect.get(t, prop, receiver);
    },
    set(t, prop, value) {
      if (typeof value === "function") {
        throw Error(
          "Functions are not allowed as state properties in DeepState.",
        );
      }
      if (typeof prop === "string" && prop.startsWith("$")) {
        throw Error(
          `Cannot directly set '${prop}'. Use the signal's 'value' property.`,
        );
      }

      if (prop in signals) {
        signals[prop].value = deep_wrap(value, permissive);
        return true;
      }
      if (!permissive) {
        throw Error(
          "Cannot add new property '" + prop + "' in strict mode.",
        );
      }
      signals[prop] = signal(deep_wrap(value, permissive));
      t[prop] = value;
      return true;
    },
    ownKeys(t) {
      let keys = Reflect.ownKeys(t);
      if (Object.keys(computed).length > 0) {
        keys = keys.concat(Object.keys(computed)).filter((k) => k !== "toJSON");
      }
      return keys;
    },
    getOwnPropertyDescriptor() {
      return { enumerable: true, configurable: true };
    },
  };
}

function deep_proxy(obj, permissive) {
  const signals = init_signals(obj, permissive);
  return new Proxy(obj, create_handler(obj, permissive, signals));
}

function create_deepstate(initial, derived = {}, permissive = false) {
  if (typeof initial !== "object" || initial === null) {
    throw TypeError(
      "'initial' must be a non-null object. Use signal directly for simple types.",
    );
  }
  const signals = init_signals(initial, permissive);
  const computed_signals = {};
  const to_json = () => {
    const plain = {};
    for (const key in signals) {
      if (!key.startsWith("$") && typeof signals[key].value !== "function") {
        plain[key] = signals[key].value;
      }
    }
    return plain;
  };
  const state_proxy = new Proxy(
    initial,
    create_handler(initial, permissive, signals, computed_signals, {
      toJSON: to_json,
    }),
  );

  Object.keys(derived).forEach((key) => {
    computed_signals[key] = computed(() => derived[key](state_proxy));
  });

  return state_proxy;
}

export function reify(initial, computed_fns = {}, permissive = false) {
  const state = create_deepstate(initial, computed_fns, permissive);
  const api = {
    state,
    attach(actions = {}) {
      api.actions = Object.fromEntries(
        Object.entries(actions).map((
          [k, fn],
        ) => [k, (...args) => fn(api, ...args)]),
      );
      return api;
    },
    toJSON() {
      return state.toJSON();
    },
  };
  return api;
}

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
 * Determines if the provided value should be wrapped in a reactive proxy.
 * @typedef {function} should_proxy
 * @param {*} val - The value to test.
 * @returns {boolean} True if the value is an object or array (and not marked shallow), false otherwise.
 */

/**
 * Recursively wraps a value in a reactive proxy if needed.
 * @typedef {function} deep_wrap
 * @param {*} val - The value to wrap.
 * @param {boolean} permissive - Whether to allow adding new properties.
 * @returns {*} The wrapped value if applicable, or the original value.
 */

/**
 * Creates reactive signals for each property in an object.
 * @typedef {function} init_signals
 * @param {object} obj - The source object.
 * @param {boolean} permissive - Whether to allow adding new properties.
 * @returns {object} An object mapping each key to a signal wrapping its corresponding value.
 */

/**
 * Creates a proxy handler to manage reactive state behavior.
 * @typedef {function} create_handler
 * @param {object} target - The target object.
 * @param {boolean} permissive - Whether to allow adding new properties.
 * @param {object} signals - An object mapping property keys to signals.
 * @param {object} [computed={}] - An object mapping computed property keys to computed signals.
 * @param {object} [extra={}] - Additional properties to expose (e.g. toJSON).
 * @returns {ProxyHandler<object>} The proxy handler.
 */

/**
 * Wraps an object or array in a reactive proxy that tracks its properties.
 * @typedef {function} deep_proxy
 * @param {object|Array} obj - The object or array to wrap.
 * @param {boolean} permissive - Whether to allow adding new properties.
 * @returns {object|Array} The proxied object.
 */

/**
 * Creates a deep reactive state proxy with support for computed properties.
 * @typedef {function} create_deepstate
 * @param {object} initial - The initial state object.
 * @param {object} [derived={}] - An object mapping computed property names to functions.
 * @param {boolean} [permissive=false] - Whether to allow adding new properties.
 * @returns {object} The reactive state proxy.
 * @throws {TypeError} If the initial state is not a non-null object.
 */

/**
 * Creates a reactive state from initial and optional computed properties; returns
 * fluent interface that includes the reactive state and an API to attach actions
 * @typedef {function} reify
 * @param {object} initial - The initial state object.
 * @param {object} [computed_fns={}] - An object mapping computed property names to functions.
 * @param {boolean} [permissive=false] - Whether to allow adding new properties.
 * @returns {object} An API object containing:
 *   - state: The reactive state proxy.
 *   - attach: A function to attach actions to the state.
 *   - toJSON: A function to serialize the state (omitting computed properties).
 */
