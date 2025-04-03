# DeepState (@m5nv/deepstate)

**Signal-based Reactive State Management Made Intuitive**

## 👋 Introduction

DeepState is a state management library powered by Signals & Proxies. It uses
modern JavaScript features (ES6 Proxies) and a Signal-based core (specifically
`@preact/signals-core` or compatible) to enable automatic **deep reactivity**
throughout your state objects and arrays. This allows you to manage complex
state naturally, writing updates like standard JavaScript mutations while
benefiting from fine-grained reactivity powered by Signals.

## 🤔 Why DeepState?

- **Intuitive DX:** Write state updates naturally (`state.user.name = 'Bob'`,
  `state.items.push(...)`). No complex reducers or manual spreading required for
  common cases.
- **Deeply Reactive:** Changes anywhere in your state tree trigger updates
  precisely where needed, powered by Signals.
- **Simplified Derived State:** Define computed values directly within your
  state object as simple functions
  (`fullName(self) { return self.firstName + ' ' + self.lastName }`). DeepState
  makes them reactive automatically.
- **Minimal Boilerplate:** Get started quickly with the simple `reify` API.
- **Framework Agnostic Core:** Use it with React, Preact, Svelte, or vanilla JS
  via framework-specific adapters or directly with Signals effects.
- **Performant:** Leverages the efficiency of Signals for fine-grained updates,
  avoiding unnecessary computations or renders.

## ✨ Core Concepts

- **Deep Reactivity:** Modify any part of your state object (even deeply nested
  properties or array elements), and DeepState ensures anything depending on
  that data updates automatically.
- **Signal-Powered:** Under the hood, your state values are stored in tiny
  reactive units called Signals. DeepState manages these for you.
- **Mutational Style:** You interact with state using familiar assignments
  (`state.prop = ...`) and array methods (`state.list.push(...)`). Proxies make
  this work reactively.
- **Inline Computeds:** Just write a function as a property in your initial
  state, and it becomes a reactive computed value that automatically updates
  when its dependencies change. It even gets handy `self` and `root` arguments!
- **`Escape Hatch ($):`** Need direct access to the underlying signal for
  framework integration or advanced patterns? Use the configured prefix (default
  `$`, e.g., `state.$prop`). See the dedicated section below for details on its
  behavior, especially in SSR.

## 🚀 Getting Started

**1. Installation:**

Install via npm:

```bash
npm install @m5nv/deepstate
# or yarn add @m5nv/deepstate
# or pnpm add @m5nv/deepstate
```

> **Note**: `@m5nv/deepstate` declares `@preact/signals-*` as a peer dependency.
> You are responsible for installing the correct peer dependency to go with the
> import variant you plan on using.

### Import Variants

DeepState supports use with different frameworks by utilizing peer dependencies
and variant import paths. These entry points also configure appropriate defaults
(like escape hatch character or SSR behavior). The import paths and the required
peer dependency are listed below:

1. **For Preact:**
   ```javascript
   import { reify, shallow } from "@m5nv/deepstate/preact"; // Use explicit /preact entry
   ```
   _Peer dependency:_ `@preact/signals`

2. **For React:**
   ```javascript
   import { reify, shallow } from "@m5nv/deepstate/react";
   ```
   _Peer dependency:_ `@preact/signals-react`\
   _(Note: React examples assume the recommended Babel transform
   `@preact/signals-react-transform` is configured for optimal DX. See React
   Integration section.)_

3. **For Core / Node.js / Vanilla JS:**
   ```javascript
   import { reify, shallow } from "@m5nv/deepstate/core";
   ```
   _Peer dependency:_ `@preact/signals-core`

