import { Disclosure } from "./ui/Disclosure";
import CodeBlock from "./ui/code-block.jsx";
import {
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/preact/24/outline";

export default function renderComponent (Component, codeJSX) {

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