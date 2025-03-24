import { reify } from "@m5nv/deepstate";
import { useState } from "preact/hooks";

import renderComponent from "./render-component.jsx";


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

export default function AdvExampleContent() {
  return (
    <main class="p-4">
      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Search with Signals</h2>      
        {renderComponent (SearchComponent, codeJSX)}
      </section>

      <section class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Search with AutoComplete</h2>      
        {renderComponent (SearchWithAutoComplete, codeJSX)}
      </section>
    </main>
  );
}