# DeepState (@m5nv/deepstate)

**Signal-based Reactive State Management Made Intuitive**

## Introduction

@m5nv/deepstate is a tiny, reactive state management library built on top of
[@preact/signals][preact/signals]. It transforms plain JavaScript objects into
reactive _stores_, offering an intuitive and refined API that respects the
original signals model while improving the developer experience (we think).

[preact/signals]: https://github.com/preactjs/signals

## Core Concepts

### Reactivity via Proxies and Signals

DeepState wraps each property of your state object in a signal using JavaScript
proxies. This allows you to work with your state as if it were a plain object,
while automatic reactivity is maintained behind the scenes.

### Direct vs. Signal Access

- **Direct State Access:**\
  Read or update values using `state.prop` for clean, natural code.

- **Signal Access with the Escape Hatch:**\
  DeepState exposes the underlying signal via an escape hatch when a framework's
  own reactivity handling may interfere with DeepState's proxy. By default, the
  underlying signal can be accessed using the `$` prefix (e.g. `state.$prop`).
  In Svelte, since `$` is reserved, a dedicated entry point (e.g.
  `@m5nv/deepstate/svelte`) automatically sets the escape hatch to `"_"` so you
  access it as `state._prop`.

### Shallow Wrapping

The `shallow` helper marks an object so that DeepState wraps only its top-level
properties—leaving nested objects unproxied (non-reactive). This is useful for
optimizing performance or when you intentionally want certain nested data to
remain static. Updating a `shallow` property will not affect computed property
under normal operation.

During SSR however, changing `shallow` property will affect computed properties
since we use a simple wrapper to emulate signal to avoid running into
integration issues with various frameworks since we cannot control how they do
SSR. This is illustrated in the code below

#### Default Mode

```js
const staticObj = { id: 1, nested: { value: 42 } };
const { state } = reify(
  { data: shallow(staticObj) },
  { nestedValue: (s) => s.data.nested.value },
  false,
);
console.log(state.nestedValue); // 42
// Updating the shallow object does NOT trigger re-computation:
staticObj.nested.value = 100;
console.log(state.nestedValue); // Remains 42 in SPA/Browser mode
```

#### SSR Mode:

In SSR mode, computed getters re-run on every access. With the same code, after
updating:

```js
console.log(state.nestedValue); // Now becomes 100
```

### In-Place Mutation vs. Immutability

DeepState embraces in-place mutation rather than forcing immutable updates:

- **Simplicity:** Update state directly (e.g. `state.count++`) without cloning
  entire objects.
- **Efficiency:** Only affected properties update—avoiding the overhead of deep
  cloning common in immutable approaches.
- **Natural Mapping:** You work with state as a plain object while DeepState
  transparently manages reactivity.

While immutability has its advantages, DeepState’s approach leverages modern
JavaScript features (proxies and signals) to deliver an intuitive and performant
experience for most UI applications.

## Import Variants

DeepState is distributed in three variants to suit different frameworks:

1. **For Preact:**
   ```js
   import { reify, shallow } from "@m5nv/deepstate";
   ```
   _Peer dependency:_ `@preact/signals`

2. **For React:**
   ```js
   import { reify, shallow } from "@m5nv/deepstate/react";
   ```
   _Peer dependency:_ `@preact/signals-react`

3. **For CLI Environments:**
   ```js
   import { reify, shallow } from "@m5nv/deepstate/core";
   ```
   _Peer dependency:_ `@preact/signals-core`

4. **For Svelte:**
   ```js
   import { reify, shallow } from "@m5nv/deepstate/svelte";
   ```
   _Peer dependency:_ `@preact/signals-core`\
   **Note:** This special import path automatically configures the escape hatch
   to use an alternative prefix (default `"_"`) to avoid conflicts with Svelte’s
   reserved `$` symbol. This is only needed if you plan on using `attach` api
   for actions.

## Configuration & Environment Modes

DeepState adapts its behavior based on its runtime environment:

