import React, { useState } from "react";
import { reify } from "@m5nv/deepstate/react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Adjust path if needed
import { Input } from "@/components/ui/input"; 
import { Checkbox } from "@/components/ui/checkbox";
import { FilePenLine, Pencil, Trash2, Plus } from 'lucide-react';

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

/**
 * Factory function to create a TodoStore from raw state.
 * Rehydrates the store on the client, attaching actions that reference the store.
 */
// export function CreateTodoStore(initial) {
//   const todo_store = reify(
//     {
//       ...initial,
//       pending_count(self) {
//         return self.todos.filter((todo) => !todo.completed).length;
//       },
//       completed_count (self) {
//         return self.todos.filter((todo) => todo.completed).length;
//       }
//     }
//   );

//   todo_store.attach(
//     {
//       async add_todo(state) {
//         console.log ('**** add_todo - draft: ', state.draft);
//         const new_todo = { id: Date.now(), text: state.draft, completed: false };
//         // state.todos = [...state.todos, new_todo];
//         state.todos.push(new_todo);
//         console.log ('todos.length: ', state.todos.length);
//       },
//       async remove_todo(state, id) {
//         // state.todos = state.todos.filter((todo) => todo.id !== id);
//         const index = state.todos.findIndex((todo) => todo.id === id);
//         if (index > -1) {
//           state.todos.splice(index, 1);
//         }
//       },
//       async toggle_todo(state, id) {
//         const todo = state.todos.find((todo) => todo.id === id);
//         if (todo) {
//           todo.completed = !todo.completed;
//         }
//       },
//       async update_todo(state, id, new_text) {
//         // console.log ('**** update_todo - id, new_text: ', id, new_text);
//         const todo = state.todos.find((todo) => todo.id === id);
//         if (todo) {
//           todo.text = new_text;
//         }
//       },
//       async update_title(state, new_title) {
//         state.title = new_title;
//       },
//     },
//   );

//   return todo_store;
// }

const todo_store = reify(
  {
  ...initial,
  pending_count(self) {
    return self.todos.filter((todo) => !todo.completed).length;
  },
  completed_count(self) {
    return self.todos.filter((todo) => todo.completed).length;
  }
});

