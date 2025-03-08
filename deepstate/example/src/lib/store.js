import { reify } from "@m5nv/deepstate";
// @ts-check

// FIXME: broken contract
function on_change(state) {
  console.log("onchange-callback: ..." /** , state*/);
}

/**
 * Factory function to create a TodoStore from raw state.
 * Rehydrates the store on the client, attaching actions that reference the store.
 */
export function CreateTodoStore(initial) {
  const todo_store = reify(
    initial,
    {
      pending_count: (state) =>
        state.todos.filter((todo) => !todo.completed).length,
      completed_count: (state) =>
        state.todos.filter((todo) => todo.completed).length,
    },
  );

  todo_store.attach(
    {
      async add_todo(state, text) {
        const new_todo = { id: Date.now(), text, completed: false };
        state.todos = [...state.todos, new_todo];
      },
      async remove_todo(state, id) {
        state.todos = state.todos.filter((todo) => todo.id !== id);
      },
      async toggle_todo(state, id) {
        const todo = state.todos.find((todo) => todo.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      },
      async update_todo(state, id, new_text) {
        const todo = state.todos.find((todo) => todo.id === id);
        if (todo) {
          todo.text = new_text;
        }
      },
      async update_title(state, new_title) {
        state.title = new_title;
      },
    },
  );

  return todo_store;
}
