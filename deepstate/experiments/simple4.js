import { computed, signal } from "@preact/signals-core";

function derivedBy(self, fn, root) {
  return computed(() => fn(self, root));
}

export function simpleDeepProxy(initial) {
  const computedFns = {};
  let storage = Array.isArray(initial) ? [] : {};
  // One pass over the initial object:
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
      if (prop in target) {
        const val = Reflect.get(target, prop, receiver);
        if (val && typeof val === "object" && "value" in val) {
          return val.value;
        }
        return val;
      }
      if (prop in computedFns) {
        const comp = derivedBy(receiver, computedFns[prop], receiver);
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

// --- Dependency Tracking Example ---
const state = {
  greeting: "Hello",
  name: "World",
  message(self, root) {
    // This computed property depends on greeting and name.
    return `${self.greeting}, ${self.name}!`;
  },
};

const proxyState = simpleDeepProxy(state);

console.log("Initial message:", proxyState.message); // "Hello, World!"
proxyState.greeting = "Hi";
console.log("After greeting update:", proxyState.message); // "Hi, World!"
proxyState.name = "Alice";
console.log("After name update:", proxyState.message); // "Hi, Alice!"
