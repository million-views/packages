const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");

// In SSR mode, we want a mutable signal that stores its value.
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
      return "" + _v;
    },
    valueOf() {
      return _v;
    },
    [Symbol.toPrimitive]() {
      return _v;
    },
  };
};

// In SSR mode, computed values are re-evaluated on each access.
const SSRComputed = (fn) => ({
  get value() {
    return fn();
  },
  toString() {
    return "" + fn();
  },
  valueOf() {
    return fn();
  },
  [Symbol.toPrimitive]() {
    return fn();
  },
});

export function createDeepStateAPI({ signal, computed, untracked }) {
  // DEEPSTATE_MODE can be "SPA" or "SSR"
  // If not set, default to checking window.
  const mode = typeof process === "undefined"
    ? "SPA"
    : process.env.DEEPSTATE_MODE;
  const isSSR = mode ? mode === "SSR" : (typeof window === "undefined");
  // console.log({ mode, isSSR });
  const safeSignal = isSSR ? SSRSignal : signal;
  const safeComputed = isSSR ? SSRComputed : computed;
  const safeUntracked = isSSR ? ((fn) => fn()) : untracked;

  function shallow(obj) {
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
    // console.log("init_signals: ", obj);
    const s = {};
    for (const k in obj) {
      s[k] = safeSignal(deep_wrap(obj[k], permissive));
    }
    if (Array.isArray(obj)) s.__version = safeSignal(0);
    return s;
  }
  function create_handler(permissive, signals, computedMap = {}, extra = {}) {
    return {
      get(t, prop, receiver) {
        // console.log("get", { t, prop, receiver });
        if (prop in extra) return extra[prop];
        if (typeof prop === "string" && prop.startsWith("$")) {
          const key = prop.slice(1);
          if (key in computedMap) {
            return isSSR ? computedMap[key].value : computedMap[key];
          }
          if (!(key in signals) && permissive) {
            signals[key] = safeSignal(deep_wrap(t[key], permissive));
          }
          return isSSR ? signals[key].value : signals[key];
        }
        if (Array.isArray(t) && signals.__version) {
          signals.__version.value;
        }
        if (prop in signals) return signals[prop].value;
        if (prop in computedMap) return computedMap[prop].value;
        return Reflect.get(t, prop, receiver);
      },
      set(t, prop, value) {
        // console.log("set", { t, prop, value });

        if (Array.isArray(t) && prop === "length") {
          t[prop] = value;
          if (signals.__version) signals.__version.value++;
          return true;
        }
        if (typeof prop === "string" && prop.startsWith("$")) {
          const key = prop.slice(1);
          if (Array.isArray(t[key])) {
            signals[key].value = deep_wrap(value, permissive);
            if (Array.isArray(t) && signals.__version) {
              signals.__version.value++;
            }
            return true;
          }
          throw Error(
            `Cannot directly set '${prop}'. Use the signal's 'value' property.`,
          );
        }
        if (
          Array.isArray(t[prop]) &&
          Array.isArray(value) &&
          !t[prop][IS_SHALLOW]
        ) {
          throw Error(
            "Whole array replacement is disallowed for deep arrays. Use the '$' escape hatch.",
          );
        }
        if (Array.isArray(t) && Number.isInteger(Number(prop))) {
          t[prop] = value;
          signals[prop] = safeSignal(deep_wrap(value, permissive));
          if (signals.__version) signals.__version.value++;
          return true;
        }
        if (typeof value === "function") {
          throw Error(
            "Functions are not allowed as state properties in DeepState.",
          );
        }
        if (prop in signals) {
          signals[prop].value = deep_wrap(value, permissive);
          if (Array.isArray(t) && signals.__version) signals.__version.value++;
          return true;
        }
        if (!permissive) {
          throw Error(`Cannot add new property '${prop}' in strict mode.`);
        }
        signals[prop] = safeSignal(deep_wrap(value, permissive));
        t[prop] = value;
        if (Array.isArray(t) && signals.__version) signals.__version.value++;
        return true;
      },
      deleteProperty(t, prop) {
        if (Array.isArray(t) && Number.isInteger(Number(prop))) {
          const result = Reflect.deleteProperty(t, prop);
          if (signals[prop]) signals[prop].value = undefined;
          if (signals.__version) signals.__version.value++;
          return result;
        }
        const result = Reflect.deleteProperty(t, prop);
        if (signals[prop]) signals[prop].value = undefined;
        return result;
      },
      ownKeys(t) {
        let keys = Reflect.ownKeys(t);
        if (Object.keys(computedMap).length > 0) {
          keys = keys.concat(Object.keys(computedMap))
            .filter((k) => k !== "toJSON" && k !== "snapshot");
        }
        return keys;
      },
      getOwnPropertyDescriptor(t, prop) {
        const desc = Reflect.getOwnPropertyDescriptor(t, prop);
        return desc !== undefined
          ? desc
          : { enumerable: true, configurable: true };
      },
    };
  }
  function deep_proxy(obj, permissive) {
    const signals = init_signals(obj, permissive);
    return new Proxy(obj, create_handler(permissive, signals));
  }
  function create_deepstate(initial, derived = {}, permissive = false) {
    if (typeof initial !== "object" || initial === null) {
      throw TypeError(
        "'initial' must be a non-null object. Use signal(...) for simple types.",
      );
    }
    const signals = init_signals(initial, permissive);
    const computed_signals = {};
    const snapshot = (for_json = false) => {
      return safeUntracked(() => {
        const plain = {};
        for (const key in signals) {
          if (key.startsWith("$") || key === "__version") continue;
          const val = signals[key].value;
          if (typeof val !== "function") plain[key] = val;
        }
        if (!for_json) {
          for (const ckey in computed_signals) {
            const cval = computed_signals[ckey].value;
            if (typeof cval !== "function") plain[ckey] = cval;
          }
        }
        return plain;
      });
    };
    const to_json = () => snapshot(true);
    const state_proxy = new Proxy(
      initial,
      create_handler(permissive, signals, computed_signals, {
        toJSON: to_json,
        snapshot,
      }),
    );
    Object.keys(derived).forEach((key) => {
      computed_signals[key] = safeComputed(() => derived[key](state_proxy));
    });
    return { proxy: state_proxy, signals, computed_signals };
  }
  function reify(initial, computed_fns = {}, permissive = false) {
    const { proxy } = create_deepstate(initial, computed_fns, permissive);
    function attach(actions = {}) {
      store.actions = Object.fromEntries(
        Object.entries(actions).map(([name, fn]) => [
          name,
          (...args) => fn(store.state, ...args),
        ]),
      );
      return store;
    }
    const store = {
      state: proxy,
      attach,
      toJSON: () => proxy.toJSON(),
    };
    return store;
  }
  return { shallow, reify };
}
