# DeepState (@m5nv/deepstate)

**Signal-based Reactive State Management Made Intuitive**

---

## Introduction

@m5nv/deepstate is a tiny, reactive state management library built on top of
[@preact/signals][preact/signals]. It provides a better DX (we think) for using
signals in component-based UI frameworks such as Preact, Svelte, and Astro.

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
- **Attach Actions:** A fluent API to attach actions that receive a store and do
  whatever operation with it.

`@m5nv/deepstate` makes working with `@preact/signals` more natural and
intuitive, offering a refined API that respects the original signals model while
improving the developer experience.

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

### Using DeepState

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

DeepState fully preserves the lazy nature of computed properties, and `effect`
works as expected. Consider the following usage:

```js
// Lazy computation triggers on access: Logs 0
console.log("Initial:", counter.double);

counter.count = 1;

// Logs: 2
console.log("After update (outside effect):", counter.double);

// Effect observes and logs changes
effect(() => console.log("Effect:", counter.double));

// Triggers re-computation and effect logs updated value
counter.count += 1;
```

When destructuring state, reactivity is lost—similar to how Svelte behaves when
passing a `$state` rune as a prop. To preserve reactivity, destructure using the
`$` prefix, which returns the underlying signal.

```js
import { effect } from "@preact/signals";
import { reify } from "@m5nv/deepstate";

const { state: demo } = reify(
  { name: "Jane", surname: "Doe" },
  { fullName: (s) => `${s.name} ${s.surname}` },
  false,
);

const dispose = effect(() => console.log("Effect:", demo.fullName));

let { name } = demo;
name = "Mary"; // Does not trigger re-computation

let { $name } = demo;
$name.value = "Mary"; // Triggers effect and recomputation of fullName

dispose();
```

Using `$name` lets you directly work with the signal and access all advanced
functions provided by `@preact/signals`.

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
