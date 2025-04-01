// src/common_v2.js (Final Version with Versioning and Refinements)

// --- SSR Mock Implementations ---
const SSRSignal = (init) => {
  let _v = init;
  const signalObject = {
    get value() {
      return _v;
    },
    set value(x) {
      _v = x;
    },
    toString() {
      return String(_v);
    },
    valueOf() {
      return _v;
    },
    [Symbol.toPrimitive]() {
      return _v;
    },
    peek() {
      return _v;
    },
    // Provide a no-op subscribe for potential compatibility checks
    subscribe(run) {
      run(_v);
      return () => {};
    },
  };
  return signalObject;
};

const SSRComputed = (fn) => {
  const computedObject = {
    get value() {
      return fn();
    }, // Recomputes on access
    toString() {
      return String(fn());
    },
    valueOf() {
      return fn();
    },
    [Symbol.toPrimitive]() {
      return fn();
    },
    peek() {
      return fn();
    }, // Recomputes on peek
    subscribe(run) {
      run(fn());
      return () => {};
    }, // No-op subscribe
  };
  // Add _fn tag for consistency with derivedBy, even if caching isn't used SSR
  computedObject._fn = fn;
  return computedObject;
};

// --- Main API Factory ---
export function createDeepStateAPIv2(
  // Inject dependencies, providing defaults from signals-core
  {
    signal: injectedSignal = coreSignal,
    computed: injectedComputed = coreComputed,
    untracked: injectedUntracked = coreUntracked,
    batch: injectedBatch = coreBatch,
  } = {}, // Default to empty object if no deps provided
  esc = "$", // Default escape hatch prefix
) {
  // --- Utilities (Internal) ---
  const IS_SHALLOW = Symbol("@m5nv/deepstate/v2/is-shallow");

  function shallow(obj) {
    if (obj && typeof obj === "object") {
      obj[IS_SHALLOW] = true;
    }
    return obj;
  }

  // --- SSR / Safe Primitives Determination ---
  const isNode = typeof process !== "undefined" && process.versions != null &&
    process.versions.node != null;
  const isBrowser = typeof window !== "undefined" &&
    typeof window.document !== "undefined";
  const mode = typeof process === "undefined"
    ? "SPA"
    : process.env.DEEPSTATE_MODE; // Allow override
  const isSSR = mode ? mode === "SSR" : (!isBrowser && isNode); // Default guess

  const safeSignal = isSSR ? SSRSignal : injectedSignal;
  const safeComputed = isSSR ? SSRComputed : injectedComputed;
  const safeUntracked = isSSR ? ((fn) => fn()) : injectedUntracked;
  // Batching only makes sense client-side (SPA mode)
  const safeBatch = (!isSSR && typeof injectedBatch === "function")
    ? injectedBatch
    : (fn) => fn();

  // Helper relies on peek() which we added to SSR mocks
  const isSignal = (val) =>
    val && typeof val === "object" && typeof val.peek === "function";

  // --- derivedBy (Internal - uses outer 'root' via closure) ---
  // Receives root from the closure captured by the get handler
  function derivedBy(self, fn, rootFromClosure, dbi) {
    const root = rootFromClosure; // Use simple name inside scope
    const computedSignal = safeComputed(() => { // Use safeComputed
      if (!root && fn.length > 1) { // Check root only if fn expects it
        dbi.error(
          "[derivedBy] Error: Root proxy not available for computed function:",
          fn?.name,
        );
        throw new Error(
          `Root proxy not available for computed function ${
            fn?.name || "anonymous"
          }`,
        );
      }
      // Only pass root if the function expects it (check arity)
      const result = fn.length > 1 ? fn(self, root) : fn(self);
      return result;
    });
    // Tag with original function for caching logic in proxy 'get'
    if (computedSignal) computedSignal._fn = fn;
    return computedSignal;
  }

  // --- snapshot/toJSON recursive helper ---
  // options: { forJson: boolean }
  function createSnapshot(
    source,
    options = { forJson: false }, // Default options object
    untrackedFn,
    escapeHatch = esc,
    proxyMap = new WeakMap(),
  ) {
    const { forJson } = options; // Extract flag

    // Use untrackedFn to prevent subscriptions during snapshot
    return untrackedFn(() => {
      // Handle non-objects, null, primitives, shallow objects
      if (!source || typeof source !== "object" || source[IS_SHALLOW]) {
        // Functions are included unless forJson is true
        return typeof source === "function" && forJson ? undefined : source;
      }

      // Handle signals (including computed) - use peek!
      if (isSignal(source)) {
        // Recursively snapshot the value inside the signal
        return createSnapshot(
          source.peek(),
          options, // Pass options object down
          untrackedFn,
          escapeHatch,
          proxyMap,
        );
      }

      // Handle potential circular references
      if (proxyMap.has(source)) {
        return proxyMap.get(source); // Return the already created snapshot reference
      }

      // Handle Arrays
      // Assumes iteration iterates underlying target keys/indices via default proxy behavior
      if (Array.isArray(source)) {
        const snapshotArray = [];
        proxyMap.set(source, snapshotArray); // Cache snapshot before iterating
        // Iterate using index to ensure proxy 'get' is triggered for elements if needed
        // but relies on Reflect.ownKeys below for deciding *which* keys to include.
        // Let's stick to ownKeys iteration for consistency.
        // We assume Reflect.ownKeys(proxy) defaults to Reflect.ownKeys(target) here.
        for (const key of Reflect.ownKeys(source)) {
          // Check if key is a standard array index (string or number) or 'length'
          const isIndex = String(parseInt(key, 10)) === key &&
            parseInt(key, 10) >= 0;
          const isLength = key === "length";

          // Skip non-index/non-length properties like internal methods or __version
          if (!isIndex && !isLength) {
            // Skip __version explicitly if Reflect.ownKeys returns it (it shouldn't by default)
            if (key === "__version") continue;
            // Let's be safe and skip symbols too
            if (typeof key === "symbol") continue;
            // We generally only want numeric indices in the snapshot array
            // Skip length property from array snapshot.
            continue;
          }

          // We only care about actual indices for the snapshot content
          if (isLength) continue;

          const value = source[key]; // Access via proxy might trigger get for elements (unlikely needed)

          // Skip functions if serializing for JSON
          if (forJson && typeof value === "function") {
            continue;
          }

          // Snapshot the value for the specific index 'key'
          snapshotArray[key] = createSnapshot(
            value,
            options, // Pass options object down
            untrackedFn,
            escapeHatch,
            proxyMap,
          );
        }

        return snapshotArray;
      }

      // Assume plain object (handles Proxies created by this library)
      // Assumes Reflect.ownKeys(proxy) defaults to Reflect.ownKeys(target)
      const snapshotObject = {};
      proxyMap.set(source, snapshotObject); // Cache snapshot before iterating

      // Iterate over keys of the *target* object (via default proxy ownKeys behavior)
      for (const key of Reflect.ownKeys(source)) {
        // Skip symbols, escape hatch properties, internal methods, __version
        // Also skip snapshot/toJSON methods themselves if they appear as keys
        if (
          typeof key === "symbol" ||
          (typeof key === "string" && key.startsWith(escapeHatch)) ||
          key === "__version" || // Skip version property
          key === "snapshot" || key === "toJSON" // Skip methods
        ) {
          continue;
        }

        // Access value via the proxy to ensure signals/computeds are resolved
        // (This is important if a computed property *has* been materialized onto the target)
        const value = source[key];

        // Skip functions if serializing for JSON
        if (forJson && typeof value === "function") {
          continue;
        }
        snapshotObject[key] = createSnapshot(
          value,
          options, // Pass options object down
          untrackedFn,
          escapeHatch,
          proxyMap,
        );
      }
      return snapshotObject;
    });
  }

  // --- Core Proxy Logic (Internal, renamed, adapted) ---
  function _createStateProxy(initial, options) {
    const { debug = false, escapeHatch = esc, permissive = false } = options;
    const dbi = (typeof debug === "object" && debug !== null &&
        typeof debug.log === "function")
      ? debug
      : (debug === true
        ? console
        : { log: () => {}, error: (console.error || console.log) });

    // ** Disallow top-level arrays **
    if (
      initial === null || typeof initial !== "object" || Array.isArray(initial)
    ) {
      throw new Error("Initial value must be a plain object.");
    }

    // *** Use outer 'root' variable captured by handler closures ***
    let root = null;

    // --- Helpers defined within scope ---
    function should_proxy(val) {
      return (
        val &&
        typeof val === "object" &&
        !val[IS_SHALLOW] &&
        (val.constructor === Object || Array.isArray(val))
      );
    }
    // ** deep_wrap no longer needs root parameter **
    // It needs 'opts' for permissive flag etc.
    function deep_wrap(val, opts) {
      // Use _recursiveDeepProxy defined below
      return should_proxy(val) ? _recursiveDeepProxy(val, opts) : val;
    }
    // ---

    // ** _recursiveDeepProxy no longer needs root parameter **
    function _recursiveDeepProxy(o, opts) {
      const { debug, escapeHatch, permissive } = opts; // Use options passed down
      const computedFns = {}; // Functions found at this level
      let storage; // Holds signals, nested proxies, raw shallow values
      let proxy; // The proxy for the *current* level `o`

      if (Array.isArray(o)) {
        storage = [];
        // ** Add array __version signal **
        Object.defineProperty(storage, "__version", {
          value: safeSignal(0),
          writable: false,
          enumerable: false,
          configurable: false,
        });
        // Use spread to assign mapped items while preserving __version property
        storage.push(...o.map((item) => {
          const itemIsObject = item && typeof item === "object";
          const itemIsSignalInstance = isSignal(item);
          const itemIsShallow = itemIsObject && item[IS_SHALLOW];
          if (itemIsObject && !itemIsSignalInstance && !itemIsShallow) {
            // ** No root passed down **
            return _recursiveDeepProxy(item, opts);
          } else if (itemIsShallow) {
            return item; // Store raw shallow item
          } else {
            // Wrap primitives; keep existing signals as is
            return itemIsSignalInstance ? item : safeSignal(item);
          }
        }));
      } else { // Object
        storage = {};
        for (const key in o) {
          if (!Object.hasOwnProperty.call(o, key)) continue;
          const val = o[key];
          if (typeof val === "function") {
            // Store the function def; computed signal created on demand in 'get'
            computedFns[key] = val;
          } else {
            const valIsObject = val && typeof val === "object";
            const valIsSignalInstance = isSignal(val);
            const valIsShallow = valIsObject && val[IS_SHALLOW];
            if (valIsObject && !valIsSignalInstance && !valIsShallow) {
              // ** No root passed down **
              storage[key] = _recursiveDeepProxy(val, opts);
            } else if (valIsShallow) {
              // Shallow object -> Wrap its REFERENCE in a signal
              storage[key] = safeSignal(val);
            } else {
              // Wrap primitives; keep existing signals as is
              storage[key] = valIsSignalInstance ? val : safeSignal(val);
            }
          }
        }
      }

      // --- Proxy Handler for this level ---
      // This handler closes over the outer 'root' variable defined in _createStateProxy
      const handler = {
        get: (target, prop, receiver) => {
          // --- 1. Escape Hatch Logic ---
          if (
            typeof escapeHatch === "string" && escapeHatch.length > 0 &&
            typeof prop === "string" && prop.startsWith(escapeHatch)
          ) {
            const actualProp = prop.substring(escapeHatch.length);
            dbi.log(
              `[Get EscapeHatch] Detected for "${prop}", actualProp: "${actualProp}"`,
            );
            if (actualProp in target) {
              const underlyingVal = Reflect.get(target, actualProp);
              dbi.log(
                `[Get EscapeHatch] Returning underlying value from target`,
              );
              return underlyingVal;
            }
            if (actualProp in computedFns) {
              dbi.log(`[Get EscapeHatch] Found computed function`);
              let computedSignal = Reflect.get(target, actualProp);
              if (
                !isSignal(computedSignal) ||
                computedSignal._fn !== computedFns[actualProp]
              ) {
                dbi.log(`[Get EscapeHatch] Materializing computed signal`);
                // ** Use outer 'root' variable from closure **
                computedSignal = derivedBy(
                  receiver,
                  computedFns[actualProp],
                  root,
                  dbi,
                );
                target[actualProp] = computedSignal;
              }
              dbi.log(
                `[Get EscapeHatch] Returning underlying computed signal object`,
              );
              return computedSignal;
            }
            dbi.log(
              `[Get EscapeHatch] Underlying property "${actualProp}" not found`,
            );
            return undefined;
          } // --- End Escape Hatch ---

          // --- 2. Snapshot/toJSON Handling ---
          // Snapshot includes resolved computed properties
          if (prop === "snapshot") {
            dbi.log(`[Get] Accessing snapshot method`);
            const snapshotFn = () => { // Define the function to return
              dbi.log(`[Snapshot] Starting snapshot creation`);
              // **Crucial Step:** Ensure computed properties for this level are materialized
              // The handler closure has access to 'computedFns' and 'receiver'
              dbi.log(`[Snapshot] Pre-materializing computed properties...`);
              for (const key in computedFns) {
                if (Object.hasOwnProperty.call(computedFns, key)) {
                  // Accessing the property via the proxy triggers the 'get' trap,
                  // which materializes the computed signal onto the target if not already there.
                  // We don't need the return value here, just the side effect.
                  try {
                    /* eslint-disable no-unused-expressions */
                    dbi.log(
                      `[Snapshot] Accessing computed '${key}' to materialize`,
                    );
                    receiver[key]; // Trigger the get trap for the computed prop
                    /* eslint-enable no-unused-expressions */
                  } catch (e) {
                    // Handle potential errors during computed access if necessary
                    dbi.error(
                      `[Snapshot] Error accessing computed property '${key}' during pre-materialization:`,
                      e,
                    );
                    // Optionally re-throw or handle differently if needed
                  }
                }
              }
              dbi.log(`[Snapshot] Pre-materialization complete.`);
              // Now call createSnapshot. It will iterate target keys (via default ownKeys),
              // including the now-materialized computed properties.
              // forJson is false, so non-function resolved values are kept.
              return createSnapshot(
                receiver,
                { forJson: false },
                safeUntracked,
                escapeHatch,
              );
            };
            return snapshotFn; // Return the function that performs the snapshot
          }
          // toJSON excludes computed properties (iterates target keys only by default)
          // and excludes functions.
          if (prop === "toJSON") {
            dbi.log(`[Get] Accessing toJSON method`);
            // Calls createSnapshot, which iterates target keys & skips functions via forJson:true
            return () =>
              createSnapshot(
                receiver,
                { forJson: true },
                safeUntracked,
                escapeHatch,
              );
          } // --- End Snapshot/toJSON ---

          // --- 3. Array __version Read Trigger ---
          if (Array.isArray(target) && target.__version) {
            dbi.log(`[Get] Reading array __version for prop "${String(prop)}"`);
            target.__version.value; // Establish dependency
          } // --- End Array __version Read ---

          // --- 4. Check Target Storage ---
          if (prop in target) {
            const val = Reflect.get(target, prop, receiver);
            if (isSignal(val)) {
              dbi.log(`[Get] Unwrapping signal for "${String(prop)}"`);
              return val.value;
            }
            dbi.log(
              `[Get] Returning non-signal from target for "${String(prop)}"`,
            );
            return val;
          }

          // --- 5. Check Computed Functions ---
          if (prop in computedFns) {
            dbi.log(`[Get] Accessing computed prop: "${String(prop)}"`);
            const cachedComputed = Reflect.get(target, prop);
            if (
              isSignal(cachedComputed) &&
              cachedComputed._fn === computedFns[prop]
            ) {
              dbi.log(`[Get] Returning cached computed value`);
              return cachedComputed.value;
            } else {
              dbi.log(`[Get] Creating new computed signal`);
              // ** Use outer 'root' variable from closure **
              const comp = derivedBy(receiver, computedFns[prop], root, dbi);
              target[prop] = comp; // Materialize onto target
              return comp.value;
            }
          }

          // --- 6. Check Array Methods ---
          if (
            Array.isArray(target) && typeof prop === "string" &&
            prop in Array.prototype
          ) {
            const method = Array.prototype[prop];
            if (typeof method === "function") {
              // TODO: Wrap mutating methods later if array-level versioning needs finer control
              dbi.log(`[Get] Returning bound array method: "${prop}"`);
              return method.bind(receiver);
            }
          }

          // --- 7. Fallback ---
          dbi.log(`[Get] Prop "${String(prop)}" not found`);
          return undefined;
        }, // End get

        set: (target, prop, newVal, receiver) => { // Using arrow function
          dbi.log(`[Set] Request to set prop "${String(prop)}"`);
          let changed = false;
          const currentVal = Reflect.get(target, prop); // Check storage

          // --- Define context variables reliably at the top ---
          const isTargetArray = Array.isArray(target);
          const propAsString = typeof prop === "string" ? prop : "";
          const isArrayIndex = isTargetArray &&
            String(Number(propAsString)) === propAsString &&
            Number(propAsString) >= 0;
          const isArrayLength = isTargetArray && prop === "length";
          // ---

          // --- Disallowed Operations ---
          // Disallow setting via escape hatch
          if (
            (typeof escapeHatch === "string" && escapeHatch.length > 0 &&
              typeof prop === "string" && prop.startsWith(escapeHatch))
          ) {
            const errorMsg = `Cannot directly set escaped property "${
              String(prop)
            }". Use the '.value' property on the underlying signal (if applicable) or mutation methods.`;
            console.error(errorMsg);
            throw new TypeError(errorMsg); // Throw
          }
          // Disallow setting computed properties
          if (prop in computedFns) {
            const errorMsg = `Cannot set a computed property "${
              String(prop)
            }".`;
            console.error(errorMsg);
            throw new TypeError(errorMsg); // Throw
          }

          // --- Allowed Operations ---
          // 1. Update existing signal
          if (isSignal(currentVal)) {
            dbi.log(`[Set] Updating signal value for "${String(prop)}"`);
            const wrappedNewVal = deep_wrap(newVal, opts); // Pass opts
            if (currentVal.peek() !== wrappedNewVal) {
              currentVal.value = wrappedNewVal;
              changed = true;
            } else dbi.log(`[Set] Skipping update as value is identical.`);
            // Increment array version if needed
            if (
              changed && (isArrayIndex || isArrayLength) && target.__version
            ) {
              dbi.log(
                `[Set] Incrementing array __version for signal update on "${
                  String(prop)
                }"`,
              );
              target.__version.value++;
            }
            return true; // SUCCESS
          } // 2. Handle array index assignment (allow adding/overwriting)
          else if (isArrayIndex) {
            dbi.log(
              `[Set Array Index] Allowing set for index "${String(prop)}"`,
            );
            const alreadyExisted = prop in target;
            const wrappedNewVal = deep_wrap(newVal, opts); // Pass opts
            let valueChanged = !alreadyExisted;
            if (alreadyExisted) {
              const oldVal = Reflect.get(target, prop);
              // Only signal values are guaranteed comparable with peek,
              // assume change when replacing non-signal or for proxies.
              valueChanged = !isSignal(oldVal) ||
                oldVal.peek() !== wrappedNewVal;
            }

            if (valueChanged) {
              // Store the proxy or primitive directly (result of deep_wrap)
              // Do NOT wrap in safeSignal here for array elements
              target[prop] = wrappedNewVal;
              changed = true;
              if (target.__version) {
                dbi.log(
                  `[Set] Incrementing array __version for index set "${
                    String(prop)
                  }"`,
                );
                target.__version.value++;
              }
            } else {dbi.log(
                `[Set Array Index] Skipping update as value is identical.`,
              );}
            return true; // SUCCESS
          } // 3. Handle array length assignment
          else if (isArrayLength) {
            dbi.log(`[Set Array Length] Allowing set for length`);
            const currentLength = target.length;
            try {
              target[prop] = newVal; // Allow potential native errors for invalid length
              if (target.length !== currentLength) {
                changed = true;
                if (target.__version) target.__version.value++;
              } else dbi.log(`[Set Array Length] Length value unchanged.`);
              return true; // SUCCESS
            } catch (e) {
              console.error(
                `Error setting array length for "${String(prop)}":`,
                e,
              );
              throw e; // Re-throw native errors
            }
          } // 4. Handle new property in permissive mode (for objects)
          else if (!(prop in target)) {
            if (permissive) {
              dbi.log(
                `[Set Permissive] Adding new object property "${String(prop)}"`,
              );
              // Wrap new value in signal for object properties
              target[prop] = safeSignal(deep_wrap(newVal, opts)); // Pass opts
              changed = true; // Assume change occurred
              return true; // SUCCESS
            } else {
              const errorMsg = `Cannot add new property '${
                String(prop)
              }' in strict mode.`;
              console.error(errorMsg);
              throw new TypeError(errorMsg); // Throw error in strict mode
            }
          } // 5. Property exists but isn't signal/array index/length
          // (e.g., nested proxy, shallow object) - DISALLOW REPLACEMENT (V1 Policy)
          else {
            const errorMsg =
              `Whole array/object replacement is disallowed for deep property "${
                String(prop)
              }". Use mutation methods or actions.`;
            console.error(errorMsg);
            throw new TypeError(errorMsg); // Throw specific error
          }
        }, // End set

        has: (target, prop) => { // Using arrow function
          // dbi.log(`[Has] Check for prop: "${String(prop)}"`);
          // ** Refined 'has' for escape hatch **
          if (
            typeof escapeHatch === "string" && escapeHatch.length > 0 &&
            typeof prop === "string" && prop.startsWith(escapeHatch)
          ) {
            const actualProp = prop.substring(escapeHatch.length);
            return (actualProp in target) || (actualProp in computedFns);
          }
          return (prop in target) || (prop in computedFns);
        },

        deleteProperty: (target, prop) => { // Using arrow function
          dbi.log(`[Delete] Request for prop: "${String(prop)}"`);
          let deleted = false;
          const hadPropInTarget = prop in target;
          const isComputed = prop in computedFns;
          const isArrayIndex = Array.isArray(target) &&
            Number.isInteger(Number(prop));

          // Disallow deleting via escape hatch
          if (
            typeof escapeHatch === "string" && escapeHatch.length > 0 &&
            typeof prop === "string" && prop.startsWith(escapeHatch)
          ) {
            console.error(
              `Cannot directly delete escaped property "${String(prop)}".`,
            );
            return false;
          }

          if (isComputed) {
            dbi.log(`[Delete] Removing computed definition "${String(prop)}"`);
            delete computedFns[prop];
            if (hadPropInTarget) Reflect.deleteProperty(target, prop); // Delete cached signal too
            deleted = true;
          } else if (hadPropInTarget) {
            deleted = Reflect.deleteProperty(target, prop);
            dbi.log(
              `[Delete] Deleting from target storage "${
                String(prop)
              }": ${deleted}`,
            );
          } else {
            dbi.log(`[Delete] Property "${String(prop)}" not found.`);
            return false; // Nothing to delete
          }

          // ** Increment array version if deleted **
          if (deleted && isArrayIndex && target.__version) {
            dbi.log(
              `[Delete] Incrementing array __version for index "${
                String(prop)
              }"`,
            );
            target.__version.value++;
          }
          return deleted; // Return true if deleted from target or computedFns map
        },
      }; // End handler

      proxy = new Proxy(storage, handler);
      return proxy;
    } // End _recursiveDeepProxy

    // --- Initial Proxy Creation & Root Assignment ---
    const optionsForProxy = { debug, escapeHatch, permissive };
    // ** Initial call doesn't need root parameter **
    const finalProxy = _recursiveDeepProxy(initial, optionsForProxy);
    // ** Assign outer 'root' variable AFTER structure is built **
    root = finalProxy;
    dbi.log(
      "[_createStateProxy] Root proxy established using outer variable closure.",
    );
    return finalProxy; // Return the root proxy
  } // End _createStateProxy

  // --- reify Function (Internal API Entry Point) ---
  function reify(
    initial,
    options = { permissive: false, debug: false, actions: {} },
  ) {
    // Default actions in options destructuring
    const {
      permissive,
      debug,
      actions: providedActions = {},
      ...otherOptions
    } = options;
    const proxyOptions = { permissive, debug, escapeHatch: esc };

    // ** Add top-level version signal **
    const topVersion = safeSignal(0);
    let store = null; // Placeholder for closure in attach

    // Create the state proxy first
    const rootProxy = _createStateProxy(initial, proxyOptions);

    // Define attach method
    function attach(actions = {}) {
      if (!store) {
        // This should ideally not happen if attach is only called on the returned store
        console.error("Store not initialized before calling attach.");
        return store;
      }
      if (!store.actions) store.actions = {};
      for (const name in actions) {
        if (Object.hasOwnProperty.call(actions, name)) {
          store.actions[name] = (...args) => {
            let result;
            // Use safeBatch (no-op in SSR)
            safeBatch(() => {
              try {
                // Action operates on the state proxy
                result = actions[name](store.state, ...args);
              } catch (error) {
                console.error(`Error executing action "${name}":`, error);
                throw error; // Re-throw
              }
            });
            // ** Increment topVersion after action completes successfully**
            topVersion.value++;
            return result;
          };
        }
      }
      return store; // Allow chaining
    }

    // Define toJSON/snapshot using rootProxy closure
    function toJSON() {
      // Delegates to proxy, which calls createSnapshot({ forJson: true })
      return rootProxy.toJSON ? rootProxy.toJSON() : undefined;
    }
    function snapshot() {
      // Delegates to proxy, which materializes computeds then calls createSnapshot({ forJson: false })
      return rootProxy.snapshot ? rootProxy.snapshot() : undefined;
    }

    // Define the store object structure
    // Ensure attach is available for initial actions call if needed
    store = {
      state: rootProxy,
      attach,
      toJSON, // Add toJSON to the store object
      snapshot, // Add snapshot to the store object
      // actions property is added by attach()
    };

    // ** Define __version property on store **
    Object.defineProperty(store, "__version", {
      value: topVersion, // Store the signal itself
      writable: false,
      enumerable: false, // Hide from normal iteration/JSON
    });

    // Attach any actions passed directly in options during creation
    if (Object.keys(providedActions).length > 0) {
      attach(providedActions);
    }

    return store;
  } // End reify

  // --- Return Public API ---
  // shallow is defined above in factory scope
  return { shallow, reify };
} // End createDeepStateAPIv2
