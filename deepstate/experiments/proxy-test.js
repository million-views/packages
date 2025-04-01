const cache = new WeakMap();
function deepProxy(obj, root, opts) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (cache.has(obj)) return cache.get(obj);
  let p; // declare proxy variable so inner functions can refer to it
  function serialize(o) {
    if (Array.isArray(o)) return o.map(serialize);
    if (o && typeof o === "object") {
      const res = {};
      for (const key of Reflect.ownKeys(o)) {
        // Get the property descriptor from the target object.
        const desc = Reflect.getOwnPropertyDescriptor(o, key);
        if (desc && "value" in desc) {
          let v = o[key]; // access property via proxy to trigger our get trap
          if (typeof v === "function") {
            if (opts && opts.callFunctions) {
              try {
                // Call the function with (self, root)
                v = v.call(o, o, root || p);
              } catch (e) {
                v = undefined;
              }
            } else continue; // skip function properties
          }
          res[key] = serialize(v);
        }
      }
      return res;
    }
    return o;
  }
  const handler = {
    get(t, k, rec) {
      if (k === "toJSON") {
        // Return a function so that calling proxiedData.toJSON() returns the serialized object.
        return () => serialize(root || p);
      }
      let v = Reflect.get(t, k, rec);
      if (
        typeof v === "function" && Object.prototype.hasOwnProperty.call(t, k)
      ) {
        return (...args) => v.call(rec, rec, root || p, ...args);
      }
      if (v && typeof v === "object") {
        return deepProxy(v, root || p, opts);
      }
      return v;
    },
  };
  p = new Proxy(obj, handler);
  cache.set(obj, p);
  return p;
}

function isEnabled(self, root) {
  // For demonstration, log and then compute based on requirements.
  // console.log(
  //   "[DEBUG in isEnabled] self =",
  //   self,
  //   "root.keys:",
  //   Object.keys(root),
  // );
  if (self.requirements.length === 0) return true;
  return self.requirements.every((req) => {
    const rT = root.tasks.find((t) => t.id === req.requiredTaskId);
    return rT && [req.requiredState, "completed"].includes(rT.state);
  });
}

const tasksData = {
  tasks: [
    { id: 1, name: "Task 1", state: "pending", requirements: [], isEnabled },
    {
      id: 2,
      name: "Task 2",
      state: "pending",
      requirements: [{ requiredTaskId: 1, requiredState: "ongoing" }],
      isEnabled,
    },
    {
      id: 3,
      name: "Task 3",
      state: "pending",
      requirements: [
        { requiredTaskId: 1, requiredState: "completed" },
        { requiredTaskId: 2, requiredState: "ongoing" },
      ],
      isEnabled,
    },
  ],
};

// // Create a proxy; default is to exclude function when serializing
// const proxiedData = deepProxy(tasksData, null, { callFunctions: false });
// console.log("Task 1 isEnabled:", proxiedData.tasks[0].isEnabled());
// // Calling toJSON() will skip isEnabled.
// console.log("toJSON output:", proxiedData.toJSON());

// Create a proxy that—when serialized via toJSON—will include function values by calling them.
const proxiedData2 = deepProxy(tasksData, null, { callFunctions: true });
console.log("Task 1 isEnabled:", proxiedData2.tasks[0].isEnabled());
// Calling toJSON() will now invoke isEnabled and include its return value in the output.
console.log("toJSON output:", proxiedData2.toJSON());