- **SPA Mode:**\
  In browsers or jsdom environments, DeepState uses native signals. State
  properties remain as signal objects (with a `.value` property), and shallow
  objects are non-reactive as intended.

- **SSR Mode:**\
  In server-side rendering—or when `DEEPSTATE_MODE=SSR` is set—DeepState falls
  back to a model where:
  - **Computed Properties Re-compute on Every Access:**\
    Without full dependency tracking in SSR, computed properties re-run on every
    access. Since SSR rendering happens only once, the performance impact is
    minimal.
  - **Automatic Signal Unwrapping:**\
    Signals return their underlying primitive value to generate valid HTML.
  - **Impact on Shallow Objects:**\
    In SPA mode, shallow objects remain non-reactive. In SSR mode, computed
    getters re-run on every access, so changes to nested values in a shallow
    object are immediately visible.

DeepState determines its mode using:

```js
// DEEPSTATE_MODE can be "SPA" or "SSR"
// If not set, default to checking window.
const mode = typeof process === "undefined"
  ? "SPA"
  : process.env.DEEPSTATE_MODE;
const isSSR = mode ? mode === "SSR" : (typeof window === "undefined");
```

> **Tip:** In Node or CLI/test environments, explicitly set `DEEPSTATE_MODE=SPA`
> if you require SPA behavior.

## Usage

DeepState makes state management feel natural by converting your intial state
into signals &mdash; deeply. Simply read or write using `state.prop` syntax.
When you need access to underlying signal, use `state.$prop` (or, for Svelte,
`state._prop`) syntax. Note: destructuring DeepState's state `props` will result
in losing reactivity; to overcome this you could destructure the native signals
using `$` (or `_` for Svelte) prefix which remain reactive.

### Example: Using DeepState in a Component (React)

For consistency—especially in React—use the escape hatch in your render code:

```jsx
import { reify } from "@m5nv/deepstate/react";
import { useState } from "react";

function Counter() {
  const [{ state: counter, actions }] = useState(() =>
    reify(
      { count: 0 },
      { double: (state) => state.count * 2 },
    ).attach({ on_click: (state) => state.count++ })
  );

  return (
    <div>
      <p>{counter.$count} x 2 = {counter.$double}</p>
      <button onClick={() => actions.on_click()}>Click me</button>
    </div>
  );
}
```

_Note:_ In pure Preact projects, plain properties might work. However, in React
(especially with react-router) always use the `$`‑prefixed properties for
reliable updates.

## API Reference

### `reify(initial, computedFns, permissive)`

Creates a reactive store from an initial state object.

- **`initial`** (object): A non-null object defining your initial state.
- **`computedFns`** (object): Functions mapping keys to computed (derived)
  state.
- **`permissive`** (boolean, default: `false`):
  - **Strict mode:** Prevents new properties from being added after
    initialization.
  - **Permissive mode:** Allows dynamic extension of state.

**Returns:** A store with:

- **`state`**: A proxy providing direct access to your state.
- **`attach`**: A method to bind actions to the store.
- **`toJSON`**: A method to serialize the state (excluding computed properties).

### `shallow(obj)`

Marks an object as shallow—meaning DeepState wraps only its top-level
properties, leaving nested objects unproxied (non-reactive).\
_Usage:_ Use `shallow` when you want to avoid deep wrapping for performance
reasons or when you intend for nested data to remain static.

## Attaching Actions

Actions are functions that operate on your state. They can be synchronous or
asynchronous. Bind actions to the store using the `attach` method.

### Synchronous Action Example

```js
const store = reify({ count: 0 }).attach({
  increment(state) {
    state.count++;
  },
});

store.actions.increment();
console.log(store.state.count); // 1
```

### Asynchronous Action Example

```js
const store = reify({ count: 0 }).attach({
  async fetchData(state) {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos");
    const data = await response.json();
    state.count = data.length;
  },
});

await store.actions.fetchData();
console.log(store.state.count); // Updated from API response
```

## Best Practices & Considerations

- **Rendering:**\
  In React/preact based projects use `$`‑prefixed properties in render code
  (e.g. `<p>{counter.$count} x 2 = {counter.$double}</p>`)

