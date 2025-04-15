import { reify } from "@m5nv/deepstate";
import { useSignal } from "@preact/signals";
import { useState } from "preact/hooks";

import renderComponent from "./render-component.jsx";

const store = reify(
  {
    todos: [
      { text: "Write my first post", completed: true },
      { text: "Buy new groceries", completed: false },
      { text: "Walk the dog", completed: false },
    ],
    draft: "",
    completedCount: (state) =>
      state.todos.filter((todo) => todo.completed).length,
  },
);

store.attach({
  addTodo(state, e) {
    e.preventDefault();

    state.todos.push({ text: state.draft, completed: false });
    state.draft = ""; // Reset input value on add
  },
  removeTodo(state, index) {
    state.todos.splice(index, 1);
  },
});

export function TodoListWithoutId() {
  const { state, actions } = store;
  const onInput = (event) => (state.draft = event.target.value);

  return (
    <section class="grid bg-white shadow-lg p-8 w-full px-40">
      <form class="grid justify-center gap-6" onSubmit={actions.addTodo}>
        <div class="grid grid-cols-2 grid-rows-1 gap-2">
          <input
            type="text"
            class="border-1 border-solid rounded-md w-40"
            value={state.draft}
            onInput={onInput}
          />
          <button
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
            onClick={actions.addTodo}
          >
            Add
          </button>
        </div>
        <ul class="grid grid-cols-1 gap-8">
          {state.todos.map((todo, index) => (
            <li class="grid grid-cols-2 gap-4">
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onInput={() => {
                    todo.completed = !todo.completed;
                    // state.todos = [...state.todos];
                  }}
                />
                {todo.completed ? <s>{todo.text}</s> : todo.text}
              </label>{" "}
              <button
                type="button"
                onClick={() => actions.removeTodo(index)}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
        <p class="mt-4 text-sm text-gray-500">
          Completed: {state.completedCount}
        </p>
      </form>
    </section>
  );
}

////////////// TodoList - With Id //////////////////////
/**
 * Factory function to create a TodoStore from raw state.
 * Rehydrates the store on the client, attaching actions that reference the store.
 */
export function CreateTodoStore(initial) {
  const todo_store = reify(
    {
      ...initial,
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
        // state.todos = [...state.todos, new_todo];
        state.todos.push(new_todo);
      },
      async remove_todo(state, id) {
        // state.todos = state.todos.filter((todo) => todo.id !== id);
        const index = state.todos.findIndex((todo) => todo.id === id);
        if (index > -1) {
          state.todos.splice(index, 1);
        }
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

// Component for editing the title
function TitleEditor({ store }) {
  console.log("todo.list.title");

  const is_editing = useSignal(false);
  const edit_title = useSignal(store.state.title);

  function handle_save() {
    store.actions.update_title(edit_title.value);
    is_editing.value = false;
  }

  return (
    <div class="flex items-center">
      <span class="text-blue-500 text-2xl w-8 h-8 mr-4">📝</span>

      {is_editing.value
        ? (
          <input
            type="text"
            value={edit_title}
            onInput={(e) => (edit_title.value = e.target.value)}
            onBlur={handle_save}
            onKeyDown={(e) => e.key === "Enter" && handle_save()}
            class="text-3xl font-medium text-gray-700 bg-transparent border-b border-gray-300 focus:outline-none"
            autoFocus
          />
        )
        : (
          <h1 class="text-3xl font-medium text-gray-700">
            {store.state.title}
          </h1>
        )}

      <button
        onClick={() => {
          is_editing.value = true;
          edit_title.value = store.state.title;
        }}
        class="ml-2 text-gray-500 hover:text-gray-700"
        title="Edit title"
      >
        ✎
      </button>
    </div>
  );
}

// Component for each todo item
function TodoItem({ todo, actions }) {
  console.log("todo.list.item");

  const is_editing = useSignal(false);
  const edit_text = useSignal(todo.text);

  const { update_todo, toggle_todo, remove_todo } = actions;

  function handle_save() {
    update_todo(todo.id, edit_text.value);
    is_editing.value = false;
  }

  return (
    <li key={todo.id} class="flex items-center py-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggle_todo(todo.id)}
        class="sr-only"
      />
      <span
        class={`w-8 h-8 rounded-full flex items-center justify-center mr-4 border cursor-pointer ${
          todo.completed
            ? "bg-emerald-500 text-white border-emerald-500"
            : "bg-gray-100 border-gray-300"
        }`}
        onClick={() => toggle_todo(todo.id)}
      >
        {todo.completed && <span class="text-xl">✓</span>}
      </span>
      {is_editing.value
        ? (
          <input
            type="text"
            value={edit_text.value}
            onInput={(e) => (edit_text.value = e.target.value)}
            onBlur={handle_save}
            onKeyDown={(e) => e.key === "Enter" && handle_save()}
            class="text-lg flex-grow bg-transparent border-b border-gray-300 focus:outline-none"
            autoFocus
          />
        )
        : (
          <span
            class={`text-lg flex-grow cursor-pointer ${
              todo.completed ? "line-through text-gray-400" : "text-gray-700"
            }`}
            onClick={() => toggle_todo(todo.id)}
          >
            {todo.text}
          </span>
        )}
      <button
        onClick={() => {
          is_editing.value = true;
          edit_text.value = todo.text;
        }}
        class="ml-2 text-gray-500 hover:text-gray-700"
        title="Edit"
      >
        ✎
      </button>
      <button
        onClick={() => remove_todo(todo.id)}
        class="ml-2 text-red-500 hover:text-red-700"
        title="Delete"
      >
        🗑
      </button>
    </li>
  );
}

// Component for status counts
function Status({ store }) {
  console.log("todo.list.status");

  const { pending_count, completed_count } = store.state;

  return (
    <div class="flex gap-2 mt-4 text-sm text-gray-500">
      <p>Pending: {pending_count}</p>
      <p>Completed: {completed_count}</p>
    </div>
  );
}

// Component for the list of todos
function Todos({ store }) {
  console.log("todo.list.todos");

  const { state: { todos }, actions } = store;

  return (
    <ul class="space-y-1">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} actions={actions} />
      ))}
    </ul>
  );
}

const initial = {
  title: "Live well and prosper",
  draft: "",
  todos: [
    { id: 1, text: "Weed front garden.", completed: true },
    { id: 2, text: "Chill and smoke some Old Toby.", completed: true },
    { id: 3, text: "Keep ring secret and safe.", completed: false },
    { id: 4, text: "Meet Gandalf at Bree.", completed: false },
    { id: 5, text: "Destroy ring and defeat dark lord.", completed: false },
  ],
};

// Main TodoList component
function TodoListWithId() {
  const [todo_store] = useState(() => CreateTodoStore(initial));

  const { state, actions } = todo_store;

  function handle_new_task_keydown(e) {
    if (e.key === "Enter" && state.draft.trim()) {
      actions.add_todo(state.draft.trim()).then(() => {
        state.draft = "";
      });
      // state.draft = "";
    }
  }

  return (
    <section class="bg-white shadow-lg p-8 w-full px-40">
      <header class="mb-6">
        <TitleEditor store={todo_store} />
      </header>
      <Todos store={todo_store} />
      <div class="mt-6">
        <label class="flex items-center text-gray-400">
          <span class="text-2xl mr-2">+</span>
          <input
            type="text"
            placeholder="add a new task and hit enter"
            class="bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1"
            value={state.draft}
            onInput={(e) => (state.draft = e.target.value)}
            onKeyDown={handle_new_task_keydown}
          />
        </label>
      </div>
      <Status store={todo_store} />
    </section>
  );
}

const codeJSX = `function MyComponent(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This is an example Preact component.</p>
    </div>
  );
}`;

export default function TodoExampleContent() {
  return (
    <main class="p-4">
      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">TodoList - With Id</h2>
        {renderComponent(TodoListWithId, codeJSX)}
      </section>

      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">
          TodoList - Without Id
        </h2>
        {renderComponent(TodoListWithoutId, codeJSX)}
      </section>
    </main>
  );
}
