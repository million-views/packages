// test/spa/deepstate-v2.test.js - Tests for DeepState v2 in SPA mode
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { batch, effect, signal } from "@preact/signals-core";
import { computedProp, reify, shallow } from "@m5nv/deepstate/core";

describe("DeepState v2 Core Functionality (SPA Mode)", () => {
  describe("Basic Reactivity", () => {
    it("creates reactive state with direct property access", () => {
      const store = reify({ count: 0 });
      expect(store.state.count).toBe(0);

      store.state.count = 1;
      expect(store.state.count).toBe(1);
    });
    it("supports nested objects with deep reactivity", () => {
      const store = reify({
        user: {
          profile: {
            name: "John",
            age: 30,
          },
        },
      });

      expect(store.state.user.profile.name).toBe("John");

      store.state.user.profile.name = "Jane";
      expect(store.state.user.profile.name).toBe("Jane");
    });

    it("supports arrays with reactive elements", () => {
      const store = reify({
        items: [{ id: 1, value: "one" }, { id: 2, value: "two" }],
      });

      expect(store.state.items[0].value).toBe("one");

      store.state.items[0].value = "first";
      expect(store.state.items[0].value).toBe("first");
    });
  });

  describe("Real-time Filtering Example", () => {
    function createFilterStore() {
      return reify({
        items: [
          { id: 1, name: "Apple", category: "Fruit", price: 1.2 },
          { id: 2, name: "Banana", category: "Fruit", price: 0.8 },
          { id: 3, name: "Carrot", category: "Vegetable", price: 0.5 },
          { id: 4, name: "Broccoli", category: "Vegetable", price: 1.8 },
          { id: 5, name: "Chicken", category: "Meat", price: 5.5 },
          { id: 6, name: "Beef", category: "Meat", price: 7.2 },
        ],
        filters: {
          search: "",
          category: "all",
          minPrice: 0,
          maxPrice: 10,
        },
        filteredItems(self) {
          return self.items.filter((item) => {
            // Filter by search term
            const matchesSearch = self.filters.search === "" ||
              item.name.toLowerCase().includes(
                self.filters.search.toLowerCase(),
              );

            // Filter by category
            const matchesCategory = self.filters.category === "all" ||
              item.category === self.filters.category;

            // Filter by price range
            const matchesPrice = item.price >= self.filters.minPrice &&
              item.price <= self.filters.maxPrice;

            return matchesSearch && matchesCategory && matchesPrice;
          });
        },
        stats(self) {
          return {
            count: self.filteredItems.length,
            avgPrice: self.filteredItems.length > 0
              ? self.filteredItems.reduce((sum, item) => sum + item.price, 0) /
                self.filteredItems.length
              : 0,
            categories: [
              ...new Set(self.filteredItems.map((item) => item.category)),
            ],
          };
        },
      }).attach({
        updateSearch(state, value) {
          state.filters.search = value;
        },

        updateCategory(state, category) {
          state.filters.category = category;
        },

        updatePriceRange(state, min, max) {
          state.filters.minPrice = min;
          state.filters.maxPrice = max;
        },

        resetFilters(state) {
          state.filters.search = "";
          state.filters.category = "all";
          state.filters.minPrice = 0;
          state.filters.maxPrice = 10;
        },

        addItem(state, item) {
          state.items.push(item);
        },
      });
    }

    it("filters items correctly", () => {
      const store = createFilterStore();

      // Initially all items should be shown
      expect(store.state.filteredItems.length).toBe(6);

      // Filter by search
      store.actions.updateSearch("a");
      expect(store.state.filteredItems.length).toBe(3); // Apple, Banana, Carrot

      // Reset and filter by category
      store.actions.resetFilters();
      store.actions.updateCategory("Fruit");
      expect(store.state.filteredItems.length).toBe(2); // Apple, Banana

      // Filter by price range
      store.actions.resetFilters();
      store.actions.updatePriceRange(5, 10);
      expect(store.state.filteredItems.length).toBe(2); // Chicken, Beef

      // Combined filters
      store.actions.resetFilters();
      store.actions.updateCategory("Vegetable");
      store.actions.updatePriceRange(1, 2);
      expect(store.state.filteredItems.length).toBe(1); // Broccoli
    });

    it("calculates statistics from filtered results", () => {
      const store = createFilterStore();

      // Initial stats with all items
      expect(store.state.stats.count).toBe(6);
      expect(store.state.stats.categories.length).toBe(3);
      expect(store.state.stats.avgPrice).toBeCloseTo(2.83, 1); // Average of all prices

      // Filter to just fruits
      store.actions.updateCategory("Fruit");
      expect(store.state.stats.count).toBe(2);
      expect(store.state.stats.categories).toEqual(["Fruit"]);
      expect(store.state.stats.avgPrice).toBeCloseTo(1.0, 1); // Average of fruit prices

      // Add a new fruit
      store.actions.addItem({
        id: 7,
        name: "Orange",
        category: "Fruit",
        price: 1.5,
      });
      expect(store.state.stats.count).toBe(3);
      expect(store.state.stats.avgPrice).toBeCloseTo(1.17, 1); // New average
    });

    it("handles empty results", () => {
      const store = createFilterStore();

      // Apply a filter that matches nothing
      store.actions.updateSearch("xyz");

      expect(store.state.filteredItems.length).toBe(0);
      expect(store.state.stats.count).toBe(0);
      expect(store.state.stats.avgPrice).toBe(0);
      expect(store.state.stats.categories).toEqual([]);
    });
  });

  describe("Computed Properties", () => {
    it("supports inline computed properties using computedProp", () => {
      const store = reify({
        count: 0,
        doubleCount(self) {
          return self.count * 2;
        },
      });

      expect(store.state.doubleCount).toBe(0);

      store.state.count = 5;
      expect(store.state.doubleCount).toBe(10);
    });

    it("handles nested computed properties", () => {
      const store = reify({
        user: {
          firstName: "John",
          lastName: "Doe",
          fullName(self, root) {
            console.log("[DEBUG in fullName] self=", self, "root=", root);
            return `${self.firstName} ${self.lastName}`;
          },
        },
      });

      expect(store.state.user.fullName).toBe("John Doe");

      store.state.user.lastName = "Smith";
      expect(store.state.user.fullName).toBe("John Smith");
    });

    it("supports chained computed properties", () => {
      const store = reify({
        count: 2,
        double(self) {
          return self.count * 2;
        },
        quadruple(self) {
          return self.double * 2;
        },
      });

      expect(store.state.double).toBe(4);
      expect(store.state.quadruple).toBe(8);

      store.state.count = 3;
      expect(store.state.double).toBe(6);
      expect(store.state.quadruple).toBe(12);
    });

    it("supports cross-object references via root parameter", () => {
      const store = reify({
        products: [
          { id: 1, price: 10 },
          { id: 2, price: 20 },
        ],
        cart: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
        totalPrice(self, root) {
          return self.cart.reduce((total, item) => {
            const product = root.products.find((p) => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
          }, 0);
        },
      });

      expect(store.state.totalPrice).toBe(40); // (10*2 + 20*1)

      store.state.products[0].price = 15;
      expect(store.state.totalPrice).toBe(50); // (15*2 + 20*1)

      store.state.cart[0].quantity = 3;
      expect(store.state.totalPrice).toBe(65); // (15*3 + 20*1)
    });

    it("detects and handles computed property dependencies correctly", () => {
      const computeSpy = vi.fn((self) => self.count * 2);

      const store = reify({
        count: 0,
        doubleCount: computedProp(computeSpy),
      });

      // Should not compute until accessed
      expect(computeSpy).not.toHaveBeenCalled();

      // First access triggers computation
      expect(store.state.doubleCount).toBe(0);
      expect(computeSpy).toHaveBeenCalledTimes(1);

      // Changing a dependency triggers recomputation on next access
      store.state.count = 5;
      expect(computeSpy).toHaveBeenCalledTimes(1); // Still 1 (lazy)

      // Next access after dependency change
      expect(store.state.doubleCount).toBe(10);
      expect(computeSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Effect Integration", () => {
    it("triggers effects when state changes", () => {
      const store = reify({ count: 0 });
      const effectSpy = vi.fn();

      const dispose = effect(() => {
        effectSpy(store.state.count);
      });

      expect(effectSpy).toHaveBeenCalledWith(0);

      store.state.count = 1;
      expect(effectSpy).toHaveBeenCalledWith(1);

      dispose();
      store.state.count = 2;
      expect(effectSpy).toHaveBeenCalledTimes(2); // No additional call
    });

    it("triggers effects when computed properties change", () => {
      const store = reify({
        count: 0,
        doubleCount(self) {
          return self.count * 2;
        },
      });

      const effectSpy = vi.fn();

      const dispose = effect(() => {
        effectSpy(store.state.doubleCount);
      });

      expect(effectSpy).toHaveBeenCalledWith(0);

      store.state.count = 5;
      expect(effectSpy).toHaveBeenCalledWith(10);

      dispose();
    });

    it("supports batching updates", () => {
      const store = reify({
        count: 0,
        doubleCount(self) {
          return self.count * 2;
        },
      });

      const effectSpy = vi.fn();

      const dispose = effect(() => {
        effectSpy(store.state.count, store.state.doubleCount);
      });

      expect(effectSpy).toHaveBeenCalledWith(0, 0);

      // Without batching, this would trigger the effect twice
      batch(() => {
        store.state.count = 5;
        store.state.count = 10;
      });

      // Effect should run only once after the batch
      expect(effectSpy).toHaveBeenCalledTimes(2);
      expect(effectSpy).toHaveBeenCalledWith(10, 20);

      dispose();
    });
  });

  describe("Shallow Objects", () => {
    it("properly handles shallow objects", () => {
      const data = { id: 1, nested: { value: 42 } };
      const store = reify({
        regularData: { ...data },
        shallowData: shallow({ ...data }),
      });

      // Both should have initial values
      expect(store.state.regularData.nested.value).toBe(42);
      expect(store.state.shallowData.nested.value).toBe(42);

      // Update deep property in regular data
      store.state.regularData.nested.value = 100;
      expect(store.state.regularData.nested.value).toBe(100);

      // Manually update deep property in shallow data
      store.state.shallowData.nested.value = 200;
      expect(store.state.shallowData.nested.value).toBe(200);
    });

    it("shallow objects do not trigger computed updates for nested changes", () => {
      const computeSpy = vi.fn((self) => self.shallowData.nested.value);

      const store = reify({
        shallowData: shallow({ nested: { value: 42 } }),
        derivedValue: computedProp(computeSpy),
      });

      // Initial computation
      expect(store.state.derivedValue).toBe(42);
      expect(computeSpy).toHaveBeenCalledTimes(1);

      // Update nested property in shallow data - no recomputation expected in SPA mode
      store.state.shallowData.nested.value = 100;

      // Value should remain old in SPA mode since the shallow object's changes don't trigger reactivity
      expect(store.state.derivedValue).toBe(42);
      expect(computeSpy).toHaveBeenCalledTimes(1);

      // Replace the entire shallow object - should trigger recomputation
      store.state.shallowData = { nested: { value: 200 } };
      expect(store.state.derivedValue).toBe(200);
      expect(computeSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Array Operations", () => {
    it("handles array mutations properly", () => {
      const store = reify({
        items: [1, 2, 3],
      });

      // Push
      store.state.items.push(4);
      expect(store.state.items).toEqual([1, 2, 3, 4]);

      // Pop
      const popped = store.state.items.pop();
      expect(popped).toBe(4);
      expect(store.state.items).toEqual([1, 2, 3]);

      // Splice
      const spliced = store.state.items.splice(1, 1, 22, 33);
      expect(spliced).toEqual([2]);
      expect(store.state.items).toEqual([1, 22, 33, 3]);

      // Array element assignment
      store.state.items[0] = 11;
      expect(store.state.items).toEqual([11, 22, 33, 3]);

      // Delete operator
      delete store.state.items[3];
      expect(store.state.items.length).toBe(4);
      expect(store.state.items[3]).toBeUndefined();
    });

    it("prevents whole array replacement for deep arrays", () => {
      const store = reify({
        items: [1, 2, 3],
      });

      expect(() => {
        store.state.items = [4, 5, 6];
      }).toThrow(/Whole array replacement is disallowed for deep arrays/);

      // Can still use the escape hatch to replace
      store.state.$items.value = [4, 5, 6];
      expect(store.state.items).toEqual([4, 5, 6]);
    });

    it("allows whole array replacement for shallow arrays", () => {
      const store = reify({
        items: shallow([1, 2, 3]),
      });

      store.state.items = [4, 5, 6];
      expect(store.state.items).toEqual([4, 5, 6]);
    });

    it("properly updates computed properties with array mutations", () => {
      const store = reify({
        items: [1, 2, 3],
        sum(self) {
          return self.items.reduce((sum, item) => sum + item, 0);
        },
      });

      expect(store.state.sum).toBe(6);

      store.state.items.push(4);
      expect(store.state.sum).toBe(10);

      store.state.items.pop();
      expect(store.state.sum).toBe(6);
    });
  });

  describe("Edge Cases", () => {
    it("handles circular references in state objects", () => {
      const circularObj = {};
      circularObj.self = circularObj;

      // Should not cause infinite recursion
      const store = reify({
        circular: shallow(circularObj),
      });

      expect(store.state.circular.self).toBe(circularObj);
    });

    it("handles error in computed property", () => {
      // Error in computed property should not crash
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const store = reify({
        willError: true,
        problematic(self) {
          if (self.willError) {
            throw new Error("Computed property error");
          }
          return 42;
        },
      });

      // Should return undefined and log error
      expect(store.state.problematic).toBeUndefined();
      expect(errorSpy).toHaveBeenCalled();

      // Fix the error condition and retry
      store.state.willError = false;
      expect(store.state.problematic).toBe(42);

      errorSpy.mockRestore();
    });

    it("handles dynamic property addition in permissive mode", () => {
      const store = reify({ initial: true }, { permissive: true });

      // Add new property
      store.state.dynamic = "added later";
      expect(store.state.dynamic).toBe("added later");
    });

    it("enforces strict mode by default", () => {
      const store = reify({ initial: true });

      // Attempt to add new property should throw
      expect(() => {
        store.state.dynamic = "should fail";
      }).toThrow(/Cannot add new property/);
    });

    it("rejects direct assignment of $ properties", () => {
      const store = reify({ count: 0 });

      expect(() => {
        store.state.$count = { value: 99 };
      }).toThrow(
        "Cannot directly set '$count'. Use the signal's 'value' property.",
      );
    });
  });

  describe("Actions API", () => {
    it("supports attaching actions", () => {
      const store = reify({ count: 0 }).attach({
        increment(state) {
          state.count++;
        },
        add(state, amount) {
          state.count += amount;
        },
      });

      store.actions.increment();
      expect(store.state.count).toBe(1);

      store.actions.add(10);
      expect(store.state.count).toBe(11);
    });

    it("supports async actions", async () => {
      const store = reify({ count: 0, loading: false }).attach({
        async fetchAndIncrease(state) {
          state.loading = true;
          await new Promise((resolve) => setTimeout(resolve, 10));
          state.count += 5;
          state.loading = false;
        },
      });

      const promise = store.actions.fetchAndIncrease();
      expect(store.state.loading).toBe(true);

      await promise;
      expect(store.state.count).toBe(5);
      expect(store.state.loading).toBe(false);
    });
  });

  describe("Serialization", () => {
    it("properly serializes state to JSON", () => {
      const store = reify({
        count: 0,
        user: { name: "John" },
        computed(self) {
          return self.count * 2;
        },
      });

      const json = JSON.stringify(store.state);
      const parsed = JSON.parse(json);

      // Should include regular properties
      expect(parsed.count).toBe(0);
      expect(parsed.user.name).toBe("John");

      // Should not include computed properties
      expect(parsed.computed).toBeUndefined();

      // Update and re-serialize
      store.state.count = 5;
      const updatedJson = JSON.stringify(store.state);
      const updatedParsed = JSON.parse(updatedJson);

      expect(updatedParsed.count).toBe(5);
    });
  });

  describe("Escape Hatch", () => {
    it("provides signal access via escape hatch", () => {
      const store = reify({ count: 0 });

      // Access the underlying signal
      const countSignal = store.state.$count;
      expect(countSignal.value).toBe(0);

      // Update via signal
      countSignal.value = 5;
      expect(store.state.count).toBe(5);
    });

    it("provides access to computed signals", () => {
      const store = reify({
        count: 0,
        double(self) {
          return self.count * 2;
        },
      });

      // Access computed signal
      const doubleSignal = store.state.$double;
      expect(doubleSignal.value).toBe(0);

      // Update dependency
      store.state.count = 5;
      expect(doubleSignal.value).toBe(10);
    });
  });
});

// Complex use case tests for SPA mode
describe("DeepState v2 Complex Use Cases (SPA Mode)", () => {
  describe("Task Dependencies Example", () => {
    // Create a store with tasks that have dependencies
    function isEnabled(self, root) {
      console.log("[DEBUG in isEnabled] self =", self, "root=", root);
      if (self.requirements.length === 0) return true;
      return self.requirements.every((req) => {
        const requiredTask = root.tasks.find((t) =>
          t.id === req.requiredTaskId
        );
        return requiredTask &&
          [req.requiredState, "completed"].includes(requiredTask.state);
      });
    }

    function createTaskStore() {
      return reify({
        tasks: [
          {
            id: 1,
            name: "Task 1",
            state: "pending",
            requirements: [],
            isEnabled,
          },
          {
            id: 2,
            name: "Task 2",
            state: "pending",
            requirements: [{ requiredTaskId: 1, requiredState: "ongoing" }],
            isEnabled,
          },
          {
            id: 3,
            name: "Task 3",
            state: "pending",
            requirements: [
              { requiredTaskId: 1, requiredState: "completed" },
              { requiredTaskId: 2, requiredState: "ongoing" },
            ],
            isEnabled,
          },
        ],
      }).attach({
        updateTaskState(state, taskId, newState) {
          const task = state.tasks.find((t) => t.id === taskId);
          if (task && task.isEnabled) {
            task.state = newState;
          }
        },
      });
    }

    it("correctly evaluates task dependencies", () => {
      const store = createTaskStore();

      // Task 1 is always enabled
      expect(store.state.tasks[0].isEnabled).toBe(true);

      // Task 2 requires Task 1 to be ongoing
      expect(store.state.tasks[1].isEnabled).toBe(false);

      // Update Task 1 state to ongoing
      store.actions.updateTaskState(1, "ongoing");
      expect(store.state.tasks[0].state).toBe("ongoing");
      expect(store.state.tasks[1].isEnabled).toBe(true);

      // Task 3 requires Task 1 to be completed and Task 2 to be ongoing
      expect(store.state.tasks[2].isEnabled).toBe(false);

      // Update Task 1 to completed
      store.actions.updateTaskState(1, "completed");
      expect(store.state.tasks[2].isEnabled).toBe(false); // Still needs Task 2

      // Update Task 2 to ongoing
      store.actions.updateTaskState(2, "ongoing");
      expect(store.state.tasks[2].isEnabled).toBe(true); // Now both conditions are met
    });

    it("prevents updating disabled tasks", () => {
      const store = createTaskStore();

      // Try to update Task 2 (should be disabled initially)
      store.actions.updateTaskState(2, "ongoing");
      expect(store.state.tasks[1].state).toBe("pending"); // Should not change

      // Enable Task 2 by updating Task 1
      store.actions.updateTaskState(1, "ongoing");

      // Now Task 2 can be updated
      store.actions.updateTaskState(2, "ongoing");
      expect(store.state.tasks[1].state).toBe("ongoing");
    });
  });

  describe("Shopping Cart Example", () => {
    function createCartStore() {
      return reify({
        products: [
          { id: 1, name: "Product 1", price: 10, stock: 5 },
          { id: 2, name: "Product 2", price: 20, stock: 3 },
          { id: 3, name: "Product 3", price: 30, stock: 0 },
        ],
        cart: [],
        cartTotal(self) {
          return self.cart.reduce((total, item) => {
            const product = self.products.find((p) => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
          }, 0);
        },
        cartCount(self) {
          return self.cart.reduce((count, item) => count + item.quantity, 0);
        },
        // Computed property that checks product availability
        productAvailability(self) {
          return self.products.map((product) => ({
            productId: product.id,
            inStock: product.stock > 0,
            availableQuantity: product.stock,
            canAddToCart: product.stock > (self.cart.find((item) =>
              item.productId === product.id
            )?.quantity || 0),
          }));
        },
      }).attach({
        addToCart(state, productId, quantity = 1) {
          const product = state.products.find((p) => p.id === productId);
          if (!product) return false;

          const currentItem = state.cart.find((item) =>
            item.productId === productId
          );
          const currentQuantity = currentItem?.quantity || 0;

          // Check if we have enough stock
          if (product.stock < currentQuantity + quantity) return false;

          if (currentItem) {
            currentItem.quantity += quantity;
          } else {
            state.cart.push({ productId, quantity });
          }

          return true;
        },

        removeFromCart(state, productId, quantity = 1) {
          const currentItem = state.cart.find((item) =>
            item.productId === productId
          );
          if (!currentItem) return false;

          if (currentItem.quantity <= quantity) {
            // Remove the whole item in place in the array
            const index = state.cart.findIndex((item) =>
              item.productId === productId
            );
            if (index > -1) {
              state.cart.splice(index, 1);
            }

            // state.$cart.value = state.cart.filter((item) =>
            //   item.productId !== productId
            // );
          } else {
            // Decrease quantity
            currentItem.quantity -= quantity;
          }

          return true;
        },

        checkout(state) {
          // Update product stock
          state.cart.forEach((item) => {
            const product = state.products.find((p) => p.id === item.productId);
            if (product) {
              product.stock -= item.quantity;
            }
          });

          // Clear cart; by setting length to 0 for in-place mutation
          // or use escape hatch to assign new empty array (e.g state.$cart = [])
          state.cart.length = 0; //[];

          return true;
        },
      });
    }

    it("calculates cart total correctly", () => {
      const store = createCartStore();

      // Add items to cart
      store.actions.addToCart(1, 2); // 2 of Product 1 ($10 each)
      store.actions.addToCart(2, 1); // 1 of Product 2 ($20 each)

      expect(store.state.cartTotal).toBe(40); // 2*$10 + 1*$20
      expect(store.state.cartCount).toBe(3); // 2 + 1
    });

    it("updates totals when cart changes", () => {
      const store = createCartStore();

      store.actions.addToCart(1, 1);
      expect(store.state.cartTotal).toBe(10);

      store.actions.addToCart(1, 1); // Add another
      expect(store.state.cartTotal).toBe(20);

      store.actions.removeFromCart(1, 1); // Remove one
      expect(store.state.cartTotal).toBe(10);
    });

    it("checks stock availability", () => {
      const store = createCartStore();

      // Initially Product 1 has 5 in stock
      expect(store.state.productAvailability[0].availableQuantity).toBe(5);

      // Add 3 to cart
      store.actions.addToCart(1, 3);

      // Should be 2 left
      expect(store.state.productAvailability[0].availableQuantity).toBe(5);
      expect(store.state.productAvailability[0].canAddToCart).toBe(true);

      // Try to add 3 more (should fail)
      const result = store.actions.addToCart(1, 3);
      expect(result).toBe(false);
      expect(store.state.cart.find((item) => item.productId === 1).quantity)
        .toBe(3);

      // Check that Product 3 is out of stock
      expect(store.state.productAvailability[2].inStock).toBe(false);
      expect(store.state.productAvailability[2].canAddToCart).toBe(false);
    });

    it("updates stock after checkout", () => {
      const store = createCartStore();

      store.actions.addToCart(1, 2);
      store.actions.addToCart(2, 1);

      // Before checkout
      expect(store.state.products[0].stock).toBe(5);
      expect(store.state.products[1].stock).toBe(3);

      store.actions.checkout();

      // After checkout
      expect(store.state.products[0].stock).toBe(3); // 5 - 2
      expect(store.state.products[1].stock).toBe(2); // 3 - 1
      expect(store.state.cart.length).toBe(0);
      expect(store.state.cartTotal).toBe(0);
    });
  });

  describe("Form Handling Example", () => {
    function createFormStore() {
      return reify({
        form: {
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        },
        touched: {
          username: false,
          email: false,
          password: false,
          confirmPassword: false,
        },
        validation(self) {
          return {
            username: self.form.username.length < 3
              ? "Username must be at least 3 characters"
              : "",
            email: !self.form.email.includes("@")
              ? "Invalid email address"
              : "",
            password: self.form.password.length < 8
              ? "Password must be at least 8 characters"
              : "",
            confirmPassword: self.form.password !== self.form.confirmPassword
              ? "Passwords do not match"
              : "",
          };
        },
        isValid(self, root) {
          // Check if all validation messages are empty
          return Object.values(root.validation).every((msg) => msg === "");
        },
        errors(self, root) {
          // Only return errors for touched fields
          const result = {};
          Object.keys(root.validation).forEach((field) => {
            if (self.touched[field] && root.validation[field]) {
              result[field] = root.validation[field];
            }
          });
          return result;
        },
      }).attach({
        updateField(state, field, value) {
          if (field in state.form) {
            state.form[field] = value;
            state.touched[field] = true;
          }
        },

        resetForm(state) {
          // Reset form fields
          Object.keys(state.form).forEach((key) => {
            state.form[key] = "";
          });

          // Reset touched state
          Object.keys(state.touched).forEach((key) => {
            state.touched[key] = false;
          });
        },

        submitForm(state) {
          // Mark all fields as touched
          Object.keys(state.touched).forEach((key) => {
            state.touched[key] = true;
          });

          // Only proceed if valid
          return state.isValid;
        },
      });
    }

    it("validates form fields correctly", () => {
      const store = createFormStore();

      // Initially all validations should fail
      expect(store.state.validation.username).toBeTruthy();
      expect(store.state.validation.email).toBeTruthy();
      expect(store.state.validation.password).toBeTruthy();

      // But no errors should be shown (not touched)
      expect(Object.keys(store.state.errors).length).toBe(0);

      // Update username field
      store.actions.updateField("username", "jo");

      // Validation should still fail
      expect(store.state.validation.username).toBeTruthy();

      // Now we should see the error (field was touched)
      expect(store.state.errors.username).toBeTruthy();

      // Fix the username
      store.actions.updateField("username", "john");

      // Validation should pass
      expect(store.state.validation.username).toBe("");
      expect(store.state.errors.username).toBeUndefined();

      // Form should still be invalid overall
      expect(store.state.isValid).toBe(false);
    });

    it("checks password matching", () => {
      const store = createFormStore();

      // Set valid values for all fields except confirmPassword
      store.actions.updateField("username", "john");
      store.actions.updateField("email", "john@example.com");
      store.actions.updateField("password", "password123");

      // Form should still be invalid (confirmPassword doesn't match)
      expect(store.state.isValid).toBe(false);

      // Set matching confirmPassword
      store.actions.updateField("confirmPassword", "password123");

      // Now form should be valid
      expect(store.state.isValid).toBe(true);

      // Change password but not confirmPassword
      store.actions.updateField("password", "newpassword123");

      // Form should become invalid again
      expect(store.state.isValid).toBe(false);
      expect(store.state.validation.confirmPassword).toBeTruthy();
    });

    it("handles form submission", () => {
      const store = createFormStore();

      // Try to submit invalid form
      const invalidResult = store.actions.submitForm();

      // Should return false and mark all fields as touched
      expect(invalidResult).toBe(false);
      expect(Object.values(store.state.touched).every((t) => t === true)).toBe(
        true,
      );

      // All errors should now be visible
      expect(Object.keys(store.state.errors).length).toBeGreaterThan(0);

      // Fill out the form correctly
      store.actions.updateField("username", "john");
      store.actions.updateField("email", "john@example.com");
      store.actions.updateField("password", "password123");
      store.actions.updateField("confirmPassword", "password123");

      // Submit again
      const validResult = store.actions.submitForm();

      // Should return true
      expect(validResult).toBe(true);
    });

    it("resets the form", () => {
      const store = createFormStore();

      // Fill out some fields
      store.actions.updateField("username", "john");
      store.actions.updateField("email", "john@example.com");

      // Reset the form
      store.actions.resetForm();

      // Fields should be empty
      expect(store.state.form.username).toBe("");
      expect(store.state.form.email).toBe("");

      // Touched state should be reset
      expect(Object.values(store.state.touched).every((t) => t === false)).toBe(
        true,
      );

      // No errors should be visible
      expect(Object.keys(store.state.errors).length).toBe(0);
    });
  });
});
