import { describe, expect, it, vi } from "vitest";
import { effect, signal } from "@preact/signals";
import { reify, shallow } from "@m5nv/deepstate";

describe("deepstate reify()", () => {
  describe("Core Behavior", () => {
    it("handles empty initial state", () => {
      const { state } = reify({}, {}, false);
      expect(Object.keys(state)).toEqual([]);
      expect(state.toJSON()).toEqual({});
      expect(JSON.stringify(state)).toBe("{}");
    });
    it("creates reactive state and computed properties", () => {
      const { state } = reify(
        { count: 0 },
        { double: (s) => s.count * 2 },
        false,
      );
      expect(state.count).toBe(0);
      expect(state.double).toBe(0);
      state.count = 1;
      expect(state.double).toBe(2);
    });
    it("computed property is lazy until accessed", () => {
      const spy = vi.fn((s) => s.count * 2);
      const { state } = reify({ count: 0 }, { double: spy }, false);
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
      const { state } = reify({ count: 2 }, {
        double: (s) => s.count * 2,
        quadruple: (s) => s.double * 2,
      }, false);
      expect(state.quadruple).toBe(8);
      state.count = 3;
      expect(state.quadruple).toBe(12);
    });
    it("handles nested objects and computed properties", () => {
      const { state } = reify(
        { user: { first: "John", last: "Doe", name: "Jane" } },
        { fullName: (s) => s.user.first + " " + s.user.last },
        false,
      );
      expect(state.user.first).toBe("John");
      state.user.first = "Jane";
      expect(state.fullName).toBe("Jane Doe");
      state.user.name = "Alice";
      expect(state.user.name).toBe("Alice");
    });
  });

  describe("Effect & Signal Interaction", () => {
    it("computed properties trigger effects", () => {
      const { state } = reify(
        { name: "Jane", surname: "Doe" },
        { fullName: (s) => `${s.name} ${s.surname}` },
        false,
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
      const { state } = reify({ count: 0 }, {}, false);
      const { $count } = state;
      const spy = vi.fn();
      effect(() => spy($count.value));
      state.count = 1;
      expect(spy).toHaveBeenCalledWith(1);
    });
    it("effects stop reacting after dispose()", () => {
      const { state } = reify({ name: "Jane" }, {}, false);
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
        { count: 0 },
        { double: (s) => s.count * 2 },
        false,
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

  describe("Strict vs Permissive Modes", () => {
    it("blocks new properties in strict mode", () => {
      const { state } = reify({ count: 0 }, {}, false);
      expect(() => (state.newProp = "fail"))
        .toThrow("Cannot add new property 'newProp' in strict mode.");
    });
    it("allows new properties in permissive mode", () => {
      const { state } = reify({ count: 0 }, {}, true);
      state.newProp = "Hello";
      expect(state.newProp).toBe("Hello");
    });
    it("allows new nested properties in permissive mode", () => {
      const { state } = reify({ user: {} }, {}, true);
      state.user.age = 30;
      expect(state.user.age).toBe(30);
    });
    it("rejects direct assignment of $ properties", () => {
      const { state } = reify({ count: 0 }, {}, false);
      expect(() => {
        state.$count = signal(99);
      }).toThrow();
    });
  });

  describe("Shallow Object Handling", () => {
    it("confirms shallow object mutations persist", () => {
      const staticObj = { id: 1, nested: { value: 42 } };
      const { state } = reify({ data: shallow(staticObj) }, {}, false);
      state.data.nested.value = 100;
      expect(state.data.nested.value).toBe(100);
    });
    it("shallow objects do not trigger computed updates", () => {
      const staticObj = { id: 1, nested: { value: 42 } };
      const { state } = reify(
        { data: shallow(staticObj) },
        { nestedValue: (s) => s.data.nested.value },
        false,
      );
      expect(state.data).toBe(staticObj);
      expect(state.nestedValue).toBe(42);
      const spy = vi.fn();
      const dispose = effect(() => spy(state.nestedValue));
      state.data.nested.value = 100;
      expect(state.nestedValue).toBe(42);
      expect(spy).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  describe("Nested State Handling", () => {
    it("handles nested objects", () => {
      const { state } = reify(
        { user: { name: "John", address: { city: "Hobbiton", zip: "12345" } } },
        {},
        false,
      );
      expect(state.user.name).toBe("John");
      expect(state.user.address.city).toBe("Hobbiton");
      state.user.name = "Frodo";
      expect(state.user.name).toBe("Frodo");
    });
    it("supports computed properties across nested objects", () => {
      const { state } = reify(
        { user: { first: "John", last: "Doe" } },
        { fullName: (s) => s.user.first + " " + s.user.last },
        false,
      );
      expect(state.fullName).toBe("John Doe");
      state.user.first = "Jane";
      expect(state.fullName).toBe("Jane Doe");
    });
  });

  describe("Actions & Attach", () => {
    it("supports attach() to bind actions", () => {
      const store = reify({ count: 0 }, {}, false).attach({
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
      const store = reify({ count: 0 }, {}, false).attach({
        increment(s) {
          s.count++;
        },
      });
      expect(store.actions.increment).toBeDefined();
      expect(() => {
        store.actions.decrement();
      })
        .toThrow(/store.actions\.decrement is not a function/);
    });
  });

  describe("Async Actions", () => {
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
          // console.log("data", data);
          state.count = data.length;
        },
      });

      await store.actions.fetchData();
      expect(store.state.count).toBe(200);
    });
  });

  describe("Serialization", () => {
    it("toJSON omits $ properties and computed properties", () => {
      const { state } = reify(
        { count: 0 },
        { double: (s) => s.count * 2 },
        false,
      );
      expect(JSON.stringify(state)).toBe('{"count":0}');
      state.count = 5;
      expect(JSON.stringify(state)).toBe('{"count":5}');
    });
    it("does not allow direct mutation of toJSON", () => {
      const { state } = reify({ count: 0 }, {}, false);
      expect(() => {
        state.toJSON = 42;
      }).toThrow();
    });
  });

  describe("Advanced Cases", () => {
    it("supports nested shallow objects", () => {
      const staticObj = { deep: { id: 1 } };
      const { state } = reify(
        { outer: { data: shallow(staticObj) } },
        {},
        false,
      );
      expect(state.outer.data).toBe(staticObj);
      expect(state.outer.data.deep.id).toBe(1);
      state.outer.data.deep.id = 42;
      expect(state.outer.data.deep.id).toBe(42);
    });
    it("does not serialize computed properties", () => {
      const { state } = reify(
        { count: 2 },
        { double: (s) => s.count * 2 },
        false,
      );
      expect(JSON.stringify(state)).toBe('{"count":2}');
      state.count = 4;
      expect(JSON.stringify(state)).toBe('{"count":4}');
    });
    it("prevents adding computed properties dynamically in permissive mode", () => {
      const { state } = reify({ count: 0 }, {}, true);
      expect(() => {
        state.computedProp = () => state.count * 2;
      }).toThrow();
    });
    it("computed properties do not react to shallow object mutations", () => {
      const staticObj = shallow({ price: 100 });
      const { state } = reify(
        { item: staticObj },
        { priceWithTax: (s) => s.item.price * 1.1 },
        false,
      );
      expect(state.priceWithTax).toBeCloseTo(110, 10);
      state.item.price = 200;
      expect(state.priceWithTax).toBeCloseTo(110, 10);
      expect(state.item).toBe(staticObj);
    });
    it("double updates correctly after initial read", () => {
      const { state } = reify(
        { count: 0 },
        { double: (s) => s.count * 2 },
        false,
      );
      state.count = 1;
      expect(state.double).toBe(2);
      state.count = 2;
      expect(state.double).toBe(4);
    });
  });
});
