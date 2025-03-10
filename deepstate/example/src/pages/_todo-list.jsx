import { reify } from "@m5nv/deepstate";

const store = reify(
  {
    todos: [
      { text: "Write my first post", completed: true },
      { text: "Buy new groceries", completed: false },
      { text: "Walk the dog", completed: false },
    ],
    draft: "",
  },
  {
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

export function TodoList() {
  const { state, actions } = store;
  const onInput = (event) => (state.draft = event.target.value);

  return (
    <form onSubmit={actions.addTodo}>
      <input type="text" value={state.draft} onInput={onInput} />
      <button onClick={actions.addTodo}>Add</button>
      <ul>
        {state.todos.map((todo, index) => (
          <li>
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
            <button type="button" onClick={() => actions.removeTodo(index)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
      <p>Completed count: {state.completedCount}</p>
    </form>
  );
}
