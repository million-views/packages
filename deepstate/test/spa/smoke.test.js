import { beforeEach, describe, expect, it, vi } from "vitest";
import { signal } from "@preact/signals-core";
import { reify, shallow } from "@m5nv/deepstate/core";

describe.only("DeepState v2 Core Functionality (SPA Mode)", () => {
  // Note on Test Structure:
  // For describe blocks where tests mutate the state created once at the top,
  // later tests depend on the state modified by earlier tests.
  // If independent tests are required, use beforeEach or create store inside each 'it'.

  describe("Basic Reactivity & Chaining", () => {
    const initialState = {
      count: 2,
      multiplier: 10,
      double(self) {
        return self.count * 2;
      },
      multipliedDouble(self) {
        return self.double * self.multiplier;
      },
    };
    // Create store once for this describe block
    const store = reify(initialState);

    it("should provide initial primitive and computed values", () => {
      expect(store.state.count).toBe(2);
      expect(store.state.multiplier).toBe(10);
      expect(store.state.double).toBe(4);
      expect(store.state.multipliedDouble).toBe(40);
    });

    it("should update computed properties when dependencies change", () => {
      store.state.count = 3; // Access via store.state
      expect(store.state.count).toBe(3);
      expect(store.state.double).toBe(6);
      expect(store.state.multipliedDouble).toBe(60);
    });

    it("should update chained computed properties when indirect dependencies change", () => {
      // Assumes count is 3 from previous test
      store.state.multiplier = 100;
      expect(store.state.count).toBe(3); // Should remain 3
      expect(store.state.double).toBe(6); // Should remain 6
      expect(store.state.multipliedDouble).toBe(600); // 6 * 100
    });

    it("should handle multiple increments", () => {
      // Assumes multiplier is 100 and count is 3
      store.state.count = 4; // Set known start for this test part
      expect(store.state.double).toBe(8);
      expect(store.state.multipliedDouble).toBe(800);
      store.state.count++; // Use increment operator
      expect(store.state.count).toBe(5);
      expect(store.state.double).toBe(10);
      expect(store.state.multipliedDouble).toBe(1000); // 10 * 100
    });
  });

  describe("Nested Objects & Root Access", () => {
    const initialState = {
      x: 10,
      nested: {
        y: 5,
        sumWithRootX(self, root) {
          // self should be proxy for nested object
          // root should be the top-level state proxy
          return { sum: self.y + root.x, selfIsNested: self === root.nested };
        },
      },
    };
    const store = reify(initialState); // Use reify

    it("should provide initial nested primitive values", () => {
      expect(store.state.x).toBe(10);
      expect(store.state.nested.y).toBe(5);
    });

    it("should allow nested computed properties to access root state", () => {
      expect(store.state.nested.sumWithRootX).toEqual({
        sum: 15,
        selfIsNested: true,
      });
    });

    it("should react to changes in root state affecting nested computed properties", () => {
      store.state.x = 100;
      expect(store.state.nested.sumWithRootX).toEqual({
        sum: 105,
        selfIsNested: true,
      }); // 5 + 100
    });

    it("should react to changes in nested state affecting nested computed properties", () => {
      // x is 100 from previous test
      store.state.nested.y = 50;
      expect(store.state.nested.sumWithRootX).toEqual({
        sum: 150,
        selfIsNested: true,
      }); // 50 + 100
    });
  });

  describe("Simple Dependency Tracking", () => {
    const initialState = {
      greeting: "Hello",
      name: "World",
      message(self) {
        return `${self.greeting}, ${self.name}!`;
      },
    };
    const store = reify(initialState); // Use reify

    it("should compute initial value based on multiple dependencies", () => {
      expect(store.state.message).toBe("Hello, World!");
    });

    it("should update computed value when the first dependency changes", () => {
      store.state.greeting = "Hi";
      expect(store.state.message).toBe("Hi, World!");
    });

    it("should update computed value when the second dependency changes", () => {
      // Greeting is still "Hi"
      store.state.name = "Alice";
      expect(store.state.message).toBe("Hi, Alice!");
    });
  });

  describe("Arrays with Primitives", () => {
    const initialState = {
      items: [10, 20, 30],
      total(self) {
        // Test array version dependency implicitly via iteration/access
        // if (Array.isArray(self.items) && self.items.__version) self.items.__version.value;
        return self.items.reduce((acc, item) => acc + item, 0);
      },
    };
    const store = reify(initialState); // Use reify

    it("should provide access to initial array elements", () => {
      expect(store.state.items).toEqual([10, 20, 30]);
      expect(store.state.items[0]).toBe(10);
      expect(store.state.items.length).toBe(3);
    });

    it("should compute values based on array elements", () => {
      expect(store.state.total).toBe(60);
    });

    it("should react to changes in array elements", () => {
      store.state.items[1] = 25; // Change the second element
      expect(store.state.items).toEqual([10, 25, 30]);
      expect(store.state.total).toBe(65); // 10 + 25 + 30
    });
  });

  describe("Arrays with Objects & Nested Computed", () => {
    // Use function for initial state for potential isolation if needed
    const getInitialState = () => ({
      tasks: [
        { id: 1, value: 100, active: true },
        {
          id: 2,
          value: 200,
          active: true,
          doubledValue(self) {
            return self.value * 2;
          },
        },
      ],
      allActive(self) {
        // Test array version dependency implicitly via iteration/access
        // if (Array.isArray(self.tasks) && self.tasks.__version) self.tasks.__version.value;
        return self.tasks.every((task) => task.active);
      },
    });
    const store = reify(getInitialState()); // Use reify

    it("should provide access to objects and their properties within arrays", () => {
      expect(store.state.tasks.length).toBe(2);
      expect(store.state.tasks[0].id).toBe(1);
      expect(store.state.tasks[0].value).toBe(100);
      expect(store.state.tasks[1].id).toBe(2);
      expect(store.state.tasks[1].value).toBe(200);
    });

    it("should handle computed properties within objects in arrays", () => {
      expect(store.state.tasks[1].doubledValue).toBe(400);
    });

    it("should react to changes to properties within objects in arrays", () => {
      store.state.tasks[1].value = 250;
      expect(store.state.tasks[1].doubledValue).toBe(500); // Should recompute
    });

    it("should react to changes affecting computed properties at the root level", () => {
      // Use a local store here as this test heavily mutates state sequentially
      const localStore = reify(getInitialState());
      expect(localStore.state.allActive).toBe(true); // Initially both active
      localStore.state.tasks[0].active = false;
      expect(localStore.state.allActive).toBe(false); // First inactive
      localStore.state.tasks[0].active = true;
      localStore.state.tasks[1].active = false;
      expect(localStore.state.allActive).toBe(false); // Second inactive
      localStore.state.tasks[1].active = true;
      expect(localStore.state.allActive).toBe(true); // Both active again
    });
  });

  describe("Complex Inter-Array Dependencies (Tasks)", () => {
    // isEnabled relies on self and root, defined inline within the objects
    const isEnabledFn = (self, root) => {
      if (!self.requirements || self.requirements.length === 0) return true;
      return self.requirements.every((req) => {
        // Find dependency in the root tasks array
        const requiredTask = root.tasks.find((t) =>
          t.id === req.requiredTaskId
        );
        return requiredTask &&
          [req.requiredState, "completed"].includes(requiredTask.state);
      });
    };
    const getInitialTasks = () => ({
      tasks: [ // isEnabled is now an inline computed property
        {
          id: 1,
          name: "Setup",
          requirements: [],
          state: "pending",
          isEnabled: isEnabledFn,
        },
        {
          id: 2,
          name: "Process A",
          requirements: [{ requiredTaskId: 1, requiredState: "completed" }],
          state: "pending",
          isEnabled: isEnabledFn,
        },
        {
          id: 3,
          name: "Process B",
          requirements: [{ requiredTaskId: 1, requiredState: "completed" }],
          state: "pending",
          isEnabled: isEnabledFn,
        },
        {
          id: 4,
          name: "Combine",
          requirements: [{ requiredTaskId: 2, requiredState: "completed" }, {
            requiredTaskId: 3,
            requiredState: "completed",
          }],
          state: "pending",
          isEnabled: isEnabledFn,
        },
        {
          id: 5,
          name: "Cleanup",
          requirements: [{ requiredTaskId: 4, requiredState: "completed" }],
          state: "pending",
          isEnabled: isEnabledFn,
        },
      ],
    });

    it("should correctly calculate initial enablement based on dependencies", () => {
      const store = reify(getInitialTasks()); // Use reify
      expect(store.state.tasks[0].isEnabled).toBe(true); // Task 1
      expect(store.state.tasks[1].isEnabled).toBe(false); // Task 2
      expect(store.state.tasks[2].isEnabled).toBe(false); // Task 3
      expect(store.state.tasks[3].isEnabled).toBe(false); // Task 4
      expect(store.state.tasks[4].isEnabled).toBe(false); // Task 5
    });

    it("should update enablement when dependency states change", () => {
      const store = reify(getInitialTasks()); // Use reify
      // Complete Task 1
      store.state.tasks[0].state = "completed";
      expect(store.state.tasks[1].isEnabled).toBe(true); // Task 2 enabled
      expect(store.state.tasks[2].isEnabled).toBe(true); // Task 3 enabled
      expect(store.state.tasks[3].isEnabled).toBe(false); // Task 4 still blocked

      // Complete Task 2 and 3
      store.state.tasks[1].state = "completed";
      store.state.tasks[2].state = "completed";
      expect(store.state.tasks[3].isEnabled).toBe(true); // Task 4 enabled
      expect(store.state.tasks[4].isEnabled).toBe(false); // Task 5 still blocked

      // Complete Task 4
      store.state.tasks[3].state = "completed";
      expect(store.state.tasks[4].isEnabled).toBe(true); // Task 5 enabled
    });

    it("should handle intermediate states based on requirement logic", () => {
      const store = reify(getInitialTasks()); // Use reify
      store.state.tasks[0].state = "ongoing";
      // isEnabled checks for requiredState ("completed") OR "completed"
      expect(store.state.tasks[1].isEnabled).toBe(false); // Still false
      store.state.tasks[0].state = "completed";
      expect(store.state.tasks[1].isEnabled).toBe(true); // Now true
    });
  });

  describe("Shallow Objects", () => {
    // Use beforeEach for isolation as tests mutate shared external object
    let originalShallowObject;
    let shallowInstance;
    let initialState;
    let store;
    let computeSpy;

    beforeEach(() => {
      // Use signal from injected primitives
      originalShallowObject = { a: 1, b: signal(2) };
      // Use shallow from the factory result
      shallowInstance = shallow(originalShallowObject);
      // Define spy fresh each time
      computeSpy = vi.fn((self) => ({
        name: self.name,
        rawA: self.shallowData.a, // Direct access within shallow
        signalB: self.shallowData.b.value, // Access signal's value inside shallow
        isRaw: self.shallowData === originalShallowObject,
      }));
      initialState = {
        name: "Test E",
        shallowData: shallowInstance,
        derivedValue: computeSpy, // Spy used as computed function
      };
      store = reify(initialState); // Use reify
    });

    it("should store and return shallow objects without proxying them", () => {
      expect(store.state.shallowData).toBe(originalShallowObject); // Identity check
      expect(store.state.shallowData.a).toBe(1); // Direct read
      expect(typeof store.state.shallowData.b?.peek).toBe("function"); // Verify 'b' is signal
      expect(store.state.shallowData.b.value).toBe(2); // Read signal value
    });

    it("should reflect external changes made directly to the shallow object", () => {
      originalShallowObject.a = 100; // Mutate original non-signal property
      expect(store.state.shallowData.a).toBe(100); // Access via proxy sees the change
    });

    it("should compute initial values correctly based on shallow data", () => {
      // Access derivedValue, triggers computation
      expect(store.state.derivedValue).toEqual({
        name: "Test E",
        rawA: 1,
        signalB: 2,
        isRaw: true,
      });
      expect(computeSpy).toHaveBeenCalledTimes(1); // Called once
    });

    it("should NOT recompute or be notified by changes to non-signal properties inside shallow object", () => {
      // Arrange: Setup done in beforeEach

      // Act & Assert 1: Initial computation
      expect(store.state.derivedValue.rawA).toBe(1);
      expect(computeSpy).toHaveBeenCalledTimes(1);
      const initialCallCount = computeSpy.mock.calls.length; // Record count (will be 1)

      // Act 2: Mutate non-signal property within the raw shallow object
      originalShallowObject.a = 200;

      // Assert 2: Access computed value AGAIN.
      // Expect the CACHED value (1), NOT the new raw value (200),
      // because no signal dependency changed to invalidate the cache.
      expect(store.state.derivedValue.rawA).toBe(1);

      // Assert 3: Verify the spy was NOT called again just from this access.
      // The cached value should have been returned without re-computation.
      expect(computeSpy.mock.calls.length).toBe(initialCallCount); // Should still be 1

      // Optional: Access again to be absolutely sure cache holds
      expect(store.state.derivedValue.rawA).toBe(1);
      expect(computeSpy.mock.calls.length).toBe(initialCallCount); // Still 1
    });

    it("SHOULD recompute when signal properties inside shallow object change", () => {
      expect(store.state.derivedValue.signalB).toBe(2); // Initial access
      const initialCallCount = computeSpy.mock.calls.length;

      store.state.shallowData.b.value = 30; // Change signal inside shallow

      // Access again - this SHOULD be triggered by the signal change
      expect(store.state.derivedValue.signalB).toBe(30); // Verify new value
      // Expect computed to have run again
      expect(computeSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it("should react when the shallow object reference itself is replaced", () => {
      expect(store.state.derivedValue.rawA).toBe(1); // Initial access
      const initialCallCount = computeSpy.mock.calls.length;

      // Replace the shallow object reference
      const newShallowContents = { a: 1000, b: signal(2000) };
      store.state.shallowData = shallow(newShallowContents); // Assign new shallow object

      // Access again - this should trigger recompute because the signal holding shallowData changed
      expect(store.state.derivedValue).toEqual({
        name: "Test E",
        rawA: 1000,
        signalB: 2000,
        isRaw: false, // isRaw is false now
      });
      expect(computeSpy.mock.calls.length).toBeGreaterThan(initialCallCount); // Should have recomputed
      // Verify identity is new object
      expect(store.state.shallowData).toBe(newShallowContents);
    });
  });
});
