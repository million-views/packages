import { h } from 'preact';
import { useMemo } from 'preact/hooks';

/**
 * Props:
 * - children: The code string to render.
 * - "aria-label": Accessible label for the code block.
 * - filename: Optional filename to display in the header.
 * - language: The language string (used as a data attribute).
 * - highlightedLinesNumbers: An array of 1-indexed line numbers to highlight.
 * - switcher: An object { options, value, onChange } for language switching.
 * - hideLineNumbers: Boolean flag to hide line numbers.
 */
const CodeBlock = (props) => {
  const {
    children,
    filename,
    language,
    highlightedLinesNumbers = [],
    switcher,
    hideLineNumbers = false,
  } = props;
  // Access aria-label from props (note: the prop name is "aria-label")
  const ariaLabel = props['aria-label'];

  // Split the code into lines only once.
  const codeLines = useMemo(() => children.split('\n'), [children]);

  return (
    <div className="my-4 shadow rounded overflow-hidden">
      {(filename || switcher) && (
        <div className="flex items-center justify-between bg-gray-200 px-3 py-2">
          {filename && (
            <span className="text-sm font-mono text-gray-700">{filename}</span>
          )}
          {switcher && (
            <select
              value={switcher.value}
              onChange={(e) => switcher.onChange(e.target.value)}
              className="text-sm font-mono text-gray-700 bg-gray-200 border border-gray-300 rounded"
            >
              {switcher.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      <pre
        aria-label={ariaLabel}
        data-language={language}
        className="bg-gray-800 text-gray-100 p-4 overflow-auto font-mono text-sm whitespace-pre"
      >
        {codeLines.map((line, idx) => {
          const lineNumber = idx + 1;
          const isHighlighted = highlightedLinesNumbers.includes(lineNumber);
          return (
            <div
              key={idx}
              className={`flex ${isHighlighted ? 'bg-yellow-600' : ''}`}
            >
              {!hideLineNumbers && (
                <span className="select-none text-gray-500 pr-4">
                  {lineNumber}
                </span>
              )}
              <span className="whitespace-pre">{line}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
};

export default CodeBlock;
