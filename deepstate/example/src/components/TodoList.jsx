import { reify } from "@m5nv/deepstate";
import { CreateTodoStore } from "@lib/store";
import { useSignal } from "@preact/signals";
import { useState } from "preact/hooks";

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

function CounterApp() {
  const [{ state: counter }] = useState(() =>
    reify(
      { count: 0 },
      { double: (state) => state.count * 2 },
    )
  );

  return (
    <div class="ml-2 text-red-500 hover:text-red-700">
      <p>{counter.count} x 2 = {counter.double}</p>
      <button onClick={() => (counter.count++)}>Click me</button>
    </div>
  );
}

// Main TodoList component
export function TodoList({ initial }) {
  const [todo_store] = useState(() => CreateTodoStore(initial));

  const { state, actions } = todo_store;

  function handle_new_task_keydown(e) {
    if (e.key === "Enter" && state.draft.trim()) {
      actions.add_todo(state.draft.trim());
      state.draft = "";
    }
  }

  return (
    <div class="flex flex-col  justify-center items-center min-h-screen bg-gray-50">
      <section class="bg-white rounded-3xl shadow-lg p-8 w-full max-w-fit">
        <CounterApp />
      </section>
      <section class="bg-white rounded-3xl shadow-lg p-8 w-full max-w-fit">
        <header class="mb-6">
          <TitleEditor store={todo_store} />
        </header>
        <Todos store={todo_store} />
        <div class="mt-6">
          <label class="flex items-center text-gray-400">
            <span class="text-2xl mr-2">+</span>
            <input
              type="text"
              placeholder="add a new task"
              class="bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1"
              value={state.draft}
              onInput={(e) => (state.draft = e.target.value)}
              onKeyDown={handle_new_task_keydown}
            />
          </label>
        </div>
        <Status store={todo_store} />
      </section>
    </div>
  );
}
