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

You can find the obligatory `todo-list` app using [`deepstate`][here].

[here]: https://preactjs.com/repl?code=aW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAncHJlYWN0JzsKaW1wb3J0IHsgcmVpZnkgfSBmcm9tICJAbTVudi9kZWVwc3RhdGUiOwoKY29uc3Qgc3RvcmUgPSByZWlmeSgKICB7CiAgICB0b2RvczogWwogICAgICB7IHRleHQ6ICJXcml0ZSBteSBmaXJzdCBwb3N0IiwgY29tcGxldGVkOiB0cnVlIH0sCiAgICAgIHsgdGV4dDogIkJ1eSBuZXcgZ3JvY2VyaWVzIiwgY29tcGxldGVkOiBmYWxzZSB9LAogICAgICB7IHRleHQ6ICJXYWxrIHRoZSBkb2ciLCBjb21wbGV0ZWQ6IGZhbHNlIH0sCiAgICBdLAogICAgZHJhZnQ6ICIiLAogIH0sCiAgewogICAgY29tcGxldGVkQ291bnQ6IChzdGF0ZSkgPT4KICAgICAgc3RhdGUudG9kb3MuZmlsdGVyKCh0b2RvKSA9PiB0b2RvLmNvbXBsZXRlZCkubGVuZ3RoLAogIH0sCik7CgpzdG9yZS5hdHRhY2goewogIGFkZFRvZG8oc3RhdGUsIGUpIHsKICAgIGUucHJldmVudERlZmF1bHQoKTsKCiAgICBzdGF0ZS50b2Rvcy5wdXNoKHsgdGV4dDogc3RhdGUuZHJhZnQsIGNvbXBsZXRlZDogZmFsc2UgfSk7CiAgICBzdGF0ZS5kcmFmdCA9ICIiOyAvLyBSZXNldCBpbnB1dCB2YWx1ZSBvbiBhZGQKICB9LAogIHJlbW92ZVRvZG8oc3RhdGUsIGluZGV4KSB7CiAgICBzdGF0ZS50b2Rvcy5zcGxpY2UoaW5kZXgsIDEpOwogIH0sCn0pOwoKZXhwb3J0IGZ1bmN0aW9uIFRvZG9MaXN0KCkgewogIGNvbnN0IHsgc3RhdGUsIGFjdGlvbnMgfSA9IHN0b3JlOwogIGNvbnN0IG9uSW5wdXQgPSAoZXZlbnQpID0%2BIChzdGF0ZS5kcmFmdCA9IGV2ZW50LnRhcmdldC52YWx1ZSk7CgogIHJldHVybiAoCiAgICA8Zm9ybSBvblN1Ym1pdD17YWN0aW9ucy5hZGRUb2RvfT4KICAgICAgPGlucHV0IHR5cGU9InRleHQiIHZhbHVlPXtzdGF0ZS5kcmFmdH0gb25JbnB1dD17b25JbnB1dH0gLz4KICAgICAgPGJ1dHRvbiBvbkNsaWNrPXthY3Rpb25zLmFkZFRvZG99PkFkZDwvYnV0dG9uPgogICAgICA8dWw%2BCiAgICAgICAge3N0YXRlLnRvZG9zLm1hcCgodG9kbywgaW5kZXgpID0%2BICgKICAgICAgICAgIDxsaT4KICAgICAgICAgICAgPGxhYmVsPgogICAgICAgICAgICAgIDxpbnB1dAogICAgICAgICAgICAgICAgdHlwZT0iY2hlY2tib3giCiAgICAgICAgICAgICAgICBjaGVja2VkPXt0b2RvLmNvbXBsZXRlZH0KICAgICAgICAgICAgICAgIG9uSW5wdXQ9eygpID0%2BIHsKICAgICAgICAgICAgICAgICAgdG9kby5jb21wbGV0ZWQgPSAhdG9kby5jb21wbGV0ZWQ7CiAgICAgICAgICAgICAgICAgIC8vIHN0YXRlLnRvZG9zID0gWy4uLnN0YXRlLnRvZG9zXTsKICAgICAgICAgICAgICAgIH19CiAgICAgICAgICAgICAgLz4KICAgICAgICAgICAgICB7dG9kby5jb21wbGV0ZWQgPyA8cz57dG9kby50ZXh0fTwvcz4gOiB0b2RvLnRleHR9CiAgICAgICAgICAgIDwvbGFiZWw%2BeyIgIn0KICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIG9uQ2xpY2s9eygpID0%2BIGFjdGlvbnMucmVtb3ZlVG9kbyhpbmRleCl9PgogICAgICAgICAgICAgIOKdjAogICAgICAgICAgICA8L2J1dHRvbj4KICAgICAgICAgIDwvbGk%2BCiAgICAgICAgKSl9CiAgICAgIDwvdWw%2BCiAgICAgIDxwPkNvbXBsZXRlZCBjb3VudDoge3N0YXRlLmNvbXBsZXRlZENvdW50fTwvcD4KICAgIDwvZm9ybT4KICApOwp9CgpyZW5kZXIoPFRvZG9MaXN0IC8%2BLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJykpOwo%3D

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

