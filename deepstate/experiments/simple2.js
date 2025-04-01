import { computed, signal } from "@preact/signals-core";

function derivedBy(self, fn, root) {
  return computed(() => fn(self, root));
}

export function simpleDeepProxy(initial) {
  const storage = {}; // container for signal-wrapped plain values
  const computedFns = {}; // to store inline computed functions
  // one pass over initial: wrap non-functions, and collect functions
  for (const key in initial) {
    const val = initial[key];
    if (typeof val === "function") {
      computedFns[key] = val;
    } else {
      storage[key] = signal(val);
    }
  }
  const handler = {
    get(target, prop, receiver) {
      // If the property already exists in our storage (signal or computed),
      // and if it’s a signal, unwrap it.
      if (prop in target) {
        const val = Reflect.get(target, prop, receiver);
        if (val && typeof val === "object" && "value" in val) {
          return val.value;
        }
        return val;
      }
      // Otherwise, if this property is defined as a computed function,
      // create a computed signal (using derivedBy) and store it in target.
      if (prop in computedFns) {
        const comp = derivedBy(receiver, computedFns[prop], receiver);
        // Save it (as a computed signal) so that subsequent gets can unwrap it.
        target[prop] = comp;
        return comp.value;
      }
      return undefined;
    },
    set(target, prop, newVal, receiver) {
      // If the property exists and is a signal, update its value.
      if (prop in target) {
        const curr = Reflect.get(target, prop, receiver);
        if (curr && typeof curr === "object" && "value" in curr) {
          curr.value = newVal;
          return true;
        }
      }
      // Otherwise, simply set the value (you might choose to wrap new values here).
      return Reflect.set(target, prop, newVal, receiver);
    },
  };
  const proxy = new Proxy(storage, handler);
  return proxy;
}

// --- Example usage:
const initial = {
  count: 2,
  double(self, root) {
    return self.count * 2;
  },
  quadruple(self, root) {
    return self.double * 2;
  },
};

const proxyCounter = simpleDeepProxy(initial);

console.log(
  "Counter@0:",
  proxyCounter.count,
  proxyCounter.double,
  proxyCounter.quadruple,
); // 2 4 8
proxyCounter.count++;
console.log(
  "Counter@1:",
  proxyCounter.count,
  proxyCounter.double,
  proxyCounter.quadruple,
); // 3 6 12
proxyCounter.count++;
console.log(
  "Counter@2:",
  proxyCounter.count,
  proxyCounter.double,
  proxyCounter.quadruple,
); // 4 8 16
