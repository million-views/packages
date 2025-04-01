// --- Updated simpleDeepProxy with Escape Hatch ---

import { batch, computed, signal } from "@preact/signals-core";

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");
export function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

// derivedBy remains the same as the benchmark version
function derivedBy(self, fn, root, dbi) {
  const actualRoot = root; // Capture root
  const computedSignal = computed(() => {
    // Check if root argument expected based on function definition
    if (!actualRoot && fn.length > 1) {
      dbi.error(
        "[derivedBy] Error: Root proxy not available for computed function:",
        fn.name,
      );
      throw new Error(
        `Root proxy not available for computed function ${
          fn.name || "anonymous"
        }`,
      );
    }
    // Only pass root if the function expects it (check arity)
    const result = fn.length > 1 ? fn(self, actualRoot) : fn(self);
    return result;
  });
  // Tag the signal for caching check later (used in proxy get)
  computedSignal._fn = fn;
  return computedSignal;
}

// Added escapeHatch parameter with default '$'
export function simpleDeepProxy(initial, debug = false, escapeHatch = "$") {
  const dbi =
    (typeof debug === "object" && debug !== null &&
        typeof debug.log === "function")
      ? debug
      : (debug === true
        ? console
        : { log: () => {}, error: (console.error || console.log) });

  if (
    initial === null || typeof initial !== "object" || Array.isArray(initial)
  ) {
    throw new Error("Top-level must be a plain object.");
  }
  let root = null;
  const isSignal = (val) =>
    val && typeof val === "object" && "value" in val &&
    typeof val.peek === "function";

  function _deepProxy(o) {
    const computedFns = {};
    let storage;
    let proxy;

    // --- Array/Object processing logic remains the same ---
    if (Array.isArray(o)) {
      storage = [];
      storage = o.map((item) => {
        const itemIsObject = item && typeof item === "object";
        const itemIsSignalInstance = isSignal(item);
        const itemIsShallow = itemIsObject && item[IS_SHALLOW];
        if (itemIsObject && !itemIsSignalInstance && !itemIsShallow) {
          return _deepProxy(item);
        } else if (itemIsShallow) {
          return item;
        } else {
          return itemIsSignalInstance ? item : signal(item);
        }
      });
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
            storage[key] = _deepProxy(val);
          } else if (valIsShallow) {
            storage[key] = val;
          } else {
            storage[key] = valIsSignalInstance ? val : signal(val);
          }
        }
      }
    }

    // --- Handler with modified 'get' for escape hatch ---
    const handler = {
      get(target, prop, receiver) {
        // --- Escape Hatch Logic ---
        // Check if escapeHatch is a usable string and prop matches
        if (
          typeof escapeHatch === "string" && escapeHatch.length > 0 &&
          typeof prop === "string" && prop.startsWith(escapeHatch)
        ) {
          const actualProp = prop.substring(escapeHatch.length);
          dbi.log(
            `[Get EscapeHatch] Detected for "${prop}", actualProp: "${actualProp}"`,
          );

          // Check storage first (could contain signal, computed, nested proxy, raw shallow)
          if (actualProp in target) {
            const underlyingVal = Reflect.get(target, actualProp); // Get whatever is stored
            dbi.log(
              `[Get EscapeHatch] Returning underlying value from target for "${actualProp}":`,
              underlyingVal,
            );
            // Return the signal, computed, proxy, or raw value itself WITHOUT unwrapping
            return underlyingVal;
          }

          // Check computed functions that might not be materialized yet
          if (actualProp in computedFns) {
            dbi.log(
              `[Get EscapeHatch] Found computed function for "${actualProp}"`,
            );
            // Ensure computed signal exists on target (materialize if needed for caching/consistency)
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
                dbi,
              );
              target[actualProp] = computedSignal; // Store it back on target
            }
            dbi.log(
              `[Get EscapeHatch] Returning underlying computed signal object for "${actualProp}":`,
              computedSignal,
            );
            // Return the computed signal object itself
            return computedSignal;
          }

          dbi.log(
            `[Get EscapeHatch] Underlying property "${actualProp}" not found for "${prop}".`,
          );
          return undefined; // Property doesn't exist even without the prefix
        }

        // --- Original Get Logic (if not escape hatch) ---
        dbi.log(`[Get] Request for prop: "${String(prop)}" on target:`, target);

        // 1. Handle direct properties of the storage (signals, nested proxies, raw shallow values)
        if (prop in target) {
          const val = Reflect.get(target, prop, receiver);
          dbi.log(
            `[Get] Found prop "${String(prop)}" in target. Raw value:`,
            val,
          );
          if (isSignal(val)) {
            dbi.log(
              `[Get] Unwrapping signal for prop "${String(prop)}" ->`,
              val.value,
            );
            return val.value; // UNWRAP value for normal access
          }
          return val; // Return nested proxy or raw shallow value directly
        }

        // 2. Handle computed properties
        if (prop in computedFns) {
          dbi.log(
            `[Get] Prop "${
              String(prop)
            }" is a computed function. Accessing/Creating computed signal.`,
          );
          const cachedComputed = Reflect.get(target, prop);
          if (
            isSignal(cachedComputed) && cachedComputed._fn === computedFns[prop]
          ) {
            dbi.log(
              `[Get] Returning value from cached computed signal for "${
                String(prop)
              }"`,
            );
            return cachedComputed.value; // UNWRAP value for normal access
          } else {
            dbi.log(`[Get] Creating new computed signal for "${String(prop)}"`);
            const comp = derivedBy(receiver, computedFns[prop], root, dbi);
            target[prop] = comp; // Store computed signal itself for caching
            return comp.value; // UNWRAP value for normal access
          }
        }

        // 3. Handle Array methods specifically for Array proxies
        if (
          Array.isArray(target) && typeof prop === "string" &&
          prop in Array.prototype
        ) {
          const method = Array.prototype[prop];
          if (typeof method === "function") {
            dbi.log(`[Get] Returning bound array method for: "${prop}"`);
            return method.bind(receiver);
          }
        }

        // Explicit array index handling was removed in benchmark version, relying on `prop in target`.

        dbi.log(`[Get] Prop "${String(prop)}" not found; returning undefined.`);
        return undefined;
      }, // --- End get handler ---

      // --- set, has, deleteProperty handlers remain the same as benchmark version ---
      set(target, prop, newVal, receiver) {
        dbi.log(`[Set] Request to set prop "${String(prop)}" to:`, newVal);
        const currentVal = Reflect.get(target, prop);
        if (isSignal(currentVal)) {
          dbi.log(`[Set] Updating signal value for "${String(prop)}"`);
          currentVal.value = newVal;
          return true;
        } else {
          dbi.log(`[Set] Setting prop "${String(prop)}" directly on target.`);
          return Reflect.set(target, prop, newVal);
        }
      },
      has(target, prop) {
        // Note: Should 'has' check for escape hatch versions? e.g., should `'$prop' in proxy` be true?
        // Current logic doesn't account for escape hatch, only checks target/computedFns
        // To be fully consistent, 'has' could also check for '$'+prop if 'prop' exists.
        // Let's keep it simple for now:
        dbi.log(`[Has] Request for prop: "${String(prop)}"`);
        return (prop in target) || (prop in computedFns);
      },
      deleteProperty(target, prop) {
        dbi.log(`[Delete] Request for prop: "${String(prop)}"`);
        // Similar to 'has', doesn't currently account for deleting '$prop' vs 'prop' explicitly.
        // Simplest is to delete the underlying prop. User shouldn't delete '$prop'.
        if (prop in computedFns) delete computedFns[prop]; // Remove computed fn if exists
        return Reflect.deleteProperty(target, prop); // Delete from storage
      },
    }; // End handler

    proxy = new Proxy(storage, handler);
    return proxy;
  } // End _deepProxy

  // --- Initialization ---
  const finalProxy = _deepProxy(initial);
  root = finalProxy; // Set root after creation
  dbi.log("[simpleDeepProxy] Final root proxy established.");
  return root;
}

// --- shallow function remains the same ---
// export function shallow(obj) { ... }
// const IS_SHALLOW = Symbol(...);