4. **For Svelte:**
   ```javascript
   import { reify, shallow } from "@m5nv/deepstate/svelte";
   ```
   _Peer dependency:_ `@preact/signals-core`\
   _(Note: This entry point automatically configures the escape hatch prefix to
   `_` (underscore) instead of `$` to avoid conflicts with Svelte's syntax.)_

**2. Basic Usage:**

```javascript
import { reify } from "@m5nv/deepstate/core"; // Use '/core' for vanilla JS/Node
import { effect } from "@preact/signals-core"; // For demonstrating reactivity

// Define initial state - notice the inline computed!
const initialState = {
  user: {
    firstName: "Jane",
    lastName: "Doe",
  },
  todos: ["Learn Signals", "Try DeepState"],
  // Computed property defined inline
  fullName(self) {
    // 'self' refers to the root state here as it's a root property.
    // Use 'this' or 'self' (they refer to the state proxy).
    // For computeds *inside* nested objects, 'self' refers to that nested level
    // and a second argument 'root' refers to the top-level state.
    return `${this.user.firstName} ${this.user.lastName}`;
  },
  todoCount(self) {
    return self.todos.length; // 'self' is the root state here
  },
};

// Create the reactive store
const store = reify(initialState);
const state = store.state; // Get the reactive state proxy

// --- Reading State ---
console.log(state.user.firstName); // Output: Jane
console.log(state.todos[0]); // Output: Learn Signals
console.log(state.fullName); // Output: Jane Doe (Computed automatically)
console.log(state.todoCount); // Output: 2

// --- Writing State (Direct Mutation) ---
state.user.lastName = "Smith";
state.todos.push("Build Awesome App"); // Array methods trigger reactivity

console.log(state.fullName); // Output: Jane Smith (Computed updated!)
console.log(state.todoCount); // Output: 3

// --- Reactivity with Effects (Example) ---
effect(() => {
  // This effect automatically tracks state.fullName
  console.log(`User's full name is now: ${state.fullName}`);
});
// Output: User's full name is now: Jane Smith

state.user.firstName = "John";
// Output: User's full name is now: John Smith
```

## Key Features Guide

### Defining State (`reify`)

You create a store using `reify`, passing your initial state object. You can
optionally pass a second argument with options like `permissive` mode or initial
`actions`.

```javascript
import { reify } from "@m5nv/deepstate/core"; // Or /react, /svelte

// Simple store
const store1 = reify({ counter: 0 });

// Store with options
const store2 = reify(
  { settings: { theme: "dark" } },
  { permissive: true, actions: { toggleTheme: (state) => {/*...*/} } },
);

const state = store1.state;
```

### Reading State

Access properties directly on the `state` proxy. DeepState automatically unwraps
the underlying signal values for you.

```javascript
console.log(state.counter); // Read primitive
console.log(state.settings.theme); // Read nested property
console.log(state.fullName); // Read computed property
```

### Writing State

Mutate properties directly using standard JavaScript assignments or array
methods. DeepState's proxy intercepts these changes and updates the underlying
signals, triggering reactivity.

```javascript
state.counter++;
state.settings.theme = "light";
state.todos.push("new item"); // Use standard array methods
state.items.splice(0, 1); // They work too!
```

> **Important:** Replacing entire nested objects or arrays directly
> (`state.settings = { theme: 'light' }`) is disallowed by default to prevent
> common reactivity issues. Mutate nested properties
> (`state.settings.theme = 'light'`) or use actions instead. See "Strict vs
> Permissive Mode" below.

### Computed Properties

Define functions directly in your initial state object. They automatically
become reactive computed values, re-evaluating only when their dependencies
change.

```javascript
const store = reify({
  count: 5,
  // Automatically becomes a computed property
  double(self) { // 'self' is the state proxy here
    return self.count * 2;
  },
  nested: {
    value: 10,
    // Nested computed gets 'self' referring to 'nested' object
    // and 'root' referring to the top-level state
    valueTimesCount(self, root) {
      return self.value * root.count;
    },
  },
});

console.log(store.state.double); // Output: 10
console.log(store.state.nested.valueTimesCount); // Output: 50 (10 * 5)

store.state.count = 6; // Change a dependency
console.log(store.state.double); // Output: 12 (Updated automatically)
console.log(store.state.nested.valueTimesCount); // Output: 60 (Updated automatically)
```

### Actions (`attach`, `options.actions`)

For more complex or reusable logic, define actions. Actions receive the `state`
proxy as the first argument. Updates within actions are batched automatically
for efficiency (in SPA mode).

```javascript
// 1. Define during reify
const store1 = reify(
  { count: 0 },
  { // Options object
    actions: {
      increment(state) {
        state.count++;
      },
      add(state, amount) {
        state.count += amount;
      },
      async loadUser(state) { // Async actions work too!
        state.user = undefined;
        state.loading = true;
        try {
          // const user = await fetchUser(); // Example async operation
          state.user = { name: "Fetched User" }; // Update state upon completion
        } catch (e) {
          state.error = e;
        } finally {
          state.loading = false;
        }
      },
    },
  },
);
store1.actions.add(5); // Call action
console.log(store1.state.count); // Output: 5

