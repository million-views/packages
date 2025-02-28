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
      add_todo(store, text) {
        const new_todo = { id: Date.now(), text, completed: false };
        store.state.todos = [...store.state.todos, new_todo];
      },
      remove_todo(store, id) {
        store.state.todos = store.state.todos.filter((todo) => todo.id !== id);
      },
      toggle_todo(store, id) {
        const todo = store.state.todos.find((todo) => todo.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      },
      update_todo(store, id, new_text) {
        const todo = store.state.todos.find((todo) => todo.id === id);
        if (todo) {
          todo.text = new_text;
        }
      },
      update_title(store, new_title) {
        store.state.title = new_title;
      },
    },
  );

  return todo_store;
}
