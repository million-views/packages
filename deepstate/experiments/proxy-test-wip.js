function deepProxy(obj, opts = {}) {
  const cache = new WeakMap();

  let root; // internal top‑level proxy
  function _deepProxy(o) {
    if (typeof o !== "object" || o === null) return o;
    if (cache.has(o)) return cache.get(o);
    let p;
    // No transformation here; we simply wrap the object.
    const handler = {
      get(t, k, rec) {
        if (k === "toJSON") {
          // Serialize using the top‑level proxy (root)
          return () => serialize(root);
        }
        let v = Reflect.get(t, k, rec);
        if (
          typeof v === "function" && Object.prototype.hasOwnProperty.call(t, k)
        ) {
          // Return a version bound with (self, root, ...args)
          return (...args) => v.call(rec, rec, root, ...args);
        }
        if (v && typeof v === "object") {
          return _deepProxy(v);
        }
        return v;
      },
      set(t, k, newVal, rec) {
        return Reflect.set(t, k, newVal, rec);
      },
    };
    function serialize(o) {
      if (Array.isArray(o)) return o.map(serialize);
      if (o && typeof o === "object") {
        const res = {};
        for (const key of Reflect.ownKeys(o)) {
          let v = o[key];
          if (typeof v === "function") {
            if (opts.callFunctions) {
              try {
                v = v.call(o, o, root);
              } catch (e) {
                v = undefined;
              }
            } else continue;
          }
          res[key] = serialize(v);
        }
        return res;
      }
      return o;
    }
    p = new Proxy(o, handler);
    cache.set(o, p);
    if (!root) root = p;
    return p;
  }
  return _deepProxy(obj);
}

//------------------------------------------------------------------------------
// function isEnabled(self, root) {
//   // For demonstration, log and then compute based on requirements.
//   // console.log(
//   //   "[DEBUG in isEnabled] self =",
//   //   self,
//   //   "root.keys:",
//   //   Object.keys(root),
//   // );

//   if (self.requirements.length === 0) return true;
//   return self.requirements.every((req) => {
//     const rT = root.tasks.find((t) => t.id === req.requiredTaskId);
//     return rT && [req.requiredState, "completed"].includes(rT.state);
//   });
// }

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
    // Here we expect t.id and t.state to be plain values.
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

// Create a proxy that (when serialized) will skip function properties.
const proxiedData = deepProxy(tasksData, { callFunctions: false });
console.log("Task 1 isEnabled:", proxiedData.tasks[0].isEnabled());
// Calling toJSON() will skip functions.
console.log("toJSON output:", proxiedData.toJSON());

// Create a proxy that (when serialized) calls function properties.
const proxiedData2 = deepProxy(tasksData, { callFunctions: true });
console.log("toJSON output:", proxiedData2.toJSON());
