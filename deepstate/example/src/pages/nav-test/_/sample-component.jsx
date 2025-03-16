// sample-component.jsx
import { useComputed, useSignal } from "@preact/signals";

/**
 * Sample component to demonstrate in-page rendering
 * @param {Object} props - Component props
 * @param {Object} props.route - The current route information
 */
export default function SampleComponent({ route }) {
  // Create a count signal for reactivity demo
  const count = useSignal(0);

  // Computed signals that derive from count
  const doubledCount = useComputed(() => count.value * 2);
  const isEven = useComputed(() => count.value % 2 === 0);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sample Component</h2>

      <p className="mb-4">
        This component is rendered in-page through the Navigator's content area.
        It doesn't require a full page navigation.
      </p>

      {/* Route information */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-800">
          Current route info:
          <span className="font-mono block mt-1">
            {route
              ? `Path: ${route.path} | Label: ${route.label}`
              : "No route info"}
          </span>
        </p>
      </div>

      {/* Signals demo */}
      <div className="border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Signals Demo</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xl">{count.value}</span>
            <span className="text-sm text-gray-500">Count</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl">{doubledCount.value}</span>
            <span className="text-sm text-gray-500">Doubled</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl">{isEven.value ? "Even" : "Odd"}</span>
            <span className="text-sm text-gray-500">Type</span>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          <button
            onClick={() => count.value--}
            className="btn btn-outline"
            disabled={count.value <= 0}
          >
            Decrement
          </button>
          <button
            onClick={() => count.value++}
            className="btn btn-primary"
          >
            Increment
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 italic">
        Notice how only the affected parts of the UI update when the count
        changes. This is the power of fine-grained reactivity with Preact
        Signals.
      </p>
    </div>
  );
}
