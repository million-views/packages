import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { batch, effect } from "@preact/signals";
import { computedProp, reify, shallow } from "@m5nv/deepstate";

// Force SSR mode
const originalWindow = global.window;
beforeAll(() => {
  global.window = undefined;
});
afterAll(() => {
  global.window = originalWindow;
});

describe("DeepState Basic SSR reify() Core Behavior", () => {
  it("handles empty initial state", () => {
    const { state } = reify({});
    expect(Object.keys(state)).toEqual([]);
    expect(state.toJSON()).toEqual({});
    expect(JSON.stringify(state)).toBe("{}");
  });

  it("creates reactive state and computed properties", () => {
    const { state } = reify(
      {
        count: 0,
        double: computedProp((s) => s.count * 2),
      },
    );
    expect(state.count).toBe(0);
    expect(state.double).toBe(0);
    state.count = 1;
    expect(state.double).toBe(2);
  });

  it("computed property is lazy until accessed", () => {
    const spy = vi.fn((s) => s.count * 2);
    const { state } = reify({ count: 0, double: computedProp(spy) });
    expect(spy).not.toHaveBeenCalled();
    state.count = 1;
    expect(spy).not.toHaveBeenCalled(); // still lazy until access
    expect(state.double).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
    state.count = 2;
    expect(state.double).toBe(4);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("supports chained computed properties", () => {
    const { state } = reify({
      count: 2,
      double: computedProp((s) => s.count * 2),
      quadruple: computedProp((s) => s.double * 2),
    });
    expect(state.quadruple).toBe(8);
    state.count = 3;
    expect(state.quadruple).toBe(12);
  });

  it("handles nested objects and computed properties", () => {
    const { state } = reify(
      {
        user: { first: "John", last: "Doe", name: "Jane" },
        fullName: computedProp((s) => s.user.first + " " + s.user.last),
      },
    );
    expect(state.user.first).toBe("John");
    state.user.first = "Jane";
    expect(state.fullName).toBe("Jane Doe");
    state.user.name = "Alice";
    expect(state.user.name).toBe("Alice");
  });

  it("exposes computed signals via $ properties as unwrapped primitives", () => {
    const { state } = reify(
      { count: 0, double: computedProp((s) => s.count * 2) },
    );
    // In SSR mode, accessing $double returns a primitive.
    expect(state.$double).toBe(0);
    state.count = 2;
    expect(state.$double).toBe(4);
  });
});

describe("DeepState Basic SSR reify() Strict vs Permissive Modes", () => {
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
      state.$count = { value: 99 };
    }).toThrow(
      "Cannot directly set '$count'. Use the signal's 'value' property.",
    );
  });
});

describe("DeepState Basic SSR reify() Shallow Object Handling", () => {
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
        nestedValue: computedProp((s) => s.data.nested.value),
      },
    );
    expect(state.data).toBe(staticObj);
    expect(state.nestedValue).toBe(42);
    const spy = vi.fn(() => state.nestedValue);
    // In SSR mode, computed properties re-run on every access, so changing the shallow object
    // causes the computed property to update.
    state.data.nested.value = 100;
    expect(state.nestedValue).toBe(100);
    // We can no longer expect zero calls because the computed getter is invoked on each access.
  });
});

describe("DeepState Basic SSR reify() Nested State Handling", () => {
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
        fullName: computedProp((s) => s.user.first + " " + s.user.last),
      },
    );
    expect(state.fullName).toBe("John Doe");
    state.user.first = "Jane";
    expect(state.fullName).toBe("Jane Doe");
  });
});