todo_store.attach(
  {
    async add_todo(state) {
      const new_todo = { id: Date.now(), text: state.draft, completed: false };
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


// Component for editing the title
function TitleEditor({ store }) {
  console.log("store.state.title");

  const title_store = reify (
    {
      is_editing: 'false',
      edit_title: store.state.title
    }
  )

  // const is_editing = useSignal(false);
  // const edit_title = useSignal(store.state.title);

  const { is_editing, edit_title } = title_store.state;

  function handle_save() {
    store.actions.update_title(edit_title);
    title_store.is_editing = false;
  }

  return (
    // Use flexbox for layout, add gap for spacing
    <div className="flex w-full items-center gap-x-3">

      {/* Icon: Use Lucide icon, adjust size and color as needed */}
      <FilePenLine className="h-6 w-6 text-blue-500 flex-shrink-0" aria-hidden="true" />

      {/* Flex grow container for the title/input to take available space */}
      <div className="flex-grow min-w-0">
        {is_editing
          ? (
            // Input field using Shadcn's Input component
            <Input
              type="text"
              value={edit_title}
              // --- Original Event Handlers (Direct Mutation) ---
              onInput={(e) => (store.edit_title = e.target.value)}
              onBlur={handle_save}
              onKeyDown={(e) => e.key === "Enter" && handle_save()}
              // --- End of Original Event Handlers ---
              className="text-2xl font-medium h-10" // Adjust text size/height as desired
              autoFocus
            />
          )
          : (
            // Display title using h1, styled with Tailwind utilities
            // Added truncate for long titles
            <h1
              className="text-2xl font-medium text-foreground truncate"
              title={store.state.title} // Show full title on hover if truncated
            >
              {store.state.title}
            </h1>
          )}
      </div>

      {/* Edit button using Shadcn's Button component */}
      <Button
        variant="ghost" // Minimal styling
        size="icon"     // Square button suitable for an icon
        // --- Original Event Handler (Direct Mutation) ---
        onClick={() => {
          store.is_editing = true;
          store.edit_title = store.state.title;
        }}
        // --- End of Original Event Handler ---
        title="Edit title" // Tooltip on hover
        className="flex-shrink-0" // Prevent shrinking
      >
        <Pencil className="h-4 w-4" /> {/* Edit icon */}
      </Button>
    </div>
  );
}

// Component for each todo item
function TodoItem({ todo, actions }) {
  console.log("todo.list.item", todo, todo.text);

  // const is_editing = useSignal(false);
  // const edit_text = useSignal(todo.text);

  const item_store = reify ( 
    {
      is_editing: 'false',
      edit_text: todo.text
    }
  );

  const titem = item_store.state;
  const { $is_editing, $edit_text } = titem;
  const { update_todo, toggle_todo, remove_todo } = actions;

  const textId = `todo-text-${todo.id}`; // Unique ID for aria association

  function handle_save() {
    update_todo(todo.id, titem.edit_text);
    titem.is_editing = false;
  }

  return (
    <li key={todo.id} className="flex w-full items-center gap-x-3 py-2"> {/* Use flex gap */}

      {/* Shadcn Checkbox - replaces hidden input and custom span */}
      <Checkbox
        id={`todo-checkbox-${todo.id}`} // Unique ID for the checkbox
        checked={todo.completed}
        // --- Original Event Handler ---
        onCheckedChange={() => toggle_todo(todo.id)}
        // ---
        className="flex-shrink-0" // Prevent shrinking
        aria-labelledby={textId} // Links checkbox to the text label for accessibility
      />

      {/* Container for Text/Input to allow flexible growth */}
      <div className="flex-grow min-w-0">
        {titem.is_editing
          ? (
            // Shadcn Input for editing
            <Input
              type="text"
              value={$edit_text}
              // --- Original Event Handlers (Direct Mutation/Assignment) ---
              onInput={(e) => (titem.edit_text = e.target.value)}
              onBlur={handle_save}
              onKeyDown={(e) => e.key === "Enter" && handle_save()}
              // ---
              className="text-base h-9" // Adjust size as needed, default Shadcn styling
              autoFocus
            />
          )
          : (
            // Text display - kept original span as it has its own onClick
            <span
              id={textId} // ID for aria association
              // --- Original Event Handler (Clicking text toggles status) ---
              onClick={() => toggle_todo(todo.id)}
              // ---
              className={`text-base truncate cursor-pointer ${ // Added truncate, keep cursor-pointer
                todo.completed
                  ? "line-through text-muted-foreground" // Use theme colors
                  : "text-foreground"                    // Use theme colors
              }`}
              title={todo.text} // Show full text on hover if truncated
            >
              {todo.text}
            </span>
          )}
      </div>

      {/* Edit Button using Shadcn Button */}
      <Button
        variant="ghost"
        size="icon"
        // --- Original Event Handler (Direct Mutation) ---
        onClick={() => {
          titem.is_editing = true;
          titem.edit_text = todo.text;
        }}
        // ---
        title="Edit"
        className="flex-shrink-0" // Prevent shrinking
      >
        <Pencil className="h-4 w-4" /> {/* Icon */}
      </Button>

      {/* Delete Button using Shadcn Button */}
      <Button
        variant="ghost"
        size="icon"
        // --- Original Event Handler ---
        onClick={() => remove_todo(todo.id)}
        // ---
        title="Delete"
        className="flex-shrink-0" // Prevent shrinking
      >
        {/* Apply destructive color directly to the icon */}
        <Trash2 className="h-4 w-4 text-destructive" /> {/* Icon */}
      </Button>
    </li>
  );
}

// Component for status counts
function Status({store}) {

  const { $pending_count, $completed_count } = store.state;

  // console.log("pending_count: ", $pending_count);
  // console.log("completed_count: ", $completed_count);

  return (
    <div className="flex gap-2 mt-4 text-sm text-gray-500">
      <p>Pending: {$pending_count}</p>
      <p>Completed: {$completed_count}</p>
    </div>
  );
}

// Component for the list of todos
function Todos({ store }) {
  console.log("***** store.todos.length", store.state.todos.length);

  const { state, actions } = store;
  const { $todos } = state;

  return (
    <ul className="space-y-1">
      {$todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} actions={actions} />
      ))}
    </ul>
  );
}

// Main TodoList component
export default function TodoListWithId() {
  // const todo_store = CreateTodoStore(initial);

  const { state, actions } = todo_store;
  const { $draft } = state;

  function handle_new_task_keydown(e) {
    console.log("before draft: ", state.draft, " - e.key: ", e.key);
    if (e.key === "Enter" && state.draft.trim()) {
      console.log("IN Enter - draft: ", state.draft);
      actions.add_todo(state.draft.trim()).then(() => {
        state.draft = "";
      });
    }
  }

  return (
    // Use Card for main container - handles bg, shadow, border, some padding
    // Added responsive width, centering, and vertical margin
    <Card className="w-full max-w-2xl mx-auto my-8">

      <CardHeader>
        {/* Title Editor Component (Unchanged) */}
        <TitleEditor store={todo_store} />
      </CardHeader>

      <CardContent className="space-y-6"> {/* Add vertical spacing between elements */}
        {/* Todos List Component (Unchanged) */}
        <Todos store={todo_store} />

        {/* Add Task Input Section */}
        {/* Replaced label/span/input structure with div/icon/Input */}
        <div className="flex items-center gap-x-2 pt-4 border-t"> {/* Add border-t for separation */}
          <Plus className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="add a new task and hit enter"
            // Use standard Shadcn input styling, remove custom focus/bg styles
            className="h-9 flex-grow" // Control height, allow flexible width
            value={$draft}
            // --- Original Event Handlers (Direct Mutation/Assignment) ---
            onChange={(e) => (state.draft = e.target.value)}
            onKeyDown={handle_new_task_keydown}
            // ---
          />
        </div>
      </CardContent>

      <CardFooter>
        {/* Status Component (Unchanged) */}
        <Status store={todo_store} />
      </CardFooter>

    </Card>
  );
}