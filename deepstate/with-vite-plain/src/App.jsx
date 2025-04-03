import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { reify } from "@m5nv/deepstate/react";

const store = reify(
  { count: 0, double: (state) => state.count * 2 },
).attach({
  on_click: (state) => {
    // console.log(state.count, state.double);
    state.count++;
  },
});

function DerivedCounter2() {
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

function App() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <DerivedCounter2 />
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
