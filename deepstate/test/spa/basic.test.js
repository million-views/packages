import { describe, expect, it, vi } from "vitest";
import { batch, effect } from "@preact/signals";
import { reify, shallow } from "@m5nv/deepstate";

describe("DeepState Basic SPA - Core Behavior", () => {
  it("handles empty initial state", () => {
    const { state } = reify({});
    expect(Object.keys(state)).toEqual([]);
    expect(state.toJSON()).toEqual({});
    expect(JSON.stringify(state)).toBe("{}");
  });

  it("creates reactive state and computed properties", () => {
    const { state } = reify(
      { count: 0, double: (s) => s.count * 2 },
    );
    expect(state.count).toBe(0);
    expect(state.double).toBe(0);
    state.count = 1;
    expect(state.double).toBe(2);
  });

  it("computed property is lazy until accessed", () => {
    const spy = vi.fn((s) => s.count * 2);
    const { state } = reify({ count: 0, double: spy });
    expect(spy).not.toHaveBeenCalled();
    state.count = 1;
    expect(spy).not.toHaveBeenCalled();
    expect(state.double).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
    state.count = 2;
    expect(state.double).toBe(4);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("supports chained computed properties", () => {
    const { state } = reify({
      count: 2,
      double: (s) => s.count * 2,
      quadruple: (s) => s.double * 2,
    });
    expect(state.quadruple).toBe(8);
    state.count = 3;
    expect(state.quadruple).toBe(12);
  });

  it("handles nested objects and computed properties", () => {
    const { state } = reify(
      {
        user: { first: "John", last: "Doe", name: "Jane" },
        fullName: (s) => s.user.first + " " + s.user.last,
      },
    );
    expect(state.user.first).toBe("John");
    state.user.first = "Jane";
    expect(state.fullName).toBe("Jane Doe");
    state.user.name = "Alice";
    expect(state.user.name).toBe("Alice");
  });
});

describe("DeepState Basic SPA - Effect & Signal Interaction", () => {
  it("computed properties trigger effects", () => {
    const { state } = reify(
      {
        name: "Jane",
        surname: "Doe",
        fullName: (s) => `${s.name} ${s.surname}`,
      },
    );
    const spy = vi.fn();
    const dispose = effect(() => spy(state.fullName));
    expect(spy).toHaveBeenCalledWith("Jane Doe");
    state.name = "John";
    expect(spy).toHaveBeenCalledWith("John Doe");
    dispose();
    state.name = "Mary";
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("allows direct access to signals via $ properties", () => {
    const { state } = reify({ count: 0 });
    const { $count } = state;
    const spy = vi.fn();
    effect(() => spy($count.value));
    state.count = 1;
    expect(spy).toHaveBeenCalledWith(1);
  });

  it("effects stop reacting after dispose()", () => {
    const { state } = reify({ name: "Jane" });
    const spy = vi.fn();
    const dispose = effect(() => spy(state.name));
    state.name = "John";
    expect(spy).toHaveBeenCalledWith("John");
    dispose();
    state.name = "Jack";
    expect(spy).not.toHaveBeenCalledWith("Jack");
  });

  it("chained effects log computed and derived values correctly", () => {
    const { state } = reify(
      { count: 0, double: (s) => s.count * 2 },
    );
    const spyDouble = vi.fn();
    const spyTriple = vi.fn();
    effect(() => spyDouble(state.double));
    effect(() => spyTriple(state.count * 3));
    state.count = 1;
    expect(spyDouble).toHaveBeenCalledWith(2);
    expect(spyTriple).toHaveBeenCalledWith(3);
  });
});

describe("DeepState Basic SPA - Strict vs Permissive Modes", () => {
  it("blocks new properties in strict mode", () => {
    const { state } = reify({ count: 0 });
    expect(() => (state.newProp = "fail"))
      .toThrow("Cannot add new property 'newProp' in strict mode.");
  });

  it("allows new properties in permissive mode", () => {
    const { state } = reify({ count: 0 }, { permissive: true });
    state.newProp = "Hello";
    expect(state.newProp).toBe("Hello");
  });

  it("allows new nested properties in permissive mode", () => {
    const { state } = reify({ user: {} }, { permissive: true });
    state.user.age = 30;
    expect(state.user.age).toBe(30);
  });

  it("rejects direct assignment of $ properties", () => {
    const { state } = reify({ count: 0 });
    expect(() => {
      state.$count = signal(99);
    }).toThrow();
  });
});

describe("DeepState Basic SPA - Shallow Object Handling", () => {
  it("confirms shallow object mutations persist", () => {
    const staticObj = { id: 1, nested: { value: 42 } };
    const { state } = reify({ data: shallow(staticObj) });
    state.data.nested.value = 100;
    expect(state.data.nested.value).toBe(100);
  });

  it("shallow objects do not trigger computed updates", () => {
    const staticObj = { id: 1, nested: { value: 42 } };
    const { state } = reify(
      {
        data: shallow(staticObj),
        nestedValue: (s) => s.data.nested.value,
      },
    );
    expect(state.data).toBe(staticObj);
    expect(state.nestedValue).toBe(42);
    const spy = vi.fn();
    const dispose = effect(() => spy(state.nestedValue));
    state.data.nested.value = 100;
    // Since the shallow object isn't proxied, computed value remains unchanged.
    expect(state.nestedValue).toBe(42);
    expect(spy).toHaveBeenCalledTimes(1);
    dispose();
  });
});

describe("DeepState Basic SPA - Nested State Handling", () => {
  it("handles nested objects", () => {
    const { state } = reify(
      { user: { name: "John", address: { city: "Hobbiton", zip: "12345" } } },
    );
    expect(state.user.name).toBe("John");
    expect(state.user.address.city).toBe("Hobbiton");
    state.user.name = "Frodo";
    expect(state.user.name).toBe("Frodo");
  });

  it("supports computed properties across nested objects", () => {
    const { state } = reify(
      {
        user: { first: "John", last: "Doe" },
        fullName: (s) => s.user.first + " " + s.user.last,
      },
    );
    expect(state.fullName).toBe("John Doe");
    state.user.first = "Jane";
    expect(state.fullName).toBe("Jane Doe");
  });
});

describe("DeepState Basic SPA - Actions", () => {
  it("supports attach() to bind actions", () => {
    const store = reify({ count: 0 }).attach({
      increment(s) {
        s.count++;
      },
      setCount(s, v) {
        s.count = v;
      },
    });
    expect(store.state.count).toBe(0);
    store.actions.increment();
    expect(store.state.count).toBe(1);
    store.actions.setCount(42);
    expect(store.state.count).toBe(42);
  });

  it("throws if accessing undefined actions", () => {
    const store = reify({ count: 0 }).attach({
      increment(s) {
        s.count++;
      },
    });
    expect(store.actions.increment).toBeDefined();
    expect(() => {
      store.actions.decrement();
    }).toThrow(/store\.actions\.decrement is not a function/);
  });
});

describe("DeepState Basic SPA - Async Actions", () => {
  it("supports async actions that update state", async () => {
    const store = reify({ count: 0 }).attach({
      async fetchCount(state) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        state.count = 42;
      },
    });
    await store.actions.fetchCount();
    expect(store.state.count).toBe(42);
  });

  it("supports async actions that call external APIs", async () => {
    // Uncomment and customize the following lines to test with a mocked fetch.
    // global.fetch = vi.fn(() =>
    //   Promise.resolve({
    //     json: () => Promise.resolve({ count: 200 }),
    //   })
    // );
    const store = reify({ count: 0 }).attach({
      async fetchData(state) {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos",
        );
        const data = await response.json();
        state.count = data.length;
      },
    });
    await store.actions.fetchData();
    expect(store.state.count).toBe(200);
  });
});

describe("DeepState Basic SPA - Serialization", () => {
  it("toJSON omits $ properties and computed properties", () => {
    const { state } = reify(
      { count: 0, double: (s) => s.count * 2 },
    );
    expect(JSON.stringify(state)).toBe('{"count":0}');
    state.count = 5;
    expect(JSON.stringify(state)).toBe('{"count":5}');
  });

  it("does not allow direct mutation of toJSON", () => {
    const { state } = reify({ count: 0 });
    expect(() => {
      state.toJSON = 42;
    }).toThrow();
  });
});

describe("DeepState Basic SPA - Array Handling", () => {
  it("updates array length correctly when splice is called", () => {
    const { state } = reify({ todos: [1, 2, 3, 4] });
    expect(state.todos.length).toBe(4);
    state.todos.splice(1, 2);
    expect(state.todos.length).toBe(2);
    expect(state.todos).toEqual([1, 4]);
  });

  it("ensures array elements are deep wrapped by default", () => {
    const { state } = reify({ items: [{ value: 10 }, { value: 20 }] });
    // Check that the array elements are reactive.
    expect(state.items[0]).not.toBeUndefined();
    state.items[0].value = 15;
    expect(state.items[0].value).toBe(15);
  });

  it("prevents whole array replacement for deep arrays", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    expect(() => {
      state.todos = [...state.todos];
    }).toThrow(
      /Whole array\/object replacement is disallowed/,
    );
  });

  it("allows whole array replacement for shallow arrays", () => {
    const shallowTodos = shallow([1, 2, 3]);
    const { state } = reify({ todos: shallowTodos });
    expect(() => {
      state.todos = [...state.todos];
    }).not.toThrow();
    expect(state.todos).toEqual([1, 2, 3]);
  });

  // it("allows whole array replacement for deep arrays via the $ escape hatch", () => { // OLD NAME
  it("throws an error when attempting whole array replacement via the $ escape hatch .value", () => { // NEW NAME
    const { state } = reify({ todos: [1, 2, 3] });
    const originalTodos = state.todos; // Capture original state reference (optional)

    // Assert that attempting to assign to .value via escape hatch throws TypeError
    expect(() => {
      // This line should now throw because the 'set' trap prevents
      // setting properties beginning with the escape hatch prefix.
      state.$todos.value = [...originalTodos, 4];
    }).toThrow(TypeError);

    // Optional: You might also want to assert that the state didn't actually change
    // expect(state.todos).toEqual([1, 2, 3]); // Original array should be unchanged

    // The original assertion `expect(state.todos).toEqual([1, 2, 3, 4]);` is removed
    // as the operation is expected to fail.
  });
});

describe("DeepState Basic SPA - Array Handling - Mutative Methods with Batching", () => {
  it("allows push and triggers reactivity with batching", () => {
    const { state } = reify({ todos: [{ text: "Task", completed: false }] });
    const spy = vi.fn(() => state.todos.length);
    const dispose = effect(spy);
    batch(() => {
      state.todos.push({ text: "Another Todo", completed: false });
    });
    expect(state.todos.length).toBe(2);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
    dispose();
  });

  it("allows pop and triggers reactivity with batching", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    const spy = vi.fn(() => state.todos.length);
    const dispose = effect(spy);
    let popped;
    batch(() => {
      popped = state.todos.pop();
    });
    expect(popped).toBe(3);
    expect(state.todos.length).toBe(2);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
    dispose();
  });

  it("allows shift and triggers reactivity with batching", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    const spy = vi.fn(() => state.todos.length);
    const dispose = effect(spy);
    let shifted;
    batch(() => {
      shifted = state.todos.shift();
    });
    expect(shifted).toBe(1);
    expect(state.todos.length).toBe(2);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
    dispose();
  });

  it("allows splice and triggers reactivity with batching", () => {
    const { state } = reify({
      todos: [
        { text: "Task 1", completed: false },
        { text: "Task 2", completed: false },
        { text: "Task 3", completed: false },
      ],
    });
    const spy = vi.fn(() => state.todos.map((todo) => todo.text).join(","));
    const dispose = effect(spy);
    batch(() => {
      state.todos.splice(1, 1);
    });
    expect(state.todos.length).toBe(2);
    expect(state.todos.map((todo) => todo.text)).toEqual([
      "Task 1",
      "Task 3",
    ]);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
    dispose();
  });

  it("allows delete operator on array elements and triggers reactivity with batching", () => {
    const { state } = reify({
      todos: [
        { text: "Task 1", completed: false },
        { text: "Task 2", completed: false },
      ],
    });
    const spy = vi.fn(() => state.todos[0]);
    const dispose = effect(spy);
    batch(() => {
      delete state.todos[0];
    });
    expect(state.todos[0]).toBeUndefined();
    expect(state.todos.length).toBe(2);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
    dispose();
  });
});

