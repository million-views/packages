import { reify } from "@m5nv/deepstate/react";

const store = reify(
  { count: 1 },
).attach({
  increment: (state) => {
    state.count++;
  },
  decrement: (state) => {
    state.count--;
  },
});

export default function Counter() {
  const counter = store.state;
  const actions = store.actions;
  const { $count } = counter;

  return (
    <div className="@container flex flex-col items-center justify-center p-1 md:p-6 bg-muted mx-3 rounded-lg shadow-md space-y-4">
      <h1 className="text-lg font-semibold text-[clamp(1.875rem,4cqi,3rem)]">Count: {$count}</h1>

      <div className="w-full flex flex-col gap-1 @sm:flex-col @sm:space-y-0 @md:space-x-4 mb-5">
        <button
          onClick={() => (actions.increment())}
          className="w-[60cqw] mx-auto @sm:min-w-0 font-semibold bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
        >
          Increment
        </button>
        <button
          onClick={() => (actions.decrement())}
          className="w-[60cqw] mx-auto @sm:min-w-0 font-semibold py-2 px-4 rounded transition duration-200 bg-red-500 hover:bg-red-600 text-white"
        >
          Decrement
        </button>
      </div>
    </div>
  );
}
