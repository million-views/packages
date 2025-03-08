# DeepState (@m5nv/deepstate)

**Signal-based Reactive State Management Made Intuitive**

---

## Introduction

@m5nv/deepstate is a tiny, reactive state management library built on top of
[@preact/signals][preact/signals]. It provides a better DX (we think) for using
signals in component-based UI frameworks such as Preact.

For performance-sensitive code, DeepState lets you access the underlying signals
using a `$` prefix, allowing you to leverage all features of `@preact/signals`
(like `effect`, `batch`, etc.).

[preact/signals]: https://github.com/preactjs/signals

---

## Features

- **Simplify State Access:** Directly read and update state properties without
  appending `.value` every time.
- **Maintain Signal Semantics:** Use the `$` prefix as an escape hatch to access
  the native signal instance for advanced performance tuning and debugging.
- **Attach Actions:** A fluent API to attach actions that receive the `state`
  and do whatever operation with it. Supports both synchronous and asynchronous
  actions.

`@m5nv/deepstate` makes working with `@preact/signals` natural and intuitive,
offering a refined API that respects the original signals model while improving
the developer experience.

---

## Installation

Install via npm:

```bash
npm install @m5nv/deepstate
```

> Note: `@m5nv/deepstate` declares `@preact/signals` as a peer dependency.
> Please ensure that `@preact/signals` is installed. Newer versions of npm may
> install a peer dependency automatically, but it is best to specify it
> explicitly as a dependency.

---

## Usage

DeepState inverts the traditional signals API for a better DX. This, of course,
introduces a negligible latency.

The usage model is simple:

- Use `state.prop` to access or mutate the value (for both signal and computed
  properties).
- Use `state.$prop` to obtain the underlying signal instance when needed.

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
worrying about appending `.value` for reading or writing. When necessary, you
can retrieve the underlying signal via the `$` prefix.

---

## Attaching Actions

DeepState allows you to attach actions to the store using the `attach` method.
Actions bound to the store receive the `state` object as their first argument.
Bound actions can be invoked as normal functions; there is no need to pass in
the `state` explicitly at the callsite by the caller.

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

---

## Status

The library is ready for use but has only seen limited real-world use. We expect
it to improve as we integrate it further into our projects.

---

## Contributing

Contributions to enhance @m5nv/deepstate are welcome. Whether you have
suggestions, improvements, or bug fixes, please submit an issue or pull request
on our GitHub repository.

---

## Credits

`DeepState` was inspired by [deepsignal].

[deepsignal]: https://github.com/luisherranz/deepsignal

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.
