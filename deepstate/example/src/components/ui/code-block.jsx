import { useEffect, useMemo, useState } from "preact/hooks";
import { codeToHtml } from "shiki";
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
// const AsyncCodeBlock = async (props) => {
//   const {
//     children,
//     filename,
//     language,
//     highlightedLinesNumbers = [],
//     switcher,
//     hideLineNumbers = false,
//   } = props;
//   // Access aria-label from props (note: the prop name is "aria-label")
//   const ariaLabel = props["aria-label"];

//   // Split the code into lines only once.
//   const codeLines = useMemo(() => children.split("\n"), [children]);
//   const html = await codeToHtml(children, {
//     lang: language,
//     theme: "vitesse-dark",
//   });
//   console.log(html);
//   return (
//     <div className="my-4 shadow rounded overflow-hidden">
//       {(filename || switcher) && (
//         <div className="flex items-center justify-between bg-gray-200 px-3 py-2">
//           {filename && (
//             <span className="text-sm font-mono text-gray-700">{filename}</span>
//           )}
//           {switcher && (
//             <select
//               value={switcher.value}
//               onChange={(e) => switcher.onChange(e.target.value)}
//               className="text-sm font-mono text-gray-700 bg-gray-200 border border-gray-300 rounded"
//             >
//               {switcher.options.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//           )}
//         </div>
//       )}
//       <pre
//         aria-label={ariaLabel}
//         data-language={language}
//         className="bg-gray-800 text-gray-100 p-4 overflow-auto font-mono text-sm whitespace-pre"
//       >
//         {codeLines.map((line, idx) => {
//           const lineNumber = idx + 1;
//           const isHighlighted = highlightedLinesNumbers.includes(lineNumber);
//           return (
//             <div
//               key={idx}
//               className={`flex ${isHighlighted ? 'bg-yellow-600' : ''}`}
//             >
//               {!hideLineNumbers && (
//                 <span className="select-none text-gray-500 pr-4">
//                   {lineNumber}
//                 </span>
//               )}
//               <span className="whitespace-pre">{line}</span>
//             </div>
//           );
//         })}
//       </pre>
//     </div>
//   );
// };

// Async CodeBlock component
const AsyncCodeBlock = async (props) => {
  const {
    children,
    filename,
    language,
    highlightedLinesNumbers = [],
    hideLineNumbers = false,
  } = props;

  const ariaLabel = props["aria-label"];

  // Process code with Shiki to get HTML output
  const processCode = async (code) => {
    try {
      // Generate HTML with Shiki
      const html = await codeToHtml(code, {
        lang: language || "javascript", // Default to javascript if no language is specified
        theme: "vitesse-dark",
        lineOptions: highlightedLinesNumbers.map((lineNumber) => ({
          line: lineNumber,
          classes: ["highlighted-line"],
        })),
      });

      return html;
    } catch (error) {
      console.error("Error highlighting code:", error);
      // Fallback to plain text if highlighting fails
      return `<code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`;
    }
  };

  // Get the highlighted HTML
  const highlightedHtml = await processCode(children);

  // Create a container for the code block
  return (
    <div className="code-block-container">
      {filename && (
        <div className="code-filename bg-gray-700 px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
          {filename}
        </div>
      )}

      <div className="relative">
        {
          /*
          We're using dangerouslySetInnerHTML because Shiki returns pre-formatted HTML
          with all the syntax highlighting spans already applied
        */
        }
        <pre
          aria-label={ariaLabel}
          data-language={language}
          className={`bg-gray-800 text-gray-100 p-4 overflow-auto font-mono text-sm ${
            hideLineNumbers ? "hide-line-numbers" : ""
          }`}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />

        {/* If needed, we can add line numbers separately */}
        {!hideLineNumbers && (
          <div className="line-numbers absolute left-0 top-0 pl-4 pt-4 text-gray-500 select-none">
            {children.split("\n").map((_, idx) => (
              <div key={idx} className="line-number">
                {idx + 1}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CodeBlock = (props) => {
  const [codeComponent, setCodeComponent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        // Call the async component as a function
        const result = await AsyncCodeBlock(props);
        setCodeComponent(result);
      } catch (error) {
        console.error("Error loading code block:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [props.children, props.language]); // Re-run when key props change

  if (loading) {
    return <div className="p-4 bg-gray-800 text-gray-400">Loading code...</div>;
  }

  return codeComponent;
};
export default CodeBlock;
