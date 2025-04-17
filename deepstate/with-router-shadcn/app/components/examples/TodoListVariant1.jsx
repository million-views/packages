import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust path as needed
import { Input } from "@/components/ui/input";   // Adjust path as needed
import { Checkbox } from "@/components/ui/checkbox"; // Adjust path as needed
import { Label } from "@/components/ui/label";     // Adjust path as needed
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Adjust path as needed
import { Trash2 } from 'lucide-react'; // Icon for delete button
import { reify } from "@m5nv/deepstate/react";

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
    console.log ('Before - state.todos: ', state.todos.length);
    state.todos.splice(index, 1);
    console.log ('After - state.todos: ', state.todos.length);
  },
  toggleTodo(state, index) {
    const todo = state.todos[index];
    if (todo) {
      todo.completed = !todo.completed;
    }
  },
});

export default function TodoListWithoutId() {
  
  const { state, actions } = store;
  const onInput = (event) => (state.draft = event.target.value);

  return (
    // <ScrollArea className="h-[60cqh] w-full rounded-md border sm:p-0 m-0">
    <Card className="w-full max-w-lg mx-auto shadow-lg overflow-auto">
      <CardHeader>
        <CardTitle>My Todo List</CardTitle>
        {/* Optional: <CardDescription>Manage your tasks efficiently.</CardDescription> */}
      </CardHeader>
      <CardContent>
        {/* Use onSubmit on the form */}
        <form onSubmit={actions.addTodo} className="grid gap-6">
          {/* Input and Button Row: Stack vertically on small screens, row on larger */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="What needs to be done?"
              value={state.draft}
              onChange={onInput} // Use onChange for controlled input
              className="flex-grow" // Allow input to take available space
            />
            {/* Use Shadcn Button. Type="button" prevents form submission if onClick is preferred */}
             <Button type="button" onClick={actions.addTodo}>
                 Add
             </Button>
            {/* Or use type="submit" if you want Enter key in Input to submit the form */}
            {/* <Button type="submit">Add</Button> */}
          </div>

          {/* Todo List */}
          {state.todos && state.todos.length > 0 ? (
             <ul className="space-y-4"> {/* Use space-y for vertical spacing */}
                {state.todos.map((todo, index) => (
                  <li
                    key={index} // Use a more stable key if possible (e.g., todo.id)
                    className="flex items-center justify-between gap-4 p-2 rounded hover:bg-muted/50" // Add some hover effect
                  >
                    <div className="flex items-center gap-3"> {/* Group checkbox and label */}
                      <Checkbox
                        id={`todo-${index}`} // Unique ID for accessibility
                        checked={todo.completed}
                        // Shadcn Checkbox uses onCheckedChange which passes the checked state
                        onCheckedChange={() => actions.toggleTodo && actions.toggleTodo(index)}
                      />
                      <Label
                        htmlFor={`todo-${index}`} // Associate label with checkbox
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          todo.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {todo.text}
                      </Label>
                    </div>
                    <Button
                      variant="ghost" // Less intrusive style
                      size="icon"     // Square button for icons
                      onClick={() => actions.removeTodo && actions.removeTodo(index)}
                      aria-label="Remove todo" // Accessibility
                    >
                      <Trash2 className="h-4 w-4 text-destructive" /> {/* Icon + destructive color */}
                    </Button>
                  </li>
                ))}
             </ul>
           ) : (
             <p className="text-sm text-center text-muted-foreground">No tasks yet!</p>
           )}
        </form>
      </CardContent>
      <CardFooter>
        {/* Display completed count */}
        <p className="text-sm text-muted-foreground">
          Completed: {state.completedCount ?? 0}
        </p>
      </CardFooter>
    </Card>
    // </ScrollArea>
  );
}