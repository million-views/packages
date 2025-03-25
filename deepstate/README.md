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

- **Signal Access with the `$` Prefix:**\
  Use `state.$prop` to access the underlying signal (with its mutable `.value`
  property). This is especially important in React—when using frameworks like
  react-router or SSR frameworks, React reliably re-renders only when you access
  the signal directly. For consistency, we recommend always using `$`‑prefixed
  properties in render code.

### Shallow Wrapping

The `shallow` helper marks an object so that DeepState wraps only its top-level
properties, leaving nested objects unproxied (and thus non-reactive). This is
useful for performance optimization or when you intentionally want some nested
data to remain static.

> **Example in SPA vs. SSR:**\
> **SPA Mode:**
>
> ```js
> const staticObj = { id: 1, nested: { value: 42 } };
> const { state } = reify(
>   { data: shallow(staticObj) },
>   { nestedValue: (s) => s.data.nested.value },
>   false,
> );
> console.log(state.nestedValue); // 42
> // Updating the shallow object does NOT trigger re-computation:
> staticObj.nested.value = 100;
> console.log(state.nestedValue); // Remains 42 in SPA mode
> ```
>
> **SSR Mode:**\
> In SSR mode, computed getters re-run on every access. With the same code,
> after updating:
>
> ```js
> console.log(state.nestedValue); // Now becomes 100
> ```
>
> **Why It Matters:**\
> In SPA mode, shallow objects remain “frozen” in computed properties; in SSR
> mode, due to our fallback reactivity, computed values always reflect the
> latest state. This trade-off is necessary for SSR compatibility.

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

3. **For Svelte and CLI Environments:**
   ```js
   import { reify, shallow } from "@m5nv/deepstate/core";
   ```
   _Peer dependency:_ `@preact/signals-core`

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

DeepState makes state management feel natural. Under the hood, it converts your
state into signals and computes derived values automatically.

- **Direct Access:**\
  Read or write state using `state.prop`.
- **Signal Access:**\
  Use `state.$prop` to obtain the underlying signal—for example, to update its
  `.value` or to maintain reactivity after destructuring.

### Example: Using DeepState in a Component

For consistency—especially in React—use the `$`‑prefixed properties in your
render code:

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

_Note:_ In pure Preact projects, plain properties might work. However, for React
(especially when using react-router), using `$`‑prefixed properties ensures that
UI updates occur reliably.

---

## API Reference

### `reify(initial, computedFns, permissive)`

Creates a reactive store from an initial state object.

- **`initial`** (object): A non-null object defining your initial state.
- **`computedFns`** (object): Functions mapping keys to computed (derived)
  state.
- **`permissive`** (boolean, default: `false`):
  - **Strict mode:** Prevents adding new properties after initialization.
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

> **Note:**
>
> - In SPA mode, shallow objects remain non-reactive.
> - In SSR mode, computed getters re-run on every access so that any change in a
>   shallow object is reflected immediately.

---

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
  In React—and for consistency across frameworks—always use the `$`‑prefixed
  properties (e.g. `counter.$count`, `counter.$double`) in render code to ensure
  reliable UI updates.

- **Mutations:**\
  Use direct in-place updates (e.g. `state.count++`) for simplicity and
  efficiency.

- **Batching:**\
  Utilize `batch()` from `@preact/signals` to combine multiple updates into a
  single re-computation, reducing unnecessary re-renders.

- **State Organization:**\
  For large or deeply nested state, consider splitting it into multiple stores
  to enhance performance and maintainability.

## Contributing

Contributions to improve @m5nv/deepstate are welcome! Please submit issues or
pull requests on our GitHub repository.

## Credits

DeepState was inspired by
[deepsignal](https://github.com/luisherranz/deepsignal).

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.

## Using Deepstate with React & SSR Quirks

- **React Integration:**\
  In standard Vite React projects using `@preact/signals-react`, plain state
  properties may update correctly. However, when using react-router or other SSR
  frameworks, React may not trigger re-renders unless you access state via the
  `$`‑prefixed properties.\
  **Recommendation:** Always use `$`‑prefixed properties (e.g. `counter.$count`,
  `counter.$double`) in your render code for consistent behavior.

- **SSR Mode Limitations:**\
  In SSR mode, computed properties re-run on every access (due to the lack of
  full dependency tracking), and signals are automatically unwrapped for valid
  HTML output. This means that:
  - Computed values always reflect the latest state—even for shallow objects.
  - Given that SSR rendering happens only once per request, this trade-off is
    acceptable for generating static markup.
