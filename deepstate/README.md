# DeepState (@m5nv/deepstate)

**Signal-based Reactive State Management Made Intuitive**

## 👋 Introduction

DeepState is a state management library powered by Signals & Proxies. It uses
modern JavaScript features (ES6 Proxies) and a Signal-based core (specifically
`@preact/signals-core`) to enable automatic **deep reactivity** throughout your
state objects and arrays. This allows you to manage complex state naturally,
writing updates like standard JavaScript mutations while benefiting from
fine-grained reactivity powered by Signals.

## 🤔 Why DeepState V2?

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
  framework integration or advanced patterns? Use the `$` prefix (e.g.,
  `state.$prop`).

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
and variant import paths. The import paths and the required peer dependency are
listed below:

1. **For Preact:**
   ```javascript
   import { reify, shallow } from "@m5nv/deepstate/preact"; // Use explicit /preact entry
   ```
   _Peer dependency:_ `@preact/signals`

2. **For React:**
   ```javascript
   import { reify, shallow } from "@m5nv/deepstate/react";
   ```
   _Peer dependency:_ `@preact/signals-react`

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
   _Note:_ This entry point automatically configures the escape hatch prefix to
   `_` (underscore) instead of `$` to avoid conflicts with Svelte's syntax.

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
    // 'self' refers to the 'user' object level here if this was nested,
    // but here it refers to the root state as it's a root property.
    // Let's adjust to use root state directly for simplicity here.
    // NOTE: For computeds *inside* nested objects, 'self' is more useful.
    // We'll use 'state' passed to reify for root access demonstration.
    // A better root example: fullName(self, root) { return `${root.user.firstName} ${root.user.lastName}`; }
    // Simplified for this basic example:
    return `${this.user.firstName} ${this.user.lastName}`; // 'this' also refers to state proxy
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
state.todos.push("Build Awesome App");

console.log(state.fullName); // Output: Jane Smith (Computed updated!)
console.log(state.todoCount); // Output: 3

// --- Reactivity with Effects (Example) ---
effect(() => {
  console.log(`User's full name is now: ${state.fullName}`);
});
// Output: User's full name is now: Jane Smith

state.user.firstName = "John";
// Output: User's full name is now: John Smith
```

## Key Features Guide

### Defining State (`reify`)

You create a store using `reify`, passing your initial state object.

```javascript
import { reify } from "@m5nv/deepstate/core";

const store = reify({
  counter: 0,
  settings: { theme: "dark" },
});

const state = store.state;
```

### Reading State

Access properties directly on the `state` proxy.

```javascript
console.log(state.counter); // Read primitive
console.log(state.settings.theme); // Read nested property
```

### Writing State

Mutate properties directly. DeepState handles the reactivity.

```javascript
state.counter++;
state.settings.theme = "light";
state.items.push("new item"); // Use standard array methods
state.items.splice(0, 1); // They work too!
```

> **Important:** Replacing entire nested objects or arrays directly
> (`state.settings = { theme: 'light' }`) is disallowed by default to prevent
> common reactivity issues. Mutate properties or use actions instead. See
> "Strict vs Permissive Mode" below.

### Computed Properties

Define functions directly in your initial state. They become reactive computed
values.

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

store.state.count = 6;
console.log(store.state.double); // Output: 12
console.log(store.state.nested.valueTimesCount); // Output: 60 (10 * 6)
```

### Actions (`attach`, `options.actions`)

For more complex or reusable logic, define actions. Actions receive the `state`
proxy as the first argument. Updates within actions are batched automatically
(in SPA mode).

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
          // const res = await fetch(...);
          // const user = await res.json();
          state.user = { name: "Fetched User" }; // Example
        } catch (e) {
          state.error = e;
        } finally {
          state.loading = false;
        }
      },
    },
  },
);
store1.actions.add(5);
console.log(store1.state.count); // Output: 5

// 2. Attach later
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

Access the underlying Signal object directly using the `$` prefix (default).
Useful for framework integrations or advanced patterns where you need the signal
itself.

```javascript
const store = reify({ message: "Hi" });

const messageSignal = store.state.$message;

console.log(messageSignal.value); // Output: Hi (Read signal value)

// Update via signal's .value setter
messageSignal.value = "Hello";
console.log(store.state.message); // Output: Hello

// Destructure signals
let { $message } = store.state;
$message.value = "Hola";
console.log(store.state.message); // Output: Hola
```

> **Limitation:** Assigning objects/arrays directly via
> `signal.value = newObject` bypasses DeepState's proxy wrapping for the _new_
> object/array, meaning its internal structure won't be reactive. Use
> `state.prop = newObject` for deep reactivity.

