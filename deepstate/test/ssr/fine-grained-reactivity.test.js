import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effect } from "@preact/signals-core";
import { reify } from "@m5nv/deepstate/core";

/// NOTE: this test suite is exclusively designed for SSR mode and won't make
/// sense to run in SPA mode as is.
describe("DeepState v2 Fine-Grained Reactivity (Todos, SSR mode)", () => {
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
    // NO spies or effects needed for SSR
  });

  it("should correctly initialize state and calculate initial computed value", () => {
    // Assert initial state structure and values
    expect(store.state.todos).toHaveLength(3);
    expect(store.state.todos[0].text).toBe("Write my first post");
    expect(store.state.todos[0].completed).toBe(true);
    expect(store.state.todos[1].completed).toBe(false);
    expect(store.state.draft).toBe("");

    // Assert initial computed value (SSRComputed calculates on access)
    expect(store.state.completedCount).toBe(1);
  });

  it("should reflect state changes directly after an action", () => {
    const initialCount = store.state.completedCount; // is 1
    expect(store.state.todos[1].completed).toBe(false); // Pre-condition

    // Act: Toggle item 2 (index 1)
    store.actions.toggleTodo(1);

    // Assert: Check the state *values* directly
    expect(store.state.todos[1].completed).toBe(true); // Item 2 changed
    expect(store.state.todos[0].completed).toBe(true); // Item 1 unaffected
    expect(store.state.todos[2].completed).toBe(false); // Item 3 unaffected

    // Assert computed value recalculates correctly on access
    expect(store.state.completedCount).toBe(initialCount + 1); // Count changed (1 -> 2)
  });

  it("should reflect added item and unchanged computed count after adding incomplete item", () => {
    const initialCount = store.state.completedCount; // is 1
    const initialLength = store.state.todos.length; // is 3

    // Act: Add item (completed = false)
    store.actions.addTodo("New Task");

    // Assert: Check list length and new item's state
    expect(store.state.todos).toHaveLength(initialLength + 1);
    const newTask = store.state.todos[initialLength]; // Get the new item
    expect(newTask.text).toBe("New Task");
    expect(newTask.completed).toBe(false);

    // Assert: Computed count remains unchanged
    expect(store.state.completedCount).toBe(initialCount); // Count value is still 1
  });

  it("should reflect removed item and unchanged computed count after removing incomplete item", () => {
    const initialCount = store.state.completedCount; // is 1
    const initialLength = store.state.todos.length; // is 3
    const idToRemove = store.state.todos[1].id; // ID of item being removed (id=2)

    // Act: Remove item 1 (id=2, "Buy new groceries", completed=false initially)
    store.actions.removeTodo(1);

    // Assert: List structure changed, specific item is gone
    expect(store.state.todos).toHaveLength(initialLength - 1);
    expect(store.state.todos.find((t) => t.id === idToRemove)).toBeUndefined();

    // Assert: Computed count remains unchanged
    expect(store.state.completedCount).toBe(initialCount); // Count is still 1
  });

  it("should reflect added item and updated computed count after adding/modifying completed item", () => {
    const initialCount = store.state.completedCount; // is 1
    const initialLength = store.state.todos.length; // is 3

    // Act: Add item and mark completed
    store.actions.addTodo("New Completed Task");
    // Need to access the newly added item to modify it
    const newIndex = store.state.todos.length - 1; // Should be index 3
    expect(store.state.todos).toHaveLength(initialLength + 1); // Verify length first
    store.state.todos[newIndex].completed = true; // Mark last as completed

    // Assert: List changed AND count changed
    expect(store.state.todos[newIndex].text).toBe("New Completed Task");
    expect(store.state.todos[newIndex].completed).toBe(true);
    expect(store.state.completedCount).toBe(initialCount + 1); // Count value is now 2
  });

  it("should reflect removed item and updated computed count after removing completed item", () => {
    const initialCount = store.state.completedCount; // is 1
    const initialLength = store.state.todos.length; // is 3
    const idToRemove = store.state.todos[0].id; // id=1, completed=true

    // Act: Remove item 0
    store.actions.removeTodo(0);

    // Assert: List structure changed AND count changed
    expect(store.state.todos).toHaveLength(initialLength - 1);
    expect(store.state.todos.find((t) => t.id === idToRemove)).toBeUndefined();
    expect(store.state.completedCount).toBe(initialCount - 1); // Count is now 0
  });

  it("should produce a correct JSON snapshot (excluding computeds)", () => {
    store.actions.toggleTodo(1);
    store.state.draft = "Testing snapshot";
    const snapshot = store.toJSON();
    expect(snapshot).toEqual({ // NO completedCount expected
      todos: [
        { id: 1, text: "Write my first post", completed: true },
        { id: 2, text: "Buy new groceries", completed: true },
        { id: 3, text: "Walk the dog", completed: false },
      ],
      draft: "Testing snapshot",
    });
  });

  it("should produce a correct snapshot (including computeds)", () => {
    store.actions.toggleTodo(1); // completedCount becomes 2
    store.state.draft = "Testing snapshot";
    const snap = store.snapshot(); // Use snapshot() method
    expect(snap).toEqual({ // completedCount IS expected
      todos: [
        { id: 1, text: "Write my first post", completed: true },
        { id: 2, text: "Buy new groceries", completed: true },
        { id: 3, text: "Walk the dog", completed: false },
      ],
      draft: "Testing snapshot",
      completedCount: 2, // Expect computed value here
    });
  });
});
