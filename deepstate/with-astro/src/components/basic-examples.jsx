import { reify } from "@m5nv/deepstate";
import { useContext, useState } from "preact/hooks";
import { createContext } from "preact";

import renderComponent from "./render-component.jsx";

const Counter = () => {
  const [{ state: counter }] = useState(() =>
    reify(
      { count: 0 },
    )
  );

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">
        Count: {counter.count}
      </h1>
      <div className="flex space-x-4">
        <button
          onClick={() => counter.count++}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          Increment
        </button>
        <button
          onClick={() => counter.count--}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          Decrement
        </button>
      </div>
    </div>
  );
};

const DerivedCounter = () => {
  const [{ state: counter }] = useState(() =>
    reify(
      { count: 0, double: (state) => state.count * 2 },
    )
  );

  const { $double } = counter;
  console.log("double", $double);
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">
        Count: {counter.count}
      </h1>
      <h1 className="text-3xl font-bold text-gray-800">
        Double: {counter.$double.value}
      </h1>
      <button
        onClick={() => counter.count++}
        class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
      >
        Increment
      </button>
    </div>
  );
};

function DerivedCounter2() {
  const [{ state: counter, actions }] = useState(() =>
    reify(
      { count: 0, double: (state) => state.count * 2 },
    ).attach({ on_click: (state) => state.count++ })
  );

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">
        {counter.$count} x 2 = {counter.$double}
      </h1>
      <button
        class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        onClick={() => (actions.on_click())}
      >
        Cluck me
      </button>
    </div>
  );
}

const Store = createContext();

function Value({ counter }) {
  return (
    <h2 className="text-3xl font-bold text-gray-800">Count: {counter.count}</h2>
  );
}

const CtxCounter = () => {
  const { state: counter } = useContext(Store);
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
      <Value counter={counter} />
      <button
        onClick={() => counter.count++}
        class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
      >
        Increment
      </button>
    </div>
  );
};

const ContextCounter = () => {
  const store = reify(
    { count: 0 },
  );

  return (
    <Store.Provider value={store}>
      <CtxCounter />
    </Store.Provider>
  );
};

const codeJSX = `function MyComponent(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This is an example Preact component.</p>
    </div>
  );
}`;

export default function BasicExampleContent() {
  return (
    <main class="p-4">
      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Basic Deepstate</h2>
        {renderComponent(Counter, codeJSX)}
      </section>

      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Computed Deepstate</h2>
        {renderComponent(DerivedCounter, codeJSX)}
      </section>

      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">
          Computed Deepstate - With Action
        </h2>
        {renderComponent(DerivedCounter2, codeJSX)}
      </section>

      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">
          Computed Deepstate with Preact Context API
        </h2>
        {renderComponent(ContextCounter, codeJSX)}
      </section>
    </main>
  );
}