// 2. Attach later using store.attach()
const store2 = reify({ value: "" });
store2.attach({
  setValue(state, newValue) {
    state.value = newValue;
  },
});
store2.actions.setValue("hello");
console.log(store2.state.value); // Output: hello
```

### Escape Hatch (`$`)

You can access the underlying Signal object directly using a prefix (default
`$`, e.g., `state.$prop`). This is useful for framework integrations or advanced
use cases where you need the signal instance itself rather than its value. The
escape hatch character can be configured via library options or
framework-specific entry points (e.g., Svelte uses `_`).

**Default Behavior:** Typically returns the signal object itself in both
client-side and server-side environments (when using `/core` or `/svelte` entry
points).

**Note for React SSR Users:** The `/react` entry point enables an option by
default (`enableReactSsrEscapeHatchPatch: true`) where `$prop` returns the
primitive value during SSR instead of the signal object. While this allows
`{$prop}` syntax on the server (similar to Svelte stores), the standard and most
robust approach for rendering values in React SSR, especially when using the
recommended Babel transform, is direct proxy access like `{state.prop}`.

> **Limitation:** Assigning objects/arrays directly via the signal's `.value`
> setter (e.g., `signal.value = newObject`) bypasses DeepState's proxy wrapping
> for the _new_ object/array. Its internal structure won't be deeply reactive.
> Use standard proxy assignment (`state.prop = newObject`) to ensure continued
> deep reactivity.

### Snapshots (`toJSON`, `snapshot`)

Get plain JavaScript object representations of your state, useful for debugging,
logging, or serialization.

- **`store.toJSON()`**: Returns a serializable snapshot suitable for
  `JSON.stringify` or SSR hydration. **Excludes computed properties and
  functions.**
  ```javascript
  const store = reify({ count: 1, double: (s) => s.count * 2 });
  console.log(JSON.stringify(store)); // Output: {"count":1}
  // Or console.log(store.toJSON()); // Output: { count: 1 }
  ```
- **`store.snapshot()`**: Creates a snapshot including the **resolved values**
  of computed properties at that moment. Useful for debugging or testing complex
  state.
  ```javascript
  console.log(store.snapshot()); // Output: { count: 1, double: 2 }
  ```

### Shallow Objects (`shallow`)

Prevent deep reactivity for specific objects using the `shallow` helper. Only
the reference to the shallow object will be reactive (i.e., wrapped in a
signal), not its internal contents. Useful for performance-sensitive large
objects, non-reactive data sources, or integrating external classes.

```javascript
import { reify, shallow } from "@m5nv/deepstate/core";

const largeExternalData = shallow({/* ... potentially huge object ... */});
const store = reify({ external: largeExternalData });

// Replacing the reference IS reactive
store.state.external = shallow({/* new data */});

