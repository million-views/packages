// src/common_v2.js (Refactored + Dynamic Computed Props + Stricter Delete)

// --- Error Messages ---
const ERROR_MESSAGES = {
  ROOT_PROXY_UNAVAILABLE: (name) =>
    `Root proxy not available for computed function ${name || "anonymous"}`,
  INITIAL_VALUE_MUST_BE_OBJECT: "Initial value must be a plain object.",
  CANNOT_SET_ESCAPED: (prop) =>
    `Cannot directly set escaped property "${
      String(prop)
    }". Use the '.value' property on the underlying signal (if applicable) or mutation methods.`,
  CANNOT_SET_COMPUTED: (prop) =>
    `Cannot set a computed property "${String(prop)}".`,
  CANNOT_ADD_STRICT: (prop) =>
    `Cannot add new property "${String(prop)}" in strict mode (object).`,
  CANNOT_REPLACE_PROXY: (prop) =>
    `Whole array/object replacement is disallowed for deep property "${
      String(prop)
    }". Use mutation methods or actions.`,
  CANNOT_DELETE_ESCAPED: (prop) =>
    `Cannot directly delete escaped property "${String(prop)}".`,
  CANNOT_DELETE_STRICT: (prop) =>
    `Cannot delete existing property "${String(prop)}" in strict mode.`,
  STORE_NOT_INITIALIZED: "Store not initialized before calling attach.",
  ACTION_ERROR: (name, error) => `Error executing action "${name}": ${error}`,
};