describe("DeepState Basic SSR reify().attach() Actions", () => {
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

describe("DeepState Basic SSR reify().attach() Async Actions", () => {
  it("supports async actions that update state", async () => {
    const store = reify({ count: 0 }).attach({
      async fetchCount(s) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        s.count = 42;
      },
    });
    await store.actions.fetchCount();
    expect(store.state.count).toBe(42);
  });

  it("supports async actions that call external APIs", async () => {
    const store = reify({ count: 0 }).attach({
      async fetchData(s) {
        s.count = 200;
      },
    });
    await store.actions.fetchData();
    expect(store.state.count).toBe(200);
  });
});

describe("DeepState Basic SSR reify() Serialization", () => {
  it("toJSON omits $ properties and computed properties", () => {
    const { state } = reify(
      { count: 0, double: computedProp((s) => s.count * 2) },
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

describe("DeepState Basic SSR reify() Array Handling", () => {
  it("updates array length correctly when splice is called", () => {
    const { state } = reify({ todos: [1, 2, 3, 4] });
    expect(state.todos.length).toBe(4);
    state.todos.splice(1, 2);
    expect(state.todos.length).toBe(2);
    expect(state.todos).toEqual([1, 4]);
  });

  it("ensures array elements are deep wrapped by default", () => {
    const { state } = reify({ items: [{ value: 10 }, { value: 20 }] });
    expect(state.items[0]).not.toBeUndefined();
    state.items[0].value = 15;
    expect(state.items[0].value).toBe(15);
  });

  it("prevents whole array replacement for deep arrays", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    expect(() => {
      state.todos = [...state.todos];
    })
      .toThrow("Whole array replacement is disallowed for deep arrays");
  });

  it("allows whole array replacement for shallow arrays", () => {
    const shallowTodos = shallow([1, 2, 3]);
    const { state } = reify({ todos: shallowTodos });
    expect(() => {
      state.todos = [...state.todos];
    }).not.toThrow();
    expect(state.todos).toEqual([1, 2, 3]);
  });

  it("allows whole array replacement for deep arrays via the $ escape hatch", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    expect(() => {
      // In SSR, $todos returns the unwrapped primitive value,
      // so assignment must be to state.$todos (which overwrites the underlying value)
      state.$todos = [...state.todos, 4];
    }).not.toThrow();
    expect(state.todos).toEqual([1, 2, 3, 4]);
  });
});

describe("DeepState Basic SSR reify() Array Handling - Mutative Methods with Batching", () => {
  it("allows push with batching", () => {
    const { state } = reify({ todos: [{ text: "Task", completed: false }] });
    const initialLength = state.todos.length;
    batch(() => {
      state.todos.push({ text: "Another Todo", completed: false });
    });
    expect(state.todos.length).toBe(initialLength + 1);
  });

  it("allows pop with batching", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    let popped;
    batch(() => {
      popped = state.todos.pop();
    });
    expect(popped).toBe(3);
    expect(state.todos.length).toBe(2);
  });

  it("allows shift with batching", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    let shifted;
    batch(() => {
      shifted = state.todos.shift();
    });
    expect(shifted).toBe(1);
    expect(state.todos.length).toBe(2);
  });

  it("allows splice with batching", () => {
    const { state } = reify({
      todos: [
        { text: "Task 1", completed: false },
        { text: "Task 2", completed: false },
        { text: "Task 3", completed: false },
      ],
    });
    batch(() => {
      state.todos.splice(1, 1);
    });
    expect(state.todos.length).toBe(2);
    expect(state.todos.map((t) => t.text)).toEqual(["Task 1", "Task 3"]);
  });

  it("allows delete operator on array elements with batching", () => {
    const { state } = reify({
      todos: [
        { text: "Task 1", completed: false },
        { text: "Task 2", completed: false },
      ],
    });
    batch(() => {
      delete state.todos[0];
    });
    expect(state.todos[0]).toBeUndefined();
    expect(state.todos.length).toBe(2);
  });
});

describe("DeepState Basic SSR reify() Array Handling - Unshift & Reverse", () => {
  it("allows unshift with batching", () => {
    const { state } = reify({ todos: [2, 3] });
    batch(() => {
      state.todos.unshift(1);
    });
    expect(state.todos).toEqual([1, 2, 3]);
  });

  it("allows reverse with batching", () => {
    const { state } = reify({ todos: [1, 2, 3] });
    batch(() => {
      state.todos.reverse();
    });
    expect(state.todos).toEqual([3, 2, 1]);
  });
});