describe("DeepState Basic SPA - Array Handling - Unshift & Reverse", () => {
  it("triggers multiple re-renders when using unshift without batching", () => {
    const { state } = reify({ todos: [2, 3] });
    const spy = vi.fn(() => state.todos[0]);
    const dispose = effect(spy);
    state.todos.unshift(1);
    expect(state.todos).toEqual([1, 2, 3]);
    // Without batching, unshift triggers multiple updates.
    expect(spy.mock.calls.length).toBeGreaterThan(1);
    dispose();
  });

  it("triggers minimal re-renders when using unshift with batching", () => {
    const { state } = reify({ todos: [2, 3] });
    const spy = vi.fn(() => state.todos[0]);
    const dispose = effect(spy);
    batch(() => {
      state.todos.unshift(1);
    });
    expect(state.todos).toEqual([1, 2, 3]);
    // With batching, the effect re-runs only once (after the batch completes)
    expect(spy.mock.calls.length).toBeLessThanOrEqual(2);
    dispose();
  });

  it("triggers multiple re-renders when using reverse without batching", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    const spy = vi.fn(() => state.todos.join(","));
    const dispose = effect(spy);
    state.todos.reverse();
    expect(state.todos).toEqual([3, 2, 1]);
    // Without batching, reverse causes multiple re-renders.
    expect(spy.mock.calls.length).toBeGreaterThan(1);
    dispose();
  });

  it("triggers minimal re-renders when using reverse with batching", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    const spy = vi.fn(() => state.todos.join(","));
    const dispose = effect(spy);
    batch(() => {
      state.todos.reverse();
    });
    expect(state.todos).toEqual([3, 2, 1]);
    // With batching, the effect should run only once after the batch.
    expect(spy.mock.calls.length).toBeLessThanOrEqual(2);
    dispose();
  });
});
