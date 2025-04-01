import { computed, signal } from "@preact/signals-core";

const counter = {
  count: signal(0),
  double: computed(() => counter.count.value * 2),
};

const handler = {
  get(target, prop, receiver) {
    const val = Reflect.get(target, prop, receiver);
    // If it's a signal (or computed signal), return its .value.
    if (val && typeof val === "object" && "value" in val) {
      return val.value;
    }
    return val;
  },
  set(target, prop, newVal, receiver) {
    const curr = Reflect.get(target, prop, receiver);
    // If the current property is a signal, update its .value.
    if (curr && typeof curr === "object" && "value" in curr) {
      curr.value = newVal;
      return true;
    }
    return Reflect.set(target, prop, newVal, receiver);
  },
};

const proxyCounter = new Proxy(counter, handler);

console.log("Counter@0:", proxyCounter.count, proxyCounter.double); // 0 0
proxyCounter.count++;
console.log("Counter@1:", proxyCounter.count, proxyCounter.double); // 1 2
proxyCounter.count++;
console.log("Counter@2:", proxyCounter.count, proxyCounter.double); // 2 4
