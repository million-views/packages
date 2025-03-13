// DatePresets.jsx
import { useState } from "preact/hooks";
import { Disclosure } from "./Disclosure";
import CodeBlock from "./code-block.jsx";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
} from "@heroicons/preact/24/outline";

// Import the type definitions and date utilities
// These imports would match what was shown in the code example
// import { Calendar } from "@components/ui/calendar";
// import { endOfDay, startOfDay, subDays, subMonths, subWeeks } from "date-fns";

// Define preset date ranges
// const presets = {
//   "last-3-days": {
//     text: "Last 3 Days",
//     start: startOfDay(subDays(new Date(), 3)),
//     end: endOfDay(new Date()),
//   },
//   "last-7-days": {
//     text: "Last 7 Days",
//     start: startOfDay(subWeeks(new Date(), 1)),
//     end: endOfDay(new Date()),
//   },
//   "last-14-days": {
//     text: "Last 14 Days",
//     start: startOfDay(subWeeks(new Date(), 2)),
//     end: endOfDay(new Date()),
//   },
//   "last-month": {
//     text: "Last Month",
//     start: startOfDay(subMonths(new Date(), 1)),
//     end: endOfDay(new Date()),
//   },
// };

// The presets component code
const codeString = `import type { DateValue } from 'geist/components';
import { Calendar } from 'geist/components';
import { useState, type JSX } from 'react';
import type { RangeValue } from '@react-types/shared';
import { startOfDay, subDays, subWeeks, subMonths, endOfDay } from 'date-fns';

const presets = {
  'last-3-days': {
    text: 'Last 3 Days',
    start: startOfDay(subDays(new Date(), 3)),
    end: endOfDay(new Date()),
  },
  'last-7-days': {
    text: 'Last 7 Days',
    start: startOfDay(subWeeks(new Date(), 1)),
    end: endOfDay(new Date()),
  },
  'last-14-days': {
    text: 'Last 14 Days',
    start: startOfDay(subWeeks(new Date(), 2)),
    end: endOfDay(new Date()),
  },
  'last-month': {
    text: 'Last Month',
    start: startOfDay(subMonths(new Date(), 1)),
    end: endOfDay(new Date()),
  },
};

export function Component(): JSX.Element {
  const [date, setDate] = useState<RangeValue<DateValue>>();

  return (
    <div className="flex justify-center py-12">
      <Calendar isDocsPage onChange={setDate} presets={presets} value={date} />
    </div>
  );
}`;



export function DatePresets() {
  const [date, setDate] = useState(null);

  return (
    <div className="bg-black text-white p-8 rounded-lg">
      <h1 className="text-3xl font-bold mb-2">Presets</h1>
      <p className="text-gray-400 mb-8">Provide common date ranges.</p>

      <Disclosure defaultOpen={false}>
        {({ isOpen }) => (
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            {/* Preview Panel - Always visible */}
            <div className="p-8 flex justify-center">
              <div className="w-full max-w-xl">
                <div className="flex rounded-md overflow-hidden">
                  <button className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between flex-1 border-r border-gray-800">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span>Select Period</span>
                    </div>
                    <ChevronDownIcon className="h-5 w-5" />
                  </button>
                  <button className="bg-gray-900 text-white px-4 py-2 flex items-center flex-1">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>Select Date Range</span>
                  </button>
                </div>
              </div>
            </div>

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
