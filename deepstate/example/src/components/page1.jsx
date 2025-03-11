import { reify } from "@m5nv/deepstate";
import { useState } from "preact/hooks";

const Counter = () => {
  const [{state: counter }] = useState (() => 
      reify(
        { count: 0 }
      )); // Create a signal

  return (
    <main class="p-4">
      <section id="component2" class="bg-white shadow-md rounded-lg p-6 mb-4">
      <h2 class="text-xl font-bold mb-2 text-gray-800">Counter Example</h2>
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg shadow-md space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Count: {counter.count}</h1>
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
      </section>
    </main>
  );
};

const ReactiveCounter = () => {

  const [{state: counter }] = useState (() => 
      reify(
        { count: 0 },
        { double: (state) => state.count * 2 }
      ));

  return (
    <main class="p-4">
      <section id="component2" class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Reactive Computations</h2>
        <div class="space-y-2">
          <h1 class="text-2xl text-gray-600">Count: {counter.count}</h1>
          <h1 class="text-xl text-gray-900">Double: {counter.double}</h1>
          <button 
            onClick={() => counter.count++}
            class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            Increment
          </button>
        </div>
      </section>
    </main>
  );
};

function Value({counter}) {
  console.log('counter.count');
  return (
    <h2 class="text-xl text-gray-600">Count: {counter.count}</h2>
  );
}
const CtxCounter = () => {
  const {state:counter} = useContext(Store);
  console.log('Counter');
  return (
    <main class="p-4">
      <section id="component2" class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Deepstate with Preact Context API</h2>
        <div>
          <Value counter = {counter} />
          <button 
            onClick={() => counter.count++}
            class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            Increment
          </button>
        </div>
      </section>
    </main>
  );
};

const ContextCounter = () => {
  const store = reify(
    { count: 0 }
  );

  return (
    <Store.Provider value = {store}>
      <CtxCounter />
    </Store.Provider>
  );
}

const SearchComponent = () => {  

  const [{state: search, actions }] = useState (() => 
    reify(
      { query: '',
        results: ['React', 'Redux', 'Signals']
      }
  ).attach({
        async handle_search(state) {
          state.results.splice(0, state.results.length, ...await fetch_results(state.query));
        },
      })); 

  async function fetch_results (query) {
    // Simulate API call
    return ['React', 'Redux', 'Signals'].filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }     

  return (
    <main class="p-4">
      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
      <h2 class="text-xl font-bold mb-2 text-gray-800">Advanced Ex: Search With AutoComplete</h2>
      <div className="max-w-lg mx-auto p-4 bg-white rounded shadow-md">
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={search.query}
            onChange={(e) => (search.query = e.target.value)}
            placeholder="Search..."
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={actions.handle_search}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
          >
            Search
          </button>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {search.results.map((result) => (
            <li key={result} className="text-gray-700">
              {result}
            </li>
          ))}
        </ul>
      </div>
      </section>
    </main>
  );
};

const SearchWithAutoComplete = () => {

  const options = ['React', 'Redux', 'Signals'];

  const [{state: search, actions }] = useState (() => 
    reify(
      { query: '',
        results: [...options]
      }
  ).attach({
        async handle_search(state) {

          if (state.query.trim().length === 0) {
            console.log ('in else if')
            state.results.splice(0, state.results.length, ...options);
            console.log ('after splice: ', ...state.results, options);
          } else {
              console.log ('In if: state.query: ', state.query, ...state.results);
              state.results.splice(0, state.results.length, ...await fetch_results(state.query));
          } 
        },
      })); 

  async function fetch_results (query) {
    // Simulate API call
    return ['React', 'Redux', 'Signals'].filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }    

  return (
    <main class="p-4">
      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Advanced Ex: Search With Signals</h2>
        <div className="max-w-lg mx-auto p-4 bg-white rounded shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={search.query}
              onInput={(e) => (search.query = e.target.value)}
              onKeyUp={actions.handle_search}
              placeholder="Search..."
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ul className="list-disc list-inside space-y-1">
              {search.results.map((result) => (
                <li key={result} className="text-gray-700">{result}</li>
              ))}
            </ul>
        </div>
      </section>
    </main>
  );
};


export {
  Counter,
  ReactiveCounter,
  ContextCounter,
  SearchComponent,
  SearchWithAutoComplete
};