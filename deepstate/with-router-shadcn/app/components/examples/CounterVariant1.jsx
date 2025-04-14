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
      <h1 className="text-lg font-semibold text-[clamp(1.875rem,4cqi,3rem)]">Count: {$count}</h1>
      <h1 className="text-lg font-semibold text-[clamp(1.875rem,4cqi,3rem)]">Double: {$double}</h1>
      <div className="w-full flex flex-col space-y-2 @sm:flex-row @sm:space-y-0 @sm:space-x-4">
        <button
          onClick={() => (actions.increment())}
          className="w-[60cqw] mx-auto @sm:flex-1 font-semibold bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
        >
          Increment
        </button>
      </div>
    </div>
  );
}