// Mutations *within* the shallow object are NOT tracked by DeepState
// (though the object itself can still be mutated directly)
largeExternalData.someProperty = "new value"; // This won't trigger DeepState effects/computeds
```

### Strict vs Permissive Mode (`options.permissive`)

Control whether the shape (properties) of your state objects can change after
creation using the `permissive` option in `reify`.

- **`Strict Mode (Default - permissive: false):`** Prevents adding new
  properties or deleting existing properties on objects after initialization.
  This helps catch typos, enforce a defined state structure, and improve
  predictability. Deleting array elements by index (`delete state.items[0]`) or
  using array mutation methods (`push`, `splice` etc.) is still allowed.
  ```javascript
  const store = reify({ user: { name: "A" } }, { permissive: false });
  // state.user.age = 30; // Throws TypeError: Cannot add new property...
  // delete state.user.name; // Throws TypeError: Cannot delete existing property...
  ```
- **`Permissive Mode (permissive: true):`** Allows dynamically adding new
  properties or deleting existing properties on objects. Functions added this
  way automatically become new computed properties. Useful for state structures
  that need to evolve, like caches or dynamic forms.
  ```javascript
  const store = reify({ user: { name: "A" } }, { permissive: true });
  state.user.age = 30; // OK - adds reactive 'age' property
  state.user.upperName = (self) => self.name.toUpperCase(); // OK - adds computed
  console.log(state.user.upperName); // Output: A
  delete state.user.name; // OK
  ```

### Versioning (`__version`)

DeepState includes non-enumerable `__version` signals for advanced use cases,
primarily framework integration or coarse-grained change detection:

- `store.__version`: A signal that increments after every _attached action_
  completes its batch. Useful for triggering updates in frameworks that don't
  automatically subscribe deeply (see Svelte adapter example).
- `state.myArray.__version`: A signal associated with each proxied array that
  increments when the array's structure changes (elements added/removed/length
  changed via proxy methods or index assignment/deletion). Useful for optimizing
  list rendering updates by depending on this signal.

These are typically used internally by framework adapters or custom effect
logic, not usually needed in standard application code.

### Server-Side Rendering (SSR)

DeepState is designed to work in SSR environments.

- **Automatic Detection:** Detects Node.js environments without `window` as SSR
  (override via `DEEPSTATE_MODE=SSR`).
- **Signal Mocks:** Uses non-reactive `SSRSignal`, `SSRComputed` mocks in SSR.
  They hold state and compute values on access but don't track dependencies for
  reactivity.
- **Computed Evaluation:** Computeds run synchronously on value access during
  SSR.
- **Serialization:** Use `store.toJSON()` for serializable state (excludes
  computeds) to send to the client.
- **Hydration:** Initialize the client store using `reify` with the state
  received from the server.
- **Escape Hatch Behavior:** See the Escape Hatch section above for details on
  default vs. React SSR behavior.
- **Recommendation for React SSR:** With the recommended Babel transform set up
  (see React section), render values using standard proxy access
  (`{state.prop}`). This pattern works reliably for SSR/hydration and is
  automatically made reactive by the transform. If direct access to the signal
  object is needed (e.g., for effects), use the escape hatch (`$prop`); if
  rendering its value explicitly is required for some reason, use
  `{$prop.value}`.

## Framework Integration Examples

### React

Use `@m5nv/deepstate/react` which depends on `@preact/signals-react`.

**Recommended Setup:** It's strongly recommended to configure the Babel
transform plugin **`@preact/signals-react-transform`** in your build process
(Vite/Babel config). This allows components to automatically become reactive to
signals accessed during render without needing explicit hooks, providing the
optimal developer experience.

- **Example Vite+React configuration:**
  [deepstate/with-vite-plain](https://github.com/million-views/packages/tree/main/deepstate/with-vite-plain)
- **Example React Router (SSR) configuration:**
  [deepstate/with-react-router](https://github.com/million-views/packages/tree/main/deepstate/with-react-router)

_(Consult the `@vitejs/plugin-react` documentation for guidance on integrating
Babel plugins if you encounter issues.)_

**Example Component (Assuming Babel Transform is Active):**

```javascript
import React, { useState } from "react";
import { reify } from "@m5nv/deepstate/react";

// Assume store is created SSR-safely if needed (e.g., in context or useState)
const createStore = () =>
  reify(
    { count: 0, double: (s) => s.count * 2 },
    { actions: { increment: (state) => state.count++ } },
  );

function Counter() {
  // Initialize store (use context or useState for SSR safety)
  const [store] = useState(createStore);

  return (
    <div>
      {/* Access state directly - this becomes reactive */}
      <p>
        {store.state.count} * 2 = {store.state.double}
      </p>
      {/* Call action */}
      <button onClick={store.actions.increment}>Click me</button>
    </div>
  );
}
```

_(If you choose _not_ to use the Babel transform, you will need to manually
import and call the `useSignals` hook from `@preact/signals-react/runtime`
within each component that accesses signal-based state)._

### Svelte

Use `@m5nv/deepstate/svelte` (depends on `@preact/signals-core`). This entry
point automatically sets the escape hatch to `_` to avoid conflicts with
Svelte's `$`.

**Basic Usage (Reading State):**

Svelte's compiler often handles direct reads correctly.

```html
<script>
  import { reify } from "@m5nv/deepstate/svelte";

  // Note: For SSR, initialize store appropriately within component instance/context
  const { state } = reify({ message: "Hello Svelte!" });

  // Example mutation
  setTimeout(() => {
    state.message = "Updated!"; // Triggers Svelte update if {state.message} is used
  }, 2000);