### Snapshots (`toJSON`, `snapshot`)

Get plain JavaScript representations of your state.

- **`store.toJSON()`**: Serializes the state, suitable for `JSON.stringify` or
  SSR hydration. **Excludes computed properties.**
  ```javascript
  const store = reify({ count: 1, double: (s) => s.count * 2 });
  console.log(JSON.stringify(store)); // Output: {"count":1}
  ```
- **`store.snapshot()`**: Creates a snapshot including the _resolved values_ of
  computed properties. Useful for debugging or testing.
  ```javascript
  console.log(store.snapshot()); // Output: { count: 1, double: 2 }
  ```

### Shallow Objects (`shallow`)

Prevent deep reactivity for specific objects using the `shallow` helper. Only
the reference to the shallow object is reactive.

```javascript
import { reify, shallow } from "@m5nv/deepstate/core";

const userSettings = shallow({ theme: "dark", notifications: true });
const store = reify({ settings: userSettings });

// Changing the reference is reactive
store.state.settings = shallow({ theme: "light", notifications: false });

// Changing properties *inside* the shallow object is NOT reactive
userSettings.notifications = true; // Won't trigger effects depending on store.state.settings
```

### Strict vs Permissive Mode (`options.permissive`)

Control whether the shape of your state objects can change after creation.

- **`Strict Mode (Default - permissive: false):`** Prevents adding or deleting
  properties on objects after initialization (helps catch errors and ensures
  shape consistency). Deleting array elements (`delete state.items[0]`) is still
  allowed.
  ```javascript
  const store = reify({ user: { name: "A" } }, { permissive: false });
  // state.user.age = 30; // Throws TypeError
  // delete state.user;   // Throws TypeError
  // delete state.user.name; // Throws TypeError
  ```
- **`Permissive Mode (permissive: true):`** Allows adding new properties or
  deleting existing properties. Functions added this way become computed
  properties automatically.
  ```javascript
  const store = reify({ user: { name: "A" } }, { permissive: true });
  state.user.age = 30; // OK - adds reactive 'age' property
  state.user.upperName = (self) => self.name.toUpperCase(); // OK - adds computed
  console.log(state.user.upperName); // Output: A
  delete state.user.name; // OK
  ```

### Versioning (`__version`)

DeepState includes non-enumerable `__version` signals for advanced use cases,
primarily framework integration:

- `store.__version`: Increments after every action completes. Useful for
  coarse-grained change detection.
- `state.myArray.__version`: Increments when an array's structure changes
  (elements added/removed/length changed via proxy). Useful for optimizing list
  rendering updates.

These are typically used internally by framework adapters (like the Svelte
example below).

### Server-Side Rendering (SSR)

DeepState works in SSR environments.

- It automatically detects SSR (or use `DEEPSTATE_MODE=SSR` env var).
- Uses non-reactive signal mocks (`SSRSignal`, `SSRComputed`).
- Computed properties re-evaluate on every access.
- Use `store.toJSON()` to get serializable state for hydration on the client.
- Client-side reactivity (`effect`) will not run on the server.

## Framework Integration Examples

### React

Use `@m5nv/deepstate/react` which depends on `@preact/signals-react`.

```javascript
import { reify } from "@m5nv/deepstate/react";
import { useSignals } from "@preact/signals-react/runtime"; // Or appropriate import
import React, { useState } from "react";

function Counter() {
  // Initialize store in component state or context
  const [store] = useState(() =>
    reify({ count: 0, double: (s) => s.count * 2 }).attach({
      increment: (state) => state.count++,
    })
  );

  // Hook from signals-react to trigger re-renders
  useSignals();

  return (
    <div>
      {/* Read directly from state proxy */}
      <p>{store.state.count} * 2 = {store.state.double}</p>
      {/* Call action */}
      <button onClick={store.actions.increment}>Click me</button>
      {/* Or use escape hatch if needed, depends on setup */}
      {/* <p>{store.state.$count} * 2 = {store.state.$double}</p> */}
    </div>
  );
}
```

_`(Note: React integration patterns with Signals are evolving. Always consult the @preact/signals-react documentation. Using $prop might still be necessary in some routing/SSR contexts).`_

### Svelte

Use `@m5nv/deepstate/svelte` (depends on `@preact/signals-core`). This entry
point automatically sets the escape hatch to `_` to avoid conflicts with
Svelte's `$`.

**Basic Usage (Reading State):**

Svelte's reactivity often works directly for reads.

```html
<script>
  import { reify } from "@m5nv/deepstate/svelte";

  const { state } = reify({ message: "Hello Svelte!" });

  // Changes via proxy trigger Svelte update if state is referenced
  setTimeout(() => {
    state.message = "Updated!";
  }, 2000);
</script>

<h1>{state.message}</h1>
```

