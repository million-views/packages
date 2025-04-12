import { reify } from "@m5nv/deepstate/react";
import { createContext, useContext } from "react";

const Store = createContext();

function Value({ counter }) {
  const {$count} = counter;
  return (
    <h2 className="text-3xl font-bold text-gray-800">Count: {$count}</h2>
  );
}

function CtxCounter () {
  const { state: counter, actions } = useContext(Store);

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
      <Value counter={counter} />
      <button
        onClick={() => actions.increment()}
        class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
      >
        Increment
      </button>
    </div>
  );
}

export default function ContextCounter() {
  const store = reify(
    { count: 1, double: (state) => state.count * 2 },
  ).attach({
    increment: (state) => {
      state.count++;
    }
  });

  return (
    <Store.Provider value={store}>
      <CtxCounter />
    </Store.Provider>
  );
}