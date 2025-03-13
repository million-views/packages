import { reify } from "@m5nv/deepstate";
import { useState, useContext } from "preact/hooks";
import { createContext } from "preact";

import { Disclosure } from "./ui/Disclosure";
import CodeBlock from "./ui/code-block.jsx";
import {
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/preact/24/outline";

const Counter = () => {
  const [{state: counter }] = useState (() => 
      reify(
        { count: 0 }
      )); 

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
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
  );
};

const DerivedCounter = () => {

  const [{state: counter }] = useState (() => 
      reify(
        { count: 0 },
        { double: (state) => state.count * 2 }
      ));

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">Count: {counter.count}</h1>
      <h1 className="text-3xl font-bold text-gray-800">Double: {counter.double}</h1>
      <button 
        onClick={() => counter.count++}
        class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
      >
        Increment
      </button>
    </div>
  );
};

function DerivedCounter2 () {
  const [{ state: counter, actions }] = useState(() =>
    reify(
      { count: 0 },
      { double: (state) => state.count * 2 },
    ).attach({ on_click: (state) => state.count++ })
  );

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">{counter.count} x 2 = {counter.double}</h1>
      <button class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
          onClick={() => (actions.on_click())}>
        Click me
      </button>
    </div>
  );
}

const Store = createContext();

function Value({counter}) {
  return (
    <h2 className="text-3xl font-bold text-gray-800">Count: {counter.count}</h2>
  );
}

const CtxCounter = () => {
  const {state:counter} = useContext(Store);
  return (      
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md space-y-4">
      <Value counter = {counter} />
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
    { count: 0 }
  );

  return (
    <Store.Provider value = {store}>
      <CtxCounter />
    </Store.Provider>
  );
}

const codeJSX = `function MyComponent(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This is an example Preact component.</p>
    </div>
  );
}`;


function renderComponent (Component, codeJSX) {

  return (
    <div className="bg-white text-black p-8 rounded-lg">
      <Disclosure defaultOpen={false}>
      {({ isOpen }) => (
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          {/* Preview Panel - Always visible */}
          <Component />

          {/* Toggle Button */}
          <Disclosure.Button className="w-full text-left p-4 bg-gray-900 border-t border-gray-800 text-gray-400 hover:text-white flex items-center">
            {isOpen
              ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-2" />
                  <span>Hide code</span>
                </>
              )
              : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-2" />
                  <span>Show code</span>
                </>
              )}
          </Disclosure.Button>

          {/* Code Panel */}
          <Disclosure.Panel>
            <div className="relative bg-gray-900 p-4 text-sm overflow-auto max-h-[500px] font-mono">
              <button
                className="absolute right-4 top-4 p-1 bg-gray-800 rounded hover:bg-gray-700"
                aria-label="Copy code"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
              <pre className="leading-relaxed">
                <CodeBlock
                  aria-label="Simple Code Block"
                  language="jsx"
                  hideLineNumbers
                >
                  {codeJSX}
                </CodeBlock>
              </pre>
            </div>
          </Disclosure.Panel>
        </div>
      )}
      </Disclosure>
    </div>
  );
}

export default function BasicExampleContent() {
  return (
    <main class="p-4">
      <section id="component2" class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Counter Example</h2>      
        {renderComponent (Counter, codeJSX)}
      </section>

      <section id="component2" class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Computed Deepstate</h2>
        {renderComponent (DerivedCounter, codeJSX)}
      </section>

      <section id="component2" class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Computed Deepstate - With Action</h2>
        {renderComponent (DerivedCounter2, codeJSX)}
      </section>

      <section id="component2" class="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2  class="text-xl font-bold mb-2 text-gray-800">Computed Deepstate with Preact Context API</h2>
        {renderComponent (ContextCounter, codeJSX)}
      </section>
    </main>
  );
}

