import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { useSignals } from "@preact/signals-react/runtime";
import { reify } from "@m5nv/deepstate/core";

const { state: counter, actions } = reify(
  { count: 0 },
  { double: (state) => state.count * 2 },
).attach({
  on_click: (state) => {
    console.log(state.count, state.double);
    state.count++;
  },
});

function Counter({ counter }) {
  return <div>{counter.count} x 2 = {counter.double}</div>;
}

function DerivedCounter2() {
  const { count, double, $double } = counter;
  // console.log("double", double, $double);
  useSignals();

  return (
    <div className="card">
      <h1 className="text-3xl font-bold">
        {counter.count} x 2 = {counter.double}
        <Counter
          counter={counter}
          count={counter.count}
          double={counter.double}
        />
      </h1>

      <button
        onClick={() => (actions.on_click())}
      >
        Click me
      </button>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

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
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <DerivedCounter2 />
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
