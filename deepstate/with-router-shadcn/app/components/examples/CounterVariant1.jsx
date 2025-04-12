import { reify } from "@m5nv/deepstate/react";

const store = reify(
  { count: 1, double: (state) => state.count * 2 },
).attach({
  increment: (state) => {
    state.count++;
  }
});

export default function Counter() {
  const counter = store.state;
  const actions = store.actions;
  const { $count, $double } = counter;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg shadow-md space-y-4">
    {/* Fluid Text Size: Uses clamp() with container query inline units (cqi).
        Font scales between 1.875rem (text-2xl) and 3rem (text-3xl),
        preferring a size relative to 4% of the container's width.
        Added text-center for better alignment as size changes. */}
        <h1 className="text-lg font-semibold text-[clamp(1.875rem,4cqi,3rem)]">Count: {$count}</h1>
        <h1 className="text-lg font-semibold text-[clamp(1.875rem,4cqi,3rem)]">Double: {$double}</h1>
    {/* <h1 className="font-semibold text-gray-800 text-center text-[clamp(1.875rem,4cqi,3rem)]">
      Count: {counter}
    </h1> */}

    {/* Button Container: Stacks vertically below '@sm', row layout '@sm' and above.
        Takes full width to allow child buttons using w-full/flex-1 correctly. */}
    <div className="w-full flex flex-col space-y-2 @sm:flex-row @sm:space-y-0 @sm:space-x-4">
      {/* Fluid Buttons:
          - w-full: Takes full width when stacked vertically (default).
          - @sm:w-auto: Resets width when switching to row layout.
          - @sm:flex-1: Makes buttons share available space equally in the row.
          - @sm:min-w-0: Allows buttons to shrink below intrinsic size if needed.
          - px-4: Maintains consistent horizontal padding inside the button. */}
      <button
        onClick={() => (actions.increment())}
        className="w-full @sm:w-auto @sm:flex-1 @sm:min-w-0 font-semibold bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
      >
        Increment
      </button>
    </div>
  </div>
  );
}