- **Mutations:**\
  Prefer direct in-place updates (e.g. `state.count++`) for simplicity and
  efficiency.

- **Batching:**\
  Utilize `batch()` from `@preact/signals` to combine multiple updates into a
  single re-computation, reducing unnecessary re-renders.

- **State Organization:**\
  For large or deeply nested state, consider splitting it into multiple stores
  for better performance and maintainability.

- **SSR Mode Limitations:**\
  In SSR mode, computed properties re-run on every access (due to the lack of
  full dependency tracking), and signals are automatically unwrapped for valid
  HTML output. This means:
  - Computed values always reflect the latest state—even for shallow objects.
  - Given that SSR rendering happens only once per request, this trade-off is
    acceptable for generating static markup.

## Integration

### React Integration

- **Reactivity Considerations:**\
  In standard Vite React projects using `@preact/signals-react`, you might see
  that plain state properties update as expected. However, when using frameworks
  such as react-router or in SSR scenarios, use `$`-prefixed property in your
  render code (e.g. `counter.$count` and `counter.$double`). This ensures that
  React’s reconciliation is triggered reliably.

### Svelte Integration

- **Native Reactivity vs. DeepState:**\
  Svelte has its own powerful, assignment-based reactivity. For simple
  read/update scenarios, Svelte’s built-in reactivity may suffice.

- **When a Store Adapter is Needed:**\
  In cases where you attach actions that update state via in-place mutations
  (e.g. `state.count++`), Svelte does not automatically detect the changes. To
  bridge this gap, a Svelte store adapter is required.

- **Escape Hatch Configuration:**\
  Because Svelte reserves `$` for its own reactivity, a dedicated Svelte entry
  point (e.g. `@m5nv/deepstate/svelte`) configures the escape hatch to use an
  alternative prefix (by default, `_`). This allows you to access the underlying
  signal as `state._prop`.

### Svelte Store Adapter for Actions

When you attach actions that update state, those in-place mutations won’t
trigger Svelte’s reactivity automatically. In such cases, a Svelte store adapter
is required to bridge DeepState’s updates with Svelte’s assignment-based
reactivity. A simple store adapter is presented below for reference.

```html
<script module>
  // deepstateStore.js
  import { writable } from "svelte/store";
  import { effect } from "@preact/signals-core";
  import { reify } from "@m5nv/deepstate/core";

  export function createSvelteStore(ds) {
    const { state, actions, __version, toJSON } = ds;
    const store = writable(state, (set) => {
      const stop = effect(() => {
        __version.value; // Subscribe to changes via __version.
        set(state);
      });
      return () => stop();
    });

    return {
      subscribe: store.subscribe,
      set: store.set,
      state,
      actions,
      toJSON,
    };
  }
</script>

<script>
  // Create a deep state store.
  const deepstate = reify(
    { count: 0 },
    { double: (s) => s.count * 2 },
    false,
  ).attach({
    on_click: (state) => {
      console.log(state.count, state.double);
      state.count++;
    },
  });
  const sveltestore = createSvelteStore(deepstate);
</script>

<h2>DeepState Svelte Store</h2>
<input type="number" bind:value="{$sveltestore.count}" />
<button on:click="{sveltestore.actions.on_click}">count</button>
<h3>Is it working?</h3>
<code>{deepstate.state.count} * 2 = {$sveltestore.double}</code>
<pre>{JSON.stringify($sveltestore)}</pre>

<hr />
<ul>
  <li>Two-way binding works!</li>
  <li>
    Fine-grained reactivity is available by accessing the raw <i>state</i>.
  </li>
  <li>
    The Svelte store adapter is needed only when you attach actions to update
    state, since in-place mutations are not detected by Svelte's reactivity
    automatically.
  </li>
</ul>
```

## Contributing

Contributions to improve @m5nv/deepstate are welcome! Please submit issues or
pull requests on our GitHub repository.

## Credits

DeepState was inspired by
[deepsignal](https://github.com/luisherranz/deepsignal).

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.
