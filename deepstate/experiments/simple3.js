import { computed, signal } from "@preact/signals-core";

function derivedBy(self, fn, root) {
  return computed(() => fn(self, root));
}

export function simpleDeepProxy(initial) {
  const computedFns = {};
  let storage;
  if (Array.isArray(initial)) {
    storage = []; // Use a native array to preserve length, etc.
  } else {
    storage = {};
  }
  // One pass: for each key, if it's a function then store for computed, otherwise wrap (for arrays, only wrap numeric keys)
  for (const key in initial) {
    const val = initial[key];
    if (typeof val === "function") {
      computedFns[key] = val;
    } else {
      if (Array.isArray(initial) && /^\d+$/.test(key)) {
        storage[key] = signal(val);
      } else if (Array.isArray(initial)) {
        // For non-numeric properties on arrays (like our inline computed "sum"), just copy over.
        storage[key] = val;
      } else {
        storage[key] = signal(val);
      }
    }
  }
  const handler = {
    get(target, prop, receiver) {
      // If property exists in target, return it (unwrapping if it's a signal)
      if (prop in target) {
        const val = Reflect.get(target, prop, receiver);
        // If it is a signal, return its .value
        if (val && typeof val === "object" && "value" in val) {
          return val.value;
        }
        return val;
      }
      // If a computed function is defined, create a computed signal and store it
      if (prop in computedFns) {
        const comp = derivedBy(receiver, computedFns[prop], receiver);
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
      return Reflect.set(target, prop, newVal, receiver);
    },
  };
  return new Proxy(storage, handler);
}

// --- Example usage for an array ---

const initialArray = [1, 2, 3];
initialArray.sum = function (self, root) {
  let total = 0;
  // self is the proxyArray. Its "length" property is natively inherited from the underlying array.
  for (let i = 0; i < self.length; i++) {
    total += self[i];
  }
  return total;
};

const proxyArray = simpleDeepProxy(initialArray);

console.log("Array:", proxyArray[0], proxyArray[1], proxyArray[2]); // Expected: 1, 2, 3
console.log("Length:", proxyArray.length); // Expected: 3
console.log("Sum:", proxyArray.sum); // Expected: 6

// Update an element:
proxyArray[1] = 5;
console.log("Modified Array:", proxyArray[0], proxyArray[1], proxyArray[2]); // Expected: 1, 5, 3
console.log("New Sum:", proxyArray.sum); // Expected: 9