</script>

<h1>{state.message}</h1>
```

**Using Actions / `__version` Adapter:**

For updates triggered by DeepState actions (which are batched) or complex
mutations Svelte might not track automatically, you can bridge DeepState's
`store.__version` signal to a writable Svelte store to ensure reactivity.

```html
<script>
  import { writable } from "svelte/store";
  import { effect } from "@preact/signals-core";
  import { reify } from "@m5nv/deepstate/svelte"; // Uses '_' escape hatch

  // --- Simple Adapter ---
  function deepstateToSvelteStore(deepstateStore) {
    // Use ds.state directly for reading its reactive properties
    const svelteStore = writable(deepstateStore.state); // Initial value
    // Effect runs when ds.__version changes
    const stopEffect = effect(() => {
      deepstateStore.__version.value; // Depend on the version signal
      // Trigger Svelte update by setting the store value again
      svelteStore.set(deepstateStore.state);
    });
    // Return Svelte store interface + actions etc.
    // Remember to cleanup effect on component destroy if needed!
    return {
      subscribe: svelteStore.subscribe,
      actions: deepstateStore.actions,
      state: deepstateStore.state, // Direct access still possible
      toJSON: deepstateStore.toJSON,
      // cleanup: stopEffect // Optional: expose cleanup
    };
  }
  // --------------------

  // Assume counterDs initialized SSR-safely if needed
  const counterDs = reify({ count: 0 }, {
    actions: { increment: (state) => state.count++ },
  });

  const counterStore = deepstateToSvelteStore(counterDs);

  // $: console.log($counterStore.count); // Use Svelte store subscription
</script>

<h1>Count: {$counterStore.count}</h1>
<button on:click="{counterStore.actions.increment}">Increment</button>

<p>Signal Value: {counterStore.state._count.value}</p>
```

### Core / Vanilla JS

Use `@m5nv/deepstate/core` and `@preact/signals-core`. Use `effect` to react to
changes.

```javascript
import { reify } from "@m5nv/deepstate/core";
import { batch, effect } from "@preact/signals-core";

const store = reify({ x: 1, y: 2, sum: (s) => s.x + s.y });
const { state } = store;

// Create an effect that depends on state.sum
const stopEffect = effect(() => {
  console.log(`Sum is: ${state.sum}`);
});
// Output: Sum is: 3

// Batch multiple updates to trigger the effect only once
batch(() => {
  state.x = 5;
  state.y = 10;
});
// Output: Sum is: 15 (effect runs only once due to batching)

// Clean up effect when no longer needed
// stopEffect();
```

## API Reference

### `createDeepStateAPIv2(dependencies?, options?)`

**(Advanced API)** Factory function used internally by entry points (`/core`,
`/react`, `/svelte`) to create the `reify` and `shallow` functions with specific
configurations. Typically not called directly by application code.

- **`dependencies?`** (Object, optional): Allows injecting signal primitive
  implementations (e.g., `{ signal, computed, batch, untracked }`). Defaults to
  primitives similar to `@preact/signals-core`.
- **`options?`** (Object, optional): Configures behavior:
  - `debug?` (Boolean | Object, default: `false`): Enables internal logging.
  - `escapeHatch?` (String, default: `'$'`): Sets the prefix for escape hatch
    access.
  - `enableReactSsrEscapeHatchPatch?` (Boolean, default: `false`): Modifies
    escape hatch behavior during SSR (see SSR section).
- **Returns:** `{ shallow, reify }` configured with the provided dependencies
  and options.

### `reify(initialState, options?)`

Creates and initializes your reactive state store. This is the main function
you'll use.

- **`initialState`** (Object): A plain JavaScript object defining the initial
  structure, data, and computed properties (as inline functions) for your state.
  Top-level arrays are not allowed.
- **`options?`** (Object, optional):
  - `permissive?` (Boolean, default: `false`): If `true`, allows adding/deleting
    properties on state objects after creation. If `false` (strict mode),
    enforces the initial shape.
  - `actions?` (Object): An object containing action functions
    `{ name: (state, ...args) => { ... } }` to attach to the store immediately.
- **Returns:** A `store` object containing
  `{ state, attach, actions, toJSON, snapshot, __version }`.

```javascript
import { reify } from "@m5nv/deepstate/core"; // Or /react, /svelte

