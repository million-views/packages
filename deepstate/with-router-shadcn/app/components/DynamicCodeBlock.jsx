// CodeBlock.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
// Import Textarea if you intended to use it visibly elsewhere, otherwise it's not needed for the hidden copy area.
// import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import * as shiki from 'shiki';

// Define the type for the dynamic import map more explicitly if possible
const rawFiles = import.meta.glob('./examples/*.jsx', { query: '?raw', eager: false });

const DynamicCodeBlock = ({ filename, language = "javascript" }) => {
  const path = `./examples/${filename}.jsx`;

  const [sourceCode, setSourceCode] = useState('');
  const [highlightedCode, setHighlightedCode] = useState("");
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [copied, setCopied] = useState(false);
  // No need for textareaRef if using navigator.clipboard
  // const textareaRef = useRef(null); // Keep if sticking with execCommand

  // --- Effect 1: Load Source Code ---
  useEffect(() => {
    // Reset states when filename changes
    setSourceCode('');
    setHighlightedCode('');
    setError('');
    setIsLoading(true); // Start loading

    const loadSource = async () => {
      if (rawFiles[path]) {
        try {
          // The dynamic import returns a module object, the raw content is usually the default export
          const module = await rawFiles[path]();
          if (module && typeof module.default === 'string') {
             setSourceCode(module.default);
          } else if (typeof module === 'string') {
            // Fallback if it directly returns a string (less common with {eager: false})
            setSourceCode(module);
          } else {
             throw new Error('Loaded module content is not a string.');
          }
          setError(''); // Clear previous errors on success
        } catch (err) {
          console.error("Error loading source code:", err);
          setError(`Could not load source code: ${err.message}`);
          setSourceCode(''); // Ensure source code is empty on error
        } finally {
          // setIsLoading(false); // Set loading to false here or in the highlighting effect
        }
      } else {
        setError(`Component source file not found: examples/${filename}.jsx`);
        setSourceCode('');
        setIsLoading(false); // Loading finished (with error)
      }
    };

    loadSource();

  }, [filename, path]); // Re-run only when filename (and thus path) changes

  // --- Effect 2: Highlight Code (when sourceCode changes) ---
  useEffect(() => {
    if (!sourceCode) {
      // If sourceCode is empty (initial state, error, or cleared), don't highlight
      setHighlightedCode('');
      setIsLoading(false); // Finished processing (nothing to highlight)
      return;
    }

    let isMounted = true; // Prevent state update if component unmounts during async op
    setIsLoading(true); // Start highlighting process

    const highlight = async () => {
      try {
        const highlighter = await shiki.createHighlighter({
          themes: ['github-dark'], // Or your preferred theme
          langs: [language],
        });
        const html = highlighter.codeToHtml(sourceCode, { lang: language, theme: 'github-dark' });
        if (isMounted) {
          setHighlightedCode(html);
          setError(''); // Clear error if highlighting succeeds
        }
      } catch (error) {
        console.error("Error highlighting code:", error);
        if (isMounted) {
           setError(`Failed to highlight code: ${error.message}`);
           // Fallback: Display raw code in a <pre> block if highlighting fails
           const escapedSource = sourceCode
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
           setHighlightedCode(`<pre class="shiki-fallback"><code>${escapedSource}</code></pre>`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false); // Finished highlighting (success or fallback)
        }
      }
    };

    highlight();

    return () => {
      isMounted = false; // Cleanup function to handle unmounting
    };

  }, [sourceCode, language]); // Re-run highlighting when sourceCode or language changes


  // --- Handle Copy ---
  // Use modern Clipboard API (preferred)
  const handleCopy = async () => {
    if (!sourceCode) return; // Nothing to copy

    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Optionally: Show an error message to the user
    }
  };

  // --- Render Logic ---
  if (!(path in rawFiles)) {
     // This check might be slightly redundant now due to the effect's check, but good as an early exit.
    return <div className="text-red-500">Component source definition not found for: {filename}</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">Error: {error}</div>;
  }

  return (
    <div className="relative w-full rounded-md bg-zinc-800 p-4 min-h-[50px]"> {/* Added min-h for loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 bg-opacity-75">
           {/* Add a spinner or loading text */}
           <span className="text-white">Loading...</span>
        </div>
      )}
      {/* Render the highlighted code */}
      <div
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className="text-sm font-mono text-white overflow-x-auto"
       />
      {/* Copy Button - only show if not loading and there's code */}
      {!isLoading && sourceCode && (
         <div className="absolute top-2 right-2">
           <Button size="icon" variant="ghost" onClick={handleCopy} className="text-white hover:bg-zinc-700">
             {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
           </Button>
         </div>
      )}

      {/* Hidden textarea for legacy copy (if navigator.clipboard is not preferred/supported) */}
      {/*
      <textarea
         ref={textareaRef}
         value={sourceCode} // IMPORTANT: Use original sourceCode here
         readOnly
         className="absolute opacity-0 top-0 left-0 w-px h-px pointer-events-none" // Better hiding
         aria-hidden="true"
      />
      */}
    </div>
  );
};

export default DynamicCodeBlock;