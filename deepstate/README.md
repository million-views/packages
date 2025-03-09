# DeepState (@m5nv/deepstate)

**Signal-based Reactive State Management Made Intuitive**

---

## Introduction

@m5nv/deepstate is a tiny, reactive state management library built on top of
[@preact/signals][preact/signals].

It makes working with `@preact/signals` natural and intuitive, offering a
refined API that respects the original signals model while improving the
developer experience (we think).

[preact/signals]: https://github.com/preactjs/signals

## Features

- **Direct State Access:**\
  Use `state.prop` to read or update state values without needing to append
  `.value`.

- **Native Signal Access:**\
  Retrieve the underlying signal instance using `state.$prop` for lower-level
  control or advanced optimizations.

- **Simple Actions:**\
  Attach synchronous or asynchronous actions that receive your reactive state as
  their first argument.

- **Optimized Reactivity with Shallow Wrapping:**\
  Use the `shallow` helper to mark objects as non-reactive, avoiding deep proxy
  wrapping when it's not needed.

- **Control State Shape:**\
  Choose between strict mode (no new properties allowed after creation) or
  permissive mode (allows dynamic extension).

## Installation

Install via npm:

```bash
npm install @m5nv/deepstate
```

> **Note:** `@m5nv/deepstate` declares `@preact/signals` as a peer dependency.
> Ensure that `@preact/signals` is installed.

## Usage

DeepState inverts the traditional signals API for a better developer experience
with negligible latency. The usage model is simple:

- Use `state.prop` to access or mutate the value (for both signal and computed
  properties).
- Use `state.$prop` to obtain the underlying signal or computed instance when
  needed.

The following examples highlight the difference between using Preact's signals
and DeepState.

### Using Preact's Signals

```js
import { useComputed, useSignal } from "@preact/signals";

function Counter() {
  const count = useSignal(0);
  const double = useComputed(() => count.value * 2);

  return (
    <div>
      <p>{count} x 2 = {double}</p>
      <button onClick={() => count.value++}>click me</button>
    </div>
  );
}
```

### [Using DeepState][with-deepstate]

[with-deepstate]: https://preactjs.com/repl?code=aW1wb3J0IHsgQ29tcG9uZW50LCByZW5kZXIgfSBmcm9tICdwcmVhY3QnOwppbXBvcnQge3VzZVN0YXRlfSBmcm9tICdwcmVhY3QvY29tcGF0JzsKCgppbXBvcnQgeyByZWlmeSB9IGZyb20gIkBtNW52L2RlZXBzdGF0ZSI7CgpmdW5jdGlvbiBDb3VudGVyKCkgewogIGNvbnN0IFt7IHN0YXRlOiBjb3VudGVyIH1dID0gdXNlU3RhdGUoKCkgPT4KICAgIHJlaWZ5KAogICAgICB7IGNvdW50OiAwIH0sCiAgICAgIHsgZG91YmxlOiAoc3RhdGUpID0%2BIHN0YXRlLmNvdW50ICogMiB9LAogICAgKQogICk7CgogIHJldHVybiAoCiAgICA8ZGl2PgogICAgICA8cD57Y291bnRlci5jb3VudH0geCAyID0ge2NvdW50ZXIuZG91YmxlfTwvcD4KICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiAoY291bnRlci5jb3VudCsrKX0%2BQ2xpY2sgbWU8L2J1dHRvbj4KICAgIDwvZGl2PgogICk7Cn0KCnJlbmRlcig8Q291bnRlciAvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpKTsK

```js
import { reify } from "@m5nv/deepstate";

function Counter() {
  const [{ state: counter }] = useState(() =>
    reify(
      { count: 0 },
      { double: (state) => state.count * 2 },
    )
  );

  return (
    <div>
      <p>{counter.count} x 2 = {counter.double}</p>
      <button onClick={() => (counter.count++)}>Click me</button>
    </div>
  );
}
```

In DeepState, you simply use the properties of your initial object without
worrying about when and where a signal's `.value` is to be used. When necessary,
you can retrieve the underlying signal via the `$` prefix.

## Attaching Actions

DeepState allows you to attach actions to the store using the `attach` method.
Actions bound to the store receive the `state` object as their first argument.
Bound actions can be invoked as normal functions; there is no need to pass in
the `state` explicitly at the callsite.

Actions can be either **synchronous** or **asynchronous**, allowing you to
handle state updates, including remote API calls.

### **Synchronous Action Example**

```js
const store = reify({ count: 0 }).attach({
  increment(state) {
    state.count += 1;
  },
});

store.actions.increment();
console.log(store.state.count); // 1
```

### **Asynchronous Action Example (Remote API Call)**

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

This allows developers to integrate state updates with API calls seamlessly,
keeping their UI state in sync with remote data sources.

## API Reference

### `reify(initial, computedFns, permissive)`

Creates a reactive store from an initial state object.

- **`initial`** (object): A non-null object for your initial state.
- **`computedFns`** (object): Map keys to functions that derive computed state.
- **`permissive`** (boolean, default: `false`):
  - **Strict mode:** New properties cannot be added after initialization.
  - **Permissive mode:** Allows dynamic property additions.

Returns a store with:

- **`state`**: A proxy that lets you read/write state directly.
- **`attach`**: A method to bind actions.
- **`toJSON`**: A method to serialize the state (computed properties are not
  serialized).

### `shallow(obj)`

Marks an object so that it isn’t deeply wrapped for reactivity. Use `shallow`
when you want to avoid the overhead of deep proxying for parts of your state.

---

## Advanced Topics

### Performance & State Organization

DeepState uses proxies to wrap objects and arrays for deep reactivity. For
typical UI applications, this incurs minimal overhead. If you have a very large
or deeply nested state, consider splitting it into multiple, smaller stores.
This modular approach not only optimizes performance but also keeps state
management organized.

### Computed Properties & Serialization

Computed properties are created using Preact's `computed` and update
automatically as their dependencies change. They appear during enumeration
(e.g., `Object.keys(state)`) for convenience but are **not** included in the
JSON serialization via `toJSON`. This means computed values are runtime-only and
will not be rehydrated from a serialized state.

### Strict vs. Permissive Mode

- **Strict Mode:**\
  Prevents adding new properties after initialization, ensuring state
  consistency.

- **Permissive Mode:**\
  Allows dynamic property additions, which can be useful for flexible state
  structures but requires careful state management.

## Contributing

Contributions to improve @m5nv/deepstate are welcome. Please submit issues or
pull requests on our GitHub repository.

## Credits

`DeepState` was inspired by [deepsignal].

[deepsignal]: https://github.com/luisherranz/deepsignal

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.