## Know your DeepState

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

### Array Handling

DeepState deep wraps arrays and their elements by default to provide reactivity.
Every object element in an array is automatically wrapped unless it’s marked as
shallow using the `shallow` helper.

#### In-Place Mutations vs. Whole Array Replacement

- **In-Place Mutations:**\
  Common array operations—such as updating an element by index, pushing new
  items, splicing, using pop/shift, or deleting an element—are allowed. For
  example:

  ```js
  state.todos[0] = { text: "New Todo", completed: false };
  state.todos.push({ text: "Another Todo", completed: false });
  state.todos.pop();
  state.todos.shift();
  state.todos.splice(1, 1);
  delete state.todos[0];
  ```

  For deep arrays, DeepState attaches an internal version counter (via a signal
  named __version). Each in-place mutation bumps this counter, triggering
  reactivity in any computed properties that depend on the array—even though the
  array reference remains unchanged.

- **Whole Array Replacement:**\
  To avoid the performance overhead associated with deep wrapping every element
  on each update, DeepState **disallows whole array replacement** for deep
  arrays. For example, the following will throw an error:

  ```js
  // For a deep array, this is disallowed:
  state.todos = [...state.todos];
  ```

  Instead, if you need to replace the entire array, use the `$` escape hatch:

  ```js
  state.$todos.value = [...state.todos];
  ```

  **Note:** Using the `$` escape hatch makes your intent explicit. The new array
  will still be deep wrapped (incurring the cost of wrapping each element), but
  it prevents accidental whole-array replacements.

- **Shallow Arrays:**\
  If you mark an array as shallow using the `shallow` helper, whole array
  replacement is allowed, and its elements will not be deep wrapped. For
  example:

  ```js
  const shallowTodos = shallow([{ text: "Task", completed: false }]);
  const store = reify({ todos: shallowTodos });
  // This is allowed:
  store.state.todos = [...store.state.todos];
  ```

### Best Practices for Large Arrays

Large arrays can be expensive to deep wrap—especially when frequently replaced.
Consider the following strategies:

- **Prefer In-Place Mutations:**\
  Use methods such as push, pop, shift, splice, or direct index assignment to
  modify the array in place. DeepState’s version counter ensures that computed
  properties depending on the array update correctly without re-wrapping every
  element.

- **Use the `$` Escape Hatch for Explicit Replacements:**\
  When you need to replace the entire array, update it via the `$` escape hatch
  (e.g., `state.$todos.value = newArray`). This makes your intent explicit. Note
  that the new array will be deep wrapped, so if deep wrapping is not desired,
  consider marking the array as shallow.

- **Mark Arrays as Shallow:**\
  If deep reactivity for array elements is not required, mark the array as
  shallow using the `shallow` helper. This avoids the overhead of deep wrapping
  and allows whole array replacement.

- **Use Batching to Coalesce Mutations:**\
  When performing multiple in-place mutations on a deep array, using Preact
  Signals’ `batch()` function can help coalesce several version bumps into a
  single update. This reduces the number of re-renders and re-computations that
  occur as a result of the mutations. For example:

  ```js
  import { batch } from "@preact/signals";

  // Instead of:
  state.todos.push(newTodo);
  state.todos.splice(1, 1);

  // Use batching:
  batch(() => {
    state.todos.push(newTodo);
    state.todos.splice(1, 1);
  });
  ```

  In this example, the internal version counter for `state.todos` is incremented
  only once after the batch completes.

  **Note:** Any in-place mutation that significantly alters the array—such as
  `push`, `unshift`, `splice`, `reverse`, or even combinations thereof—can
  trigger multiple version bumps if not batched. Batching ensures that these
  operations are applied together, minimizing unnecessary reactivity overhead.
  If granular reactivity is not required, consider marking the array as shallow
  to avoid deep wrapping altogether.

- **Consider Splitting State:**\
  For extremely large or deeply nested arrays, splitting the state into multiple
  smaller stores can reduce the reactivity overhead and simplify state
  management.

## Contributing

Contributions to improve @m5nv/deepstate are welcome. Please submit issues or
pull requests on our GitHub repository.

## Credits

`DeepState` was inspired by [deepsignal].

[deepsignal]: https://github.com/luisherranz/deepsignal

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.
