# DeepState

`deepstate` is a **reactive state management utility** built on
**@preact/signals**, designed to manage deeply nested state objects, derived
computed properties, and optional schema enforcement (strict mode). It supports
both **local component state** and **global application state**, making it a
flexible choice for reactive data management.

---

## Purpose

- Provide **fine-grained reactivity** for deeply nested state objects.
- Allow **computed properties** that automatically derive values from reactive
  state.
- Support **optional schema enforcement** via strict/permissive modes.
- Expose **raw signals** for cases requiring lower-level access.
- Enable **action binding** to manage state transitions in a structured way.

---

## Features

| Feature                         | Description                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Reactive State**              | Nested objects automatically wrapped in signals for fine-grained reactivity.                        |
| **Computed Properties**         | Derived properties based on reactive state; recompute automatically when dependencies change.       |
| **Strict vs Permissive Modes**  | Control whether new properties can be added dynamically at runtime.                                 |
| **Shallow Object Support**      | Designate objects that should **not** be wrapped in signals, useful for external or static data.    |
| **Direct Signal Access**        | Raw signals accessible via `$prop`, allowing advanced reactive patterns.                            |
| **Action Binding**              | Attach a set of actions directly to a `deepstate` store for organized state transitions.            |
| **Serialization Support**       | `toJSON()` omits internal signals and computed properties, providing a clean snapshot of the state. |
| **Chained Computed Properties** | Computed properties can reference other computed properties, forming derived chains.                |

---

## Conventions & Constraints

| Rule                                                | Enforced |
| --------------------------------------------------- | -------- |
| **Initial state must be a non-null object**         | ✅       |
| **Functions cannot be stored in state**             | ✅       |
| **Computed properties must be defined up front**    | ✅       |
| **Computed properties cannot be added dynamically** | ✅       |
| **Shallow objects do not trigger reactivity**       | ✅       |
| **Direct signals are exposed via `$prop`**          | ✅       |
| **`$` properties cannot be directly assigned**      | ✅       |
| **`toJSON()` is immutable and protected**           | ✅       |

---

## Usage Modes

`deepstate` supports **both local and global state patterns**:

- **Local Component State**\
  Create a `deepstate` instance inside a component and bind component-specific
  actions.

- **Global Application State**\
  Create a `deepstate` store at the top level, export it, and import it across
  multiple modules.

### Example

```javascript
// Local component state
const { state } = reify({ count: 0 }, { double: (state) => state.count * 2 });

// Global state
export const globalStore = reify({ count: 0 }, {
  double: (state) => state.count * 2,
});
```

---

## Suitable Use Cases

✅ **Local component state management** (especially in Astro islands).\
✅ **Global store for cross-module state sharing.**\
✅ **Forms, nested settings, hierarchical data models.**\
✅ **Scenarios needing derived or computed properties.**\
✅ **Cases requiring optional schema enforcement (strict mode).**

---

## Out of Scope

- ❌ **No built-in persistence.**
- ❌ **No built-in multi-instance synchronization (e.g., across tabs).**
- ❌ **No direct support for async computed properties.** (All computed
  properties must be synchronous.)
- ❌ **No circular reference detection.** (User responsibility.)

---

## Fluent API Roadmap

The `reify()` function is designed to be extensible. Planned future methods
include:

| Method      | Description                                       |
| ----------- | ------------------------------------------------- |
| `persist()` | Save state to localStorage or IndexedDB.          |
| `sync()`    | Synchronize state across browser tabs or windows. |
| `fetch()`   | Populate state from an API endpoint.              |

---

## Summary

`deepstate` is a **reactive, deeply nested state management utility** for
**Preact Signals**. It can be used for:

- **Local component state (recommended for isolated islands).**
- **Global application state (recommended for shared data stores).**

With built-in **fine-grained reactivity**, **computed properties**, and optional
**schema enforcement**, `deepstate` balances **flexibility** and **structure**
in your reactive data model.

---

## Example

```javascript
import { reify, shallow } from "@m5nv/deepstate";

const { state } = reify(
  {
    user: {
      name: "Frodo",
      items: shallow([{ id: 1, name: "Ring" }]),
    },
  },
  {
    greeting: (state) => "Hello, " + state.user.name,
  },
  false, // strict mode
);

console.log(state.greeting); // "Hello, Frodo"
state.user.name = "Sam";
console.log(state.greeting); // "Hello, Sam"
```

---
## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.
---
