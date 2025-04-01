import { computed, effect, signal } from "@preact/signals-core";

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");

export function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

function derivedBy(self, fn, root) {
  return computed(() => fn(self, root));
}

export function simpleDeepProxy(initial) {
  const computedFns = {};
  let storage = Array.isArray(initial) ? [] : {};

  // One pass: for each property in the initial object…
  for (const key in initial) {
    const val = initial[key];
    if (typeof val === "function") {
      // Functions become inline computed properties.
      computedFns[key] = val;
    } else if (val && typeof val === "object" && !("value" in val)) {
      // If it's an object (or array) and not a signal, then:
      if (val[IS_SHALLOW]) {
        // If marked shallow, leave it as-is.
        storage[key] = val;
      } else {
        // Otherwise, recurse.
        storage[key] = simpleDeepProxy(val);
      }
    } else {
      // Wrap primitive values in signals.
      storage[key] = signal(val);
    }
  }

  const handler = {
    get(target, prop, receiver) {
      if (prop in target) {
        const v = Reflect.get(target, prop, receiver);
        if (v && typeof v === "object" && "value" in v) {
          return v.value;
        }
        return v;
      }
      if (prop in computedFns) {
        const comp = derivedBy(receiver, computedFns[prop], receiver);
        // Cache the computed signal so subsequent accesses unwrap it.
        target[prop] = comp;
        return comp.value;
      }
      return undefined;
    },
    set(target, prop, newVal, receiver) {
      if (prop in target) {
        const curr = Reflect.get(target, prop, receiver);
        if (curr && typeof curr === "object" && "value" in curr) {
          curr.value = newVal;
          return true;
        }
      }
      return Reflect.set(target, prop, newVal, receiver);
    },
  };

  return new Proxy(storage, handler);
}

const initial = {
  count: 2,
  nested: {
    factor: 3,
    double(self, root) {
      console.log("root: ", root);
      return self.factor * 2;
    },
  },
  double(self, root) {
    return self.count * 2;
  },
  quadruple(self, root) {
    // Uses our computed double (unwrapped via the proxy)
    return self.double * 2;
  },
};

const proxyObj = simpleDeepProxy(initial);

console.log("count:", proxyObj.count); // 2
console.log("double:", proxyObj.double); // 4
console.log("quadruple:", proxyObj.quadruple); // 8
console.log("nested.factor:", proxyObj.nested.factor); // 3
console.log("nested.double:", proxyObj.nested.double); // 6

proxyObj.count++;
proxyObj.nested.factor = 4;

console.log("After updates:");
console.log("count:", proxyObj.count); // 3
console.log("double:", proxyObj.double); // 6
console.log("quadruple:", proxyObj.quadruple); // 12
console.log("nested.factor:", proxyObj.nested.factor); // 4
console.log("nested.double:", proxyObj.nested.double); // 8
