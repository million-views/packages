import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effect } from "@preact/signals-core";
import { reify } from "@m5nv/deepstate/core";

/// NOTE: this test suite is exclusively designed for SPA mode and won't make
/// sense to run in SSR mode as is.
describe("DeepState v2 Fine-Grained Reactivity (Todos, SPA mode)", () => {
  // Helper to create store with inline computed for V2
  const createTodoStore = () => {
    return reify({
      todos: [
        { id: 1, text: "Write my first post", completed: true },
        { id: 2, text: "Buy new groceries", completed: false },
        { id: 3, text: "Walk the dog", completed: false },
      ],
      draft: "",
      // Inline computed
      completedCount(self) {
        // This depends on iterating and reading 'completed' for all items
        return self.todos.filter((todo) => todo.completed).length;
      },
    }).attach({
      addTodo(state, text) {
        if (!text) return;
        state.todos.push({ text: text, completed: false, id: Date.now() });
        state.draft = "";
      },
      removeTodo(state, index) {
        state.todos.splice(index, 1);
      },
      setDraft(state, value) {
        state.draft = value;
      },
      // Action to toggle specific item - easier to call than direct mutation in test
      toggleTodo(state, index) {
        const todo = state.todos[index];
        if (todo) {
          todo.completed = !todo.completed;
        }
      },
    });
  };

  // --- Test Setup ---
  let store;
  let listRenderSpy; // Simulates list component render
  let itemRenderSpies = {}; // Simulates individual item renders
  let countRenderSpy; // Simulates count display render
  let disposeEffects = []; // To clean up effects

  beforeEach(() => {
    store = createTodoStore();
    listRenderSpy = vi.fn();
    // Reset spies - assuming initial IDs are stable for keys
    itemRenderSpies = {
      1: vi.fn(), // Use ID as key
      2: vi.fn(),
      3: vi.fn(),
    };
    countRenderSpy = vi.fn();
    disposeEffects = [];

    // Effect simulating list render (depends on array structure/identity)
    disposeEffects.push(effect(() => {
      // Reading .length establishes dependency on length changes (push/splice)
      // Mapping reads items, establishing dependency on item signals IF their props are read
      const ids = store.state.todos.map((t) => t.id); // Reads ids (likely stable signals)
      listRenderSpy(ids);
    }));

    // Effects simulating individual item renders based on ID
    store.state.todos.forEach((todoItem) => {
      // IMPORTANT: Need to find item reactively if list can change order/content
      // For stable list, accessing by initial index might work, but find is safer
      const id = todoItem.id; // Get stable ID
      disposeEffects.push(effect(() => {
        const currentTodo = store.state.todos.find((t) => t.id === id); // Find item reactively
        if (currentTodo && itemRenderSpies[id]) {
          // Read properties the item component would use
          const data = {
            text: currentTodo.text,
            completed: currentTodo.completed,
          };
          itemRenderSpies[id](data);
        } else if (itemRenderSpies[id]) {
          itemRenderSpies[id](null); // Item removed
        }
      }));
    });

    // Effect simulating count render
    disposeEffects.push(effect(() => {
      const count = store.state.completedCount;
      countRenderSpy(count);
    }));

    // Reset spies to ignore initial setup runs
    listRenderSpy.mockClear();
    Object.values(itemRenderSpies).forEach((spy) => spy?.mockClear()); // Handle potential undefined spies if setup changes
    countRenderSpy.mockClear();
  });

  // Cleanup effects after each test
  afterEach(() => {
    disposeEffects.forEach((dispose) => dispose());
    disposeEffects = [];
  });

  it("should only trigger effect for the specific item changed", () => {
    expect(listRenderSpy).toHaveBeenCalledTimes(0);
    expect(itemRenderSpies[1]).toHaveBeenCalledTimes(0);
    expect(itemRenderSpies[2]).toHaveBeenCalledTimes(0);
    expect(itemRenderSpies[3]).toHaveBeenCalledTimes(0);
    expect(countRenderSpy).toHaveBeenCalledTimes(0);

    // Act: Toggle item 2 ("Buy new groceries") -> completed: true
    store.actions.toggleTodo(1); // Use index 1 for the second item

    // Assert: Only item 2's effect and the count effect should run
    expect(listRenderSpy).toHaveBeenCalledTimes(0); // List structure/length unchanged
    expect(itemRenderSpies[1]).toHaveBeenCalledTimes(0); // Item 1 (id=1) unaffected
    expect(itemRenderSpies[2]).toHaveBeenCalledTimes(1); // Item 2 (id=2) changed
    expect(itemRenderSpies[2]).toHaveBeenLastCalledWith({
      text: "Buy new groceries",
      completed: true,
    });
    expect(itemRenderSpies[3]).toHaveBeenCalledTimes(0); // Item 3 (id=3) unaffected
    expect(countRenderSpy).toHaveBeenCalledTimes(1); // Count changed (1 -> 2)
    expect(countRenderSpy).toHaveBeenLastCalledWith(2);
  });

  // Renamed description to reflect actual correct behavior
  it("should trigger list effect but not count effect when adding an incomplete item", () => {
    expect(listRenderSpy).toHaveBeenCalledTimes(0);
    expect(countRenderSpy).toHaveBeenCalledTimes(0);
    const initialCount = store.state.completedCount; // Should be 1 initially

    // Act: Add item (completed = false)
    store.actions.addTodo("New Task");

    // Assert: List structure changed, but count value did not
    expect(listRenderSpy).toHaveBeenCalledTimes(1); // List effect ran
    expect(store.state.completedCount).toBe(initialCount); // Count value is still 1
    // ** FIX: Expect countRenderSpy NOT to be called **
    expect(countRenderSpy).toHaveBeenCalledTimes(0);
  });

  // Renamed description to reflect actual correct behavior
  it("should trigger list effect but not count effect when removing an incomplete item", () => {
    expect(listRenderSpy).toHaveBeenCalledTimes(0);
    expect(countRenderSpy).toHaveBeenCalledTimes(0);
    const initialCount = store.state.completedCount; // Should be 1 initially

    // Act: Remove item 1 (id=2, "Buy new groceries", completed=false initially)
    store.actions.removeTodo(1);

    // Assert: List structure changed, count also re-evaluated but value is same
    expect(listRenderSpy).toHaveBeenCalledTimes(1);
    expect(store.state.completedCount).toBe(initialCount); // Count is still 1
    // ** FIX: Expect countRenderSpy NOT to be called **
    expect(countRenderSpy).toHaveBeenCalledTimes(0);
  });

  it("should trigger list AND count effects when adding a completed item", () => {
    const initialCount = store.state.completedCount; // is 1
    listRenderSpy.mockClear(); // Clear from initial reads if any leaked
    countRenderSpy.mockClear();

    // Act: Add item and mark completed
    store.actions.addTodo("New Completed Task");
    store.state.todos[store.state.todos.length - 1].completed = true; // Mark last as completed

    // Assert: List changed AND count changed
    expect(listRenderSpy).toHaveBeenCalledTimes(1); // List structure changed
    expect(store.state.completedCount).toBe(initialCount + 1); // Count value is now 2
    expect(countRenderSpy).toHaveBeenCalledTimes(1); // Count effect SHOULD run
    expect(countRenderSpy).toHaveBeenLastCalledWith(initialCount + 1);
  });

  it("should trigger list AND count effects when removing a completed item", () => {
    const initialCount = store.state.completedCount; // is 1
    listRenderSpy.mockClear();
    countRenderSpy.mockClear();

    // Act: Remove item 0 (id=1, completed=true initially)
    store.actions.removeTodo(0);

    // Assert: List structure changed AND count changed
    expect(listRenderSpy).toHaveBeenCalledTimes(1);
    expect(store.state.completedCount).toBe(initialCount - 1); // Count is now 0
    expect(countRenderSpy).toHaveBeenCalledTimes(1); // Count effect SHOULD run
    expect(countRenderSpy).toHaveBeenLastCalledWith(initialCount - 1);
  });
});