**`Using Actions / __version Adapter:`**

If you use DeepState actions or mutations that Svelte doesn't automatically
detect (like array pushes inside an action), you need an adapter that bridges
DeepState's `__version` signal to a Svelte store.

```html
<script>
  import { writable } from "svelte/store";
  import { effect } from "@preact/signals-core";
  import { reify } from "@m5nv/deepstate/svelte"; // Uses '_' escape hatch

  // --- Simple Adapter ---
  function deepstateToSvelte(ds) {
    // Use ds.state directly for reading its reactive properties
    const svelteStore = writable(ds.state); // Initial value
    const stopEffect = effect(() => {
      // Subscribe to DeepState's version signal
      ds.__version.value; // Read value to create dependency
      // Trigger Svelte update by setting the store value again
      // Svelte will compare and update if needed
      svelteStore.set(ds.state);
    });
    // Return Svelte store interface + actions etc.
    return {
      subscribe: svelteStore.subscribe,
      // Expose actions and maybe state/toJSON directly
      actions: ds.actions,
      state: ds.state, // Direct access still works
      toJSON: ds.toJSON,
    };
  }
  // --------------------

  const counterDs = reify({ count: 0 }).attach({
    increment: (state) => state.count++,
  });

  const counterStore = deepstateToSvelte(counterDs);
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

effect(() => {
  console.log(`Sum is: ${state.sum}`);
});
// Output: Sum is: 3

// Batch multiple updates
batch(() => {
  state.x = 5;
  state.y = 10;
});
// Output: Sum is: 15 (effect runs only once)
```

## API Reference

Here are the main functions and objects provided by DeepState V2:

### `reify(initialState, options?)`

Creates and initializes your reactive state store.

- **`initialState`** (Object): A plain JavaScript object defining the initial
  structure, data, and computed properties (as inline functions) for your state.
- **`options?`** (Object, optional):
  - `permissive?` (Boolean, default: `false`): If `true`, allows adding/deleting
    properties on state objects after creation. If `false` (strict mode),
    enforces the initial shape.
  - `actions?` (Object): An object containing action functions to attach to the
    store immediately. Action functions receive `state` as the first argument.
- **Returns:** A `store` object containing
  `{ state, attach, actions, toJSON, snapshot, __version }`.

```javascript
import { reify } from "@m5nv/deepstate/core";

const store = reify(
  { count: 0, double: (self) => self.count * 2 },
  {
    permissive: true,
    actions: { reset: (state) => state.count = 0 },
  },
);
```

### `shallow(object)`

A helper function to prevent an object from being deeply proxied. Only the
reference to the object will be reactive. Useful for performance or embedding
non-reactive data.

- **`object`** (Object): The object to mark as shallow.
- **Returns:** The same object, marked internally.

```javascript
import { reify, shallow } from "@m5nv/deepstate/core";

const settings = shallow({ theme: "dark", layout: "compact" });
const store = reify({ userSettings: settings });

// store.state.userSettings.theme = 'light'; // This change won't be reactive
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
  - Escape Hatch: Access underlying signal via `store.state.$prop` (or `_prop`
    in Svelte entry).
  - Array Version: Access array structure version via
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
- **`store.actions`**: An object containing all attached actions. Call them like
  methods: `store.actions.myAction(payload);`.
- **`store.toJSON()`**: Returns a plain JavaScript object representation of the
  state, suitable for serialization (e.g., `JSON.stringify`) or SSR hydration.
  **Excludes computed properties.**
- **`store.snapshot()`**: Returns a plain JavaScript object representation of
  the state, including the resolved values of **all computed properties**.
  Useful for debugging or testing.
- **`store.__version`**: A signal that increments after any attached action
  completes. Useful for coarse-grained change detection in framework
  integrations.

## Migration from V1

DeepState V2 includes significant improvements and breaking changes compared to
V1 published on npm:

- **Computed Properties:** Must be defined inline in the initial state object,
  not via the second `computedFns` argument to `reify`. They now receive `self`
  and `root` context.
- **`toJSON()`**: Behavior (excluding computeds) is consistent with V1's
  documented behavior.
- **Strict Mode Deletion:** Now prevents deleting initial computed properties,
  in addition to data properties (unless it's an array index).
- **`debug` Option:** No longer available via `reify`. Configure via
  `createDeepStateAPIv2` factory if needed (advanced).
- See the [CHANGELOG](./CHANGELOG.md) for full details.

## Contributing

Contributions welcome! Please submit issues or PRs on GitHub.

## Credits

Inspired by [deepsignal](https://github.com/luisherranz/deepsignal).

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.
