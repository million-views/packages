import { reify } from "@m5nv/deepstate/react";
// import { useSignals } from "@preact/signals-react/runtime";

const store = reify(
  { count: 8, double: (state) => state.count * 2 },
).attach({
  on_click: (state) => {
    // console.log(state.count, state.double);
    state.count++;
  },
});

function DerivedCounter2() {
  // useSignals();
  const counter = store.state;
  const actions = store.actions;
  const { $count, $double } = counter;

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
      <h1 className="text-3xl font-bold">
        {counter.count} x 2 = {counter.double}
        <br />
        {$count} x 2 = {$double}
        <br />
        {$count.value} x 2 = {$double.value}
      </h1>

      <button
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        onClick={() => (actions.on_click())}
      >
        Click me
      </button>
    </div>
  );
}

export function Welcome() {
  return (
    <main className="flex flex-col items-center justify-center pt-16 pb-4">
      <header className="text-3xl font-bold items-center gap-9">
        <h1>DeepState + React Router</h1>
      </header>
      <DerivedCounter2 />
    </main>
  );
}