const store = reify(
  { count: 0, double: (self) => self.count * 2 }, // Initial state with computed
  { // Options
    permissive: true,
    actions: { reset: (state) => state.count = 0 },
  },
);
```

### `shallow(object)`

A helper function to prevent an object from being deeply proxied. The reference
to the object is wrapped in a signal, but its internal properties are not
reactive via DeepState.

- **`object`** (Object): The object to mark as shallow.
- **Returns:** The same object, marked internally.

```javascript
import { reify, shallow } from "@m5nv/deepstate/core";

const settings = shallow({ theme: "dark", layout: "compact" });
const store = reify({ userSettings: settings });

// store.state.userSettings.theme = 'light'; // This mutation is NOT tracked by DeepState
store.state.userSettings = shallow({ theme: "light" }); // Replacing the reference IS reactive
```

### `store` Object

The object returned by `reify`.

- **`store.state`**: The reactive proxy representing your state. Interact with
  it directly for reads and writes:
  - Read: `console.log(store.state.prop);`
  - Write: `store.state.prop = newValue;`
  - Computed: `console.log(store.state.myComputed);`
  - Arrays: `store.state.items.push('new');`
  - Escape Hatch: Access underlying signal object via `store.state.$prop` (or
    configured prefix like `_prop`). Note behavior differences in SSR with
    `/react` entry point.
  - Array Version: Access array structure version signal via
    `store.state.myArray.__version`.
- **`store.attach(actions)`**: A method to add more action functions to the
  store after creation. Returns the `store` object for chaining.
  - `actions` (Object): An object where keys are action names and values are
    action functions `(state, ...args) => { ... }`.
  ```javascript
  store.attach({
    decrement: (state) => state.count--,
  });
  ```
- **`store.actions`**: An object containing all attached actions (both initial
  and added via `attach`). Call them like methods:
  `store.actions.myAction(payload);`.
- **`store.toJSON()`**: Returns a plain JavaScript object representation of the
  state, suitable for serialization (e.g., `JSON.stringify`) or SSR hydration.
  **Excludes computed properties and functions.**
- **`store.snapshot()`**: Returns a plain JavaScript object representation of
  the state, including the resolved values of **all computed properties** found
  during the snapshot process. Useful for debugging or testing.
- **`store.__version`**: A signal (`Signal<number>`) that increments after any
  attached action completes its batch. Useful for coarse-grained change
  detection in framework integrations.

## Migration from V1

DeepState V2 includes significant improvements and breaking changes compared to
V1 published on npm:

- **Computed Properties:** Must be defined inline in the initial state object
  (e.g., `myComputed(self) {...}`), not via a separate `computedFns` argument to
  `reify`. They now receive `self` and `root` context arguments.
- **API Factory:** The `createDeepStateAPI` function is now
  `createDeepStateAPIv2` and accepts dependencies and a consolidated `options`
  object for configuration (`debug`, `escapeHatch`,
  `enableReactSsrEscapeHatchPatch`).
- **`reify` Options:** Takes a single `options` object
  (`{ permissive?, actions? }`) instead of separate arguments.
- **SSR Escape Hatch Behavior:** Default behavior (`/core`, `/svelte`) now
  consistently returns the signal object in SSR. The `/react` entry point
  enables an option to return the primitive value in SSR instead (see SSR
  section).
- **Strict Mode Deletion:** Now prevents deleting initial computed properties
  definitions, in addition to data properties (unless it's an array index).
- See the [CHANGELOG](./CHANGELOG.md) for full details.

## Contributing

Contributions welcome! Please submit issues or PRs on GitHub.

## Credits

Inspired by [deepsignal](https://github.com/luisherranz/deepsignal).

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.
