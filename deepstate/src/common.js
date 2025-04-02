// src/common_v2.js (Version with fixed deleteProperty return values)

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
    },
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
    },
    subscribe(run) {
      run(fn());
      return () => {};
    },
  };
  computedObject._fn = fn;
  return computedObject;
};

// --- Main API Factory ---
export function createDeepStateAPIv2(
  {
    signal: injectedSignal = coreSignal,
    computed: injectedComputed = coreComputed,
    untracked: injectedUntracked = coreUntracked,
    batch: injectedBatch = coreBatch,
  } = {},
  esc = "$",
) {
  const IS_SHALLOW = Symbol("@m5nv/deepstate/v2/is-shallow");

  function shallow(obj) {
    if (obj && typeof obj === "object") {
      obj[IS_SHALLOW] = true;
    }
    return obj;
  }

  const isNode = typeof process !== "undefined" && process.versions != null &&
    process.versions.node != null;
  const isBrowser = typeof window !== "undefined" &&
    typeof window.document !== "undefined";
  const mode = typeof process === "undefined"
    ? "SPA"
    : process.env.DEEPSTATE_MODE;
  const isSSR = mode ? mode === "SSR" : (!isBrowser && isNode);

  const safeSignal = isSSR ? SSRSignal : injectedSignal;
  const safeComputed = isSSR ? SSRComputed : injectedComputed;
  const safeUntracked = isSSR ? ((fn) => fn()) : injectedUntracked;
  const safeBatch = (!isSSR && typeof injectedBatch === "function")
    ? injectedBatch
    : (fn) => fn();

  const isSignal = (val) =>
    val && typeof val === "object" && typeof val.peek === "function";

  function derivedBy(self, fn, rootFromClosure, dbi) {
    const root = rootFromClosure;
    const computedSignal = safeComputed(() => {
      if (!root && fn.length > 1) {
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
      const result = fn.length > 1 ? fn(self, root) : fn(self);
      return result;
    });
    if (computedSignal) computedSignal._fn = fn;
    return computedSignal;
  }

  function createSnapshot(
    source,
    options = { forJson: false },
    untrackedFn,
    escapeHatch = esc,
    proxyMap = new WeakMap(),
  ) {
    const { forJson } = options;

    return untrackedFn(() => {
      if (!source || typeof source !== "object" || source[IS_SHALLOW]) {
        return typeof source === "function" && forJson ? undefined : source;
      }

      if (isSignal(source)) {
        return createSnapshot(
          source.peek(),
          options,
          untrackedFn,
          escapeHatch,
          proxyMap,
        );
      }

      if (proxyMap.has(source)) {
        return proxyMap.get(source);
      }

      if (Array.isArray(source)) {
        const snapshotArray = [];
        proxyMap.set(source, snapshotArray);
        for (const key of Reflect.ownKeys(source)) {
          const isIndex = String(parseInt(key, 10)) === key &&
            parseInt(key, 10) >= 0;
          const isLength = key === "length";
          if (!isIndex && !isLength) {
            if (key === "__version") continue;
            if (typeof key === "symbol") continue;
            continue;
          }
          if (isLength) continue;
          const value = source[key];
          if (forJson && typeof value === "function") {
            continue;
          }
          snapshotArray[key] = createSnapshot(
            value,
            options,
            untrackedFn,
            escapeHatch,
            proxyMap,
          );
        }
        return snapshotArray;
      }

      const snapshotObject = {};
      proxyMap.set(source, snapshotObject);
      for (const key of Reflect.ownKeys(source)) {
        if (
          typeof key === "symbol" ||
          (typeof key === "string" && key.startsWith(escapeHatch)) ||
          key === "__version" ||
          key === "snapshot" || key === "toJSON"
        ) {
          continue;
        }
        const value = source[key];
        if (forJson && typeof value === "function") {
          continue;
        }
        snapshotObject[key] = createSnapshot(
          value,
          options,
          untrackedFn,
          escapeHatch,
          proxyMap,
        );
      }
      return snapshotObject;
    });
  }

  function _createStateProxy(initial, options) {
    const { debug = false, escapeHatch = esc, permissive = false } = options;
    const dbi = (typeof debug === "object" && debug !== null &&
        typeof debug.log === "function")
      ? debug
      : (debug === true
        ? console
        : { log: () => {}, error: (console.error || console.log) });

    if (
      initial === null || typeof initial !== "object" || Array.isArray(initial)
    ) {
      throw new Error("Initial value must be a plain object.");
    }

    let root = null;

    function should_proxy(val) {
      return (
        val &&
        typeof val === "object" &&
        !val[IS_SHALLOW] &&
        (val.constructor === Object || Array.isArray(val))
      );
    }

    function deep_wrap(val, opts) {
      return should_proxy(val) ? _recursiveDeepProxy(val, opts) : val;
    }

    function _recursiveDeepProxy(o, opts) {
      const currentLevelOpts = opts;
      const computedFns = {};
      let storage;
      let proxy;

      if (Array.isArray(o)) {
        storage = [];
        Object.defineProperty(storage, "__version", {
          value: safeSignal(0),
          writable: false,
          enumerable: false,
          configurable: false,
        });
        storage.push(...o.map((item) => {
          const itemIsObject = item && typeof item === "object";
          const itemIsSignalInstance = isSignal(item);
          const itemIsShallow = itemIsObject && item[IS_SHALLOW];
          if (itemIsObject && !itemIsSignalInstance && !itemIsShallow) {
            return _recursiveDeepProxy(item, currentLevelOpts);
          } else if (itemIsShallow) {
            return item;
          } else {
            return itemIsSignalInstance ? item : safeSignal(item);
          }
        }));
      } else {
        storage = {};
        for (const key in o) {
          if (!Object.hasOwnProperty.call(o, key)) continue;
          const val = o[key];
          if (typeof val === "function") {
            computedFns[key] = val;
          } else {
            const valIsObject = val && typeof val === "object";
            const valIsSignalInstance = isSignal(val);
            const valIsShallow = valIsObject && val[IS_SHALLOW];
            if (valIsObject && !valIsSignalInstance && !valIsShallow) {
              storage[key] = _recursiveDeepProxy(val, currentLevelOpts);
            } else if (valIsShallow) {
              storage[key] = safeSignal(val);
            } else {
              storage[key] = valIsSignalInstance ? val : safeSignal(val);
            }
          }
        }
      }

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
          if (prop === "snapshot") {
            dbi.log(`[Get] Accessing snapshot method`);
            const snapshotFn = () => {
              dbi.log(`[Snapshot] Starting snapshot creation`);
              dbi.log(`[Snapshot] Pre-materializing computed properties...`);
              for (const key in computedFns) {
                if (Object.hasOwnProperty.call(computedFns, key)) {
                  try {
                    /* eslint-disable no-unused-expressions */
                    dbi.log(
                      `[Snapshot] Accessing computed '${key}' to materialize`,
                    );
                    receiver[key];
                    /* eslint-enable no-unused-expressions */
                  } catch (e) {
                    dbi.error(
                      `[Snapshot] Error accessing computed property '${key}' during pre-materialization:`,
                      e,
                    );
                  }
                }
              }
              dbi.log(`[Snapshot] Pre-materialization complete.`);
              return createSnapshot(
                receiver,
                { forJson: false },
                safeUntracked,
                escapeHatch,
              );
            };
            return snapshotFn;
          }
          if (prop === "toJSON") {
            dbi.log(`[Get] Accessing toJSON method`);
            return () =>
              createSnapshot(
                receiver,
                { forJson: true },
                safeUntracked,
                escapeHatch,
              );
          } // --- End Snapshot/toJSON ---

          // --- 3. Array __version Read Trigger ---
          if (
            Array.isArray(target) && prop !== "__version" && target.__version
          ) { // Avoid reading version when accessing version itself
            dbi.log(`[Get] Reading array __version for prop "${String(prop)}"`);
            target.__version.value;
          } // --- End Array __version Read ---

          // --- 4. Check Target Storage ---
          if (prop in target) {
            const val = Reflect.get(target, prop, receiver);
            // Special handling for __version: return the signal itself, not its value
            if (prop === "__version" && isSignal(val)) {
              dbi.log(
                `[Get] Returning __version signal object for "${String(prop)}"`,
              );
              return val;
            }
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
              const comp = derivedBy(receiver, computedFns[prop], root, dbi);
              target[prop] = comp;
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
              dbi.log(`[Get] Returning bound array method: "${prop}"`);
              return method.bind(receiver);
            }
          }

          // --- 7. Fallback ---
          dbi.log(`[Get] Prop "${String(prop)}" not found`);
          return undefined;
        }, // End get

        set: (target, prop, newVal, receiver) => {
          dbi.log(`[Set] Request to set prop "${String(prop)}"`);
          let changed = false;
          const currentVal = Reflect.get(target, prop);

          const isTargetArray = Array.isArray(target);
          const propAsString = typeof prop === "string" ? prop : "";
          const isArrayIndex = isTargetArray &&
            String(Number(propAsString)) === propAsString &&
            Number(propAsString) >= 0;
          const isArrayLength = isTargetArray && prop === "length";

          if (
            typeof escapeHatch === "string" && escapeHatch.length > 0 &&
            typeof prop === "string" && prop.startsWith(escapeHatch)
          ) {
            const errorMsg = `Cannot directly set escaped property "${
              String(prop)
            }". Use the '.value' property on the underlying signal (if applicable) or mutation methods.`;
            console.error(errorMsg);
            throw new TypeError(errorMsg);
          }
          if (prop in computedFns) {
            const errorMsg = `Cannot set a computed property "${
              String(prop)
            }".`;
            console.error(errorMsg);
            throw new TypeError(errorMsg);
          }

          if (isSignal(currentVal)) {
            dbi.log(`[Set] Updating signal value for "${String(prop)}"`);
            const wrappedNewVal = deep_wrap(newVal, currentLevelOpts);
            if (currentVal.peek() !== wrappedNewVal) {
              currentVal.value = wrappedNewVal;
              changed = true;
            } else dbi.log(`[Set] Skipping update as value is identical.`);
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
            return true;
          } else if (isArrayIndex) {
            dbi.log(
              `[Set Array Index] Allowing set for index "${String(prop)}"`,
            );
            const alreadyExisted = prop in target;
            const wrappedNewVal = deep_wrap(newVal, currentLevelOpts);
            let valueChanged = !alreadyExisted;
            if (alreadyExisted) {
              const oldVal = Reflect.get(target, prop);
              valueChanged = !isSignal(oldVal) ||
                oldVal.peek() !== wrappedNewVal;
            }
            if (valueChanged) {
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
            return true;
          } else if (isArrayLength) {
            dbi.log(`[Set Array Length] Allowing set for length`);
            const currentLength = target.length;
            try {
              target[prop] = newVal;
              if (target.length !== currentLength) {
                changed = true;
                if (target.__version) target.__version.value++;
              } else dbi.log(`[Set Array Length] Length value unchanged.`);
              return true;
            } catch (e) {
              console.error(
                `Error setting array length for "${String(prop)}":`,
                e,
              );
              throw e;
            }
          } else if (!(prop in target)) {
            if (currentLevelOpts.permissive) {
              dbi.log(
                `[Set Permissive] Adding new object property "${String(prop)}"`,
              );
              target[prop] = safeSignal(deep_wrap(newVal, currentLevelOpts));
              changed = true;
              return true;
            } else {
              const errorMsg = `Cannot add new property '${
                String(prop)
              }' in strict mode.`;
              console.error(errorMsg);
              throw new TypeError(errorMsg);
            }
          } else {
            const errorMsg =
              `Whole array/object replacement is disallowed for deep property "${
                String(prop)
              }". Use mutation methods or actions.`;
            console.error(errorMsg);
            throw new TypeError(errorMsg);
          }
        }, // End set

        has: (target, prop) => {
          if (
            typeof escapeHatch === "string" && escapeHatch.length > 0 &&
            typeof prop === "string" && prop.startsWith(escapeHatch)
          ) {
            const actualProp = prop.substring(escapeHatch.length);
            return (actualProp in target) || (actualProp in computedFns);
          }
          return (prop in target) || (prop in computedFns);
        },

        // #############################################################
        // # deleteProperty Trap with Fixes START                      #
        // #############################################################
        deleteProperty: (target, prop) => {
          dbi.log(`[Delete] Request for prop: "${String(prop)}"`);
          let deleted = false;
          const hadPropInTarget = prop in target;
          const isComputed = prop in computedFns;
          const isPermissive = currentLevelOpts.permissive; // Use opts from closure

          // Disallow deleting via escape hatch (but return true to avoid invariant error)
          if (
            typeof escapeHatch === "string" && escapeHatch.length > 0 &&
            typeof prop === "string" && prop.startsWith(escapeHatch)
          ) {
            dbi.error(
              `[Delete] Attempted to delete escaped property "${
                String(prop)
              }". Operation prevented.`,
            );
            // Return true: signifies the operation completed without throwing,
            // even though no deletion occurred. Prevents invariant TypeError.
            return true;
          }

          // Allow deleting computed property definitions regardless of permissive mode
          if (isComputed) {
            dbi.log(`[Delete] Removing computed definition "${String(prop)}"`);
            delete computedFns[prop];
            if (hadPropInTarget) Reflect.deleteProperty(target, prop);
            deleted = true; // Conceptual deletion occurred
            // Return true as the definition is gone or wasn't there
            return true; // Explicitly return true after handling computed
          } // Check if property exists on target storage
          else if (hadPropInTarget) {
            // Strict Mode Check
            if (!isPermissive) {
              const isTargetArray = Array.isArray(target);
              const isArrayIndex = isTargetArray &&
                String(Number(prop)) === String(prop) && Number(prop) >= 0;

              if (!isArrayIndex) { // Prevent deletion ONLY IF it's NOT an array index
                const errorMsg = `Cannot delete existing property "${
                  String(prop)
                }" in strict mode.`;
                dbi.error(errorMsg);
                throw new TypeError(errorMsg); // Throw error as requested
              }
              dbi.log(
                `[Delete] Allowing deletion of array index "${
                  String(prop)
                }" in strict mode.`,
              );
            }
            // End Strict Mode Check

            // Proceed with deletion if permissive OR if it's an array index in strict mode
            deleted = Reflect.deleteProperty(target, prop);
            dbi.log(
              `[Delete] Deleting from target storage "${
                String(prop)
              }": ${deleted}`,
            );

            // Increment array version if an array index was successfully deleted
            const isTargetArray = Array.isArray(target);
            const isArrayIndex = isTargetArray &&
              String(Number(prop)) === String(prop) && Number(prop) >= 0;
            if (deleted && isArrayIndex && target.__version) {
              dbi.log(
                `[Delete] Incrementing array __version for index "${
                  String(prop)
                }"`,
              );
              target.__version.value++;
            }
            // Return the result of Reflect.deleteProperty
            return deleted;
          } else {
            dbi.log(`[Delete] Property "${String(prop)}" not found.`);
            // Return true: Deleting a non-existent property is considered successful.
            // Prevents invariant TypeError.
            return true;
          }
          // Fallback, should not be reached if logic above is sound
          // return deleted; // This line is likely unreachable now
        }, // End deleteProperty
        // #############################################################
        // # deleteProperty Trap with Fixes END                        #
        // #############################################################
      }; // End handler

      proxy = new Proxy(storage, handler);
      return proxy;
    } // End _recursiveDeepProxy

    const optionsForProxy = { debug, escapeHatch, permissive };
    const finalProxy = _recursiveDeepProxy(initial, optionsForProxy);
    root = finalProxy;
    dbi.log(
      "[_createStateProxy] Root proxy established using outer variable closure.",
    );
    return finalProxy;
  } // End _createStateProxy

  function reify(
    initial,
    options = { permissive: false, debug: false, actions: {} },
  ) {
    const {
      permissive,
      debug,
      actions: providedActions = {},
      ...otherOptions
    } = options;
    const proxyOptions = { permissive, debug, escapeHatch: esc };

    const topVersion = safeSignal(0);
    let store = null;

    const rootProxy = _createStateProxy(initial, proxyOptions);

    function attach(actions = {}) {
      if (!store) {
        console.error("Store not initialized before calling attach.");
        return store;
      }
      if (!store.actions) store.actions = {};
      for (const name in actions) {
        if (Object.hasOwnProperty.call(actions, name)) {
          store.actions[name] = (...args) => {
            let result;
            safeBatch(() => {
              try {
                result = actions[name](store.state, ...args);
              } catch (error) {
                console.error(`Error executing action "${name}":`, error);
                throw error;
              }
            });
            topVersion.value++;
            return result;
          };
        }
      }
      return store;
    }

    function toJSON() {
      return rootProxy.toJSON ? rootProxy.toJSON() : undefined;
    }
    function snapshot() {
      return rootProxy.snapshot ? rootProxy.snapshot() : undefined;
    }

    store = {
      state: rootProxy,
      attach,
      toJSON,
      snapshot,
    };

    Object.defineProperty(store, "__version", {
      value: topVersion,
      writable: false,
      enumerable: false,
    });

    if (Object.keys(providedActions).length > 0) {
      attach(providedActions);
    }

    return store;
  } // End reify

  return { shallow, reify };
} // End createDeepStateAPIv2

// Assume coreSignal, coreComputed, etc., are imported or defined elsewhere
// Example placeholder if running standalone:
const coreSignal = (v) => ({
  value: v,
  peek: () => v,
  subscribe: (cb) => {
    cb(v);
    return () => {};
  },
});
const coreComputed = (fn) => ({
  get value() {
    return fn();
  },
  peek: fn,
  subscribe: (cb) => {
    cb(fn());
    return () => {};
  },
});
const coreUntracked = (fn) => fn();
const coreBatch = (fn) => fn();