// --- SSR Mock Implementations ---
const SSRSignal = (init) => {
  let _v = init;
  return {
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
    debug = false,
  } = {},
  esc = "$",
) {
  const dbi =
    (typeof debug === "object" && debug !== null &&
        typeof debug.log === "function")
      ? debug
      : (debug === true ? console : { log: () => {}, error: () => {} });

  dbi.log("[Factory] Initializing DeepState API v2");

  const IS_SHALLOW = Symbol("@m5nv/deepstate/v2/is-shallow");

  function shallow(obj) {
    if (obj && typeof obj === "object") obj[IS_SHALLOW] = true;
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

  dbi.log(
    `[Factory] Environment detection: isNode=${isNode}, isBrowser=${isBrowser}, mode=${mode}, isSSR=${isSSR}`,
  );

  const safeSignal = isSSR ? SSRSignal : injectedSignal;
  const safeComputed = isSSR ? SSRComputed : injectedComputed;
  const safeUntracked = isSSR ? ((fn) => fn()) : injectedUntracked;
  const safeBatch = (!isSSR && typeof injectedBatch === "function")
    ? injectedBatch
    : (fn) => fn();

  const isSignal = (val) =>
    val && typeof val === "object" && typeof val.peek === "function";

  function derivedBy(self, fn, rootFromClosure) {
    const root = rootFromClosure;
    const computedSignal = safeComputed(() => {
      if (!root && fn.length > 1) {
        const errorMsg = ERROR_MESSAGES.ROOT_PROXY_UNAVAILABLE(fn?.name);
        dbi.error("[derivedBy] Error:", errorMsg);
        throw new Error(errorMsg);
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
      if (proxyMap.has(source)) return proxyMap.get(source);

      if (Array.isArray(source)) {
        const snapshotArray = [];
        proxyMap.set(source, snapshotArray);
        for (const key of Reflect.ownKeys(source)) {
          const isIndex = String(parseInt(key, 10)) === key &&
            parseInt(key, 10) >= 0;
          const isLength = key === "length";
          if (
            !isIndex && !isLength || isLength || key === "__version" ||
            typeof key === "symbol"
          ) continue;
          const value = source[key];
          if (forJson && typeof value === "function") continue;
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
          key === "__version" || key === "snapshot" || key === "toJSON"
        ) continue;
        const value = source[key];
        if (forJson && typeof value === "function") continue;
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
    const { permissive = false } = options;
    if (
      initial === null || typeof initial !== "object" || Array.isArray(initial)
    ) {
      throw new Error(ERROR_MESSAGES.INITIAL_VALUE_MUST_BE_OBJECT);
    }
    let root = null;

    function should_proxy(val) {
      return val && typeof val === "object" && !val[IS_SHALLOW] &&
        (val.constructor === Object || Array.isArray(val));
    }
    function deep_wrap(val, currentLevelOpts) {
      return should_proxy(val)
        ? _recursiveDeepProxy(val, currentLevelOpts)
        : val;
    }

    function _recursiveDeepProxy(o, currentLevelOpts) {
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
          } else if (itemIsShallow) return item;
          else return itemIsSignalInstance ? item : safeSignal(item);
        }));
      } else {
        storage = {};
        for (const key in o) {
          if (!Object.hasOwnProperty.call(o, key)) continue;
          const val = o[key];
          if (typeof val === "function") computedFns[key] = val;
          else {
            const valIsObject = val && typeof val === "object";
            const valIsSignalInstance = isSignal(val);
            const valIsShallow = valIsObject && val[IS_SHALLOW];
            if (valIsObject && !valIsSignalInstance && !valIsShallow) {
              storage[key] = _recursiveDeepProxy(val, currentLevelOpts);
            } else if (valIsShallow) storage[key] = safeSignal(val);
            else storage[key] = valIsSignalInstance ? val : safeSignal(val);
          }
        }
      }

      const handler = {
        get: (target, prop, receiver) => {
          if (
            typeof esc === "string" && esc.length > 0 &&
            typeof prop === "string" && prop.startsWith(esc)
          ) {
            const actualProp = prop.substring(esc.length);
            dbi.log(`[Get EscapeHatch] "${prop}" -> "${actualProp}"`);
            if (actualProp in target) return Reflect.get(target, actualProp);
            if (actualProp in computedFns) {
              let computedSignal = Reflect.get(target, actualProp);
              if (
                !isSignal(computedSignal) ||
                computedSignal._fn !== computedFns[actualProp]
              ) {
                dbi.log(
                  `[Get EscapeHatch] Materializing computed signal for "${actualProp}"`,
                );
                computedSignal = derivedBy(
                  receiver,
                  computedFns[actualProp],
                  root,
                );
                target[actualProp] = computedSignal;
              }
              return computedSignal;
            }
            return undefined;
          }
          if (prop === "snapshot") {
            const snapshotFn = () => {
              dbi.log(`[Snapshot] Pre-materializing...`);
              for (const key in computedFns) {
                if (Object.hasOwnProperty.call(computedFns, key)) {
                  try {
                    receiver[key];
                  } catch (e) {
                    dbi.error(`[Snapshot] Error materializing '${key}':`, e);
                  }
                }
              }
              dbi.log(`[Snapshot] Pre-materialization complete.`);
              return createSnapshot(
                receiver,
                { forJson: false },
                safeUntracked,
                esc,
              );
            };
            return snapshotFn;
          }
          if (prop === "toJSON") {
            return () =>
              createSnapshot(receiver, { forJson: true }, safeUntracked, esc);
          }
          if (
            Array.isArray(target) && prop !== "__version" && target.__version
          ) target.__version.value;
          if (prop in target) {
            const val = Reflect.get(target, prop, receiver);
            if (prop === "__version" && isSignal(val)) return val;
            if (isSignal(val)) return val.value;
            return val;
          }
          if (prop in computedFns) {
            const cachedComputed = Reflect.get(target, prop);
            if (
              isSignal(cachedComputed) &&
              cachedComputed._fn === computedFns[prop]
            ) return cachedComputed.value;
            else {
              const comp = derivedBy(receiver, computedFns[prop], root);
              target[prop] = comp;
              return comp.value;
            }
          }
          if (
            Array.isArray(target) && typeof prop === "string" &&
            prop in Array.prototype
          ) {
            const method = Array.prototype[prop];
            if (typeof method === "function") return method.bind(receiver);
          }
          return undefined;
        }, // End get

        set: (target, prop, newVal, receiver) => {
          dbi.log(`[Set] Request to set prop "${String(prop)}"`);
          const currentVal = Reflect.get(target, prop);
          const isTargetArray = Array.isArray(target);
          const propAsString = typeof prop === "string" ? prop : "";
          const isArrayIndex = isTargetArray &&
            String(Number(propAsString)) === propAsString &&
            Number(propAsString) >= 0;
          const isArrayLength = isTargetArray && prop === "length";

          if (
            typeof esc === "string" && esc.length > 0 &&
            typeof prop === "string" && prop.startsWith(esc)
          ) {
            const errorMsg = ERROR_MESSAGES.CANNOT_SET_ESCAPED(prop);
            dbi.error(errorMsg);
            throw new TypeError(errorMsg);
          }
          if (prop in computedFns) { // Check initial computed definitions
            const errorMsg = ERROR_MESSAGES.CANNOT_SET_COMPUTED(prop);
            dbi.error(errorMsg);
            throw new TypeError(errorMsg);
          }

          if (isSignal(currentVal)) {
            const wrappedNewVal = deep_wrap(newVal, currentLevelOpts);
            if (currentVal.peek() !== wrappedNewVal) {
              currentVal.value = wrappedNewVal;
              if ((isArrayIndex || isArrayLength) && target.__version) {
                target.__version.value++;
              }
            }
            return true;
          } else if (isArrayIndex) {
            const alreadyExisted = prop in target;
            const wrappedNewVal = deep_wrap(newVal, currentLevelOpts);
            let valueChanged = !alreadyExisted ||
              (!isSignal(Reflect.get(target, prop)) ||
                Reflect.get(target, prop).peek() !== wrappedNewVal);
            if (valueChanged) {
              target[prop] = wrappedNewVal;
              if (target.__version) target.__version.value++;
            }
            return true;
          } else if (isArrayLength) {
            const currentLength = target.length;
            try {
              target[prop] = newVal;
              if (target.length !== currentLength && target.__version) {
                target.__version.value++;
              }
              return true;
            } catch (e) {
              dbi.error(`Error setting array length:`, e);
              throw e;
            }
          } else if (!(prop in target)) {
            if (currentLevelOpts.permissive) {
              if (typeof newVal === "function") {
                dbi.log(
                  `[Set Permissive] Adding NEW COMPUTED property "${
                    String(prop)
                  }"`,
                );
                const computedSignal = derivedBy(receiver, newVal, root);
                target[prop] = computedSignal;
                return true;
              } else {
                dbi.log(
                  `[Set Permissive] Adding new object property "${
                    String(prop)
                  }"`,
                );
                target[prop] = safeSignal(deep_wrap(newVal, currentLevelOpts));
                return true;
              }
            } else {
              const errorMsg = ERROR_MESSAGES.CANNOT_ADD_STRICT(prop);
              dbi.error(errorMsg);
              throw new TypeError(errorMsg);
            }
          } else {
            const errorMsg = ERROR_MESSAGES.CANNOT_REPLACE_PROXY(prop);
            dbi.error(errorMsg);
            throw new TypeError(errorMsg);
          }
        }, // End set

        has: (target, prop) => {
          if (
            typeof esc === "string" && esc.length > 0 &&
            typeof prop === "string" && prop.startsWith(esc)
          ) {
            const actualProp = prop.substring(esc.length);
            return (actualProp in target) || (actualProp in computedFns);
          }
          return (prop in target) || (prop in computedFns);
        },

        // #############################################################
        // # deleteProperty Trap with Stricter Delete Logic START      #
        // #############################################################
        deleteProperty: (target, prop) => {
          dbi.log(`[Delete] Request for prop: "${String(prop)}"`);
          const hadPropInTarget = prop in target;
          const isComputed = prop in computedFns; // Check initial computed definitions
          const isPermissive = currentLevelOpts.permissive;

          // Disallow deleting via escape hatch (return true to avoid invariant error)
          if (
            typeof esc === "string" && esc.length > 0 &&
            typeof prop === "string" && prop.startsWith(esc)
          ) {
            dbi.error(ERROR_MESSAGES.CANNOT_DELETE_ESCAPED(prop));
            return true;
          }

          // *** Strict Mode Check - Now includes computed properties ***
          if (!isPermissive) { // If in strict mode...
            const isTargetArray = Array.isArray(target);
            const isArrayIndex = isTargetArray &&
              String(Number(prop)) === String(prop) && Number(prop) >= 0;

            // Prevent deletion IF it's an existing property on target OR an initial computed property definition,
            // AND it's NOT an array index.
            // Note: Dynamically added computed props are stored on target, so hadPropInTarget handles them.
            if ((hadPropInTarget || isComputed) && !isArrayIndex) {
              const errorMsg = ERROR_MESSAGES.CANNOT_DELETE_STRICT(prop);
              dbi.error(errorMsg);
              throw new TypeError(errorMsg); // Throw error
            }
            dbi.log(
              `[Delete] Allowing potential deletion for "${
                String(prop)
              }" in strict mode (must be array index or non-existent).`,
            );
          }
          // *** End Strict Mode Check ***

          // Proceed with deletion if permissive OR if it's an array index (strict mode already checked)
          let deleted = false;
          if (isComputed) { // Only reachable in permissive mode now for initial computed defs
            dbi.log(
              `[Delete Permissive] Removing computed definition "${
                String(prop)
              }"`,
            );
            delete computedFns[prop];
            if (hadPropInTarget) Reflect.deleteProperty(target, prop); // Delete cached signal too
            return true; // Deletion of definition successful
          } else if (hadPropInTarget) { // Data property on target (or dynamically added computed signal)
            // Strict mode already validated if applicable (i.e., it must be an array index)
            deleted = Reflect.deleteProperty(target, prop);
            dbi.log(
              `[Delete${
                isPermissive ? " Permissive" : ""
              }] Deleting from target storage "${String(prop)}": ${deleted}`,
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
            return deleted; // Return result of Reflect.deleteProperty
          } else { // Property not found on target and not an initial computed definition
            dbi.log(`[Delete] Property "${String(prop)}" not found.`);
            return true; // Deleting non-existent is successful (prevents invariant error)
          }
        }, // End deleteProperty
        // #############################################################
        // # deleteProperty Trap with Stricter Delete Logic END        #
        // #############################################################
      }; // End handler

      proxy = new Proxy(storage, handler);
      return proxy;
    } // End _recursiveDeepProxy

    const optionsForProxy = { permissive };
    const finalProxy = _recursiveDeepProxy(initial, optionsForProxy);
    root = finalProxy;
    dbi.log("[_createStateProxy] Root proxy established.");
    return finalProxy;
  } // End _createStateProxy

  function reify(
    initial,
    options = { permissive: false, actions: {} },
  ) {
    const { permissive, actions: providedActions = {} } = options;
    const proxyOptions = { permissive };
    const topVersion = safeSignal(0);
    let store = null;

    dbi.log("[reify] Creating state proxy...");
    const rootProxy = _createStateProxy(initial, proxyOptions);
    dbi.log("[reify] State proxy created.");

    function attach(actions = {}) {
      if (!store) {
        dbi.error(ERROR_MESSAGES.STORE_NOT_INITIALIZED);
        console.error(ERROR_MESSAGES.STORE_NOT_INITIALIZED);
        return store;
      }
      if (!store.actions) store.actions = {};
      for (const name in actions) {
        if (Object.hasOwnProperty.call(actions, name)) {
          store.actions[name] = (...args) => {
            let result;
            dbi.log(`[Action] Running action "${name}"...`);
            safeBatch(() => {
              try {
                result = actions[name](store.state, ...args);
              } catch (error) {
                dbi.error(`[Action Error] Action "${name}":`, error);
                console.error(ERROR_MESSAGES.ACTION_ERROR(name, error));
                throw error;
              }
            });
            dbi.log(
              `[Action] Completed action "${name}". Incrementing topVersion.`,
            );
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

    store = { state: rootProxy, attach, toJSON, snapshot };
    Object.defineProperty(store, "__version", {
      value: topVersion,
      writable: false,
      enumerable: false,
    });
    if (Object.keys(providedActions).length > 0) {
      dbi.log("[reify] Attaching initial actions...");
      attach(providedActions);
    }
    dbi.log("[reify] Store created successfully.");
    return store;
  } // End reify

  return { shallow, reify };
} // End createDeepStateAPIv2

// --- Placeholder Core Primitives ---
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
