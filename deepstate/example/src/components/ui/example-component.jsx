import { useState } from "preact/hooks";
import CodeBlock from "./code-block.jsx";

const codeJSX = `function MyComponent(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This is an example Preact component.</p>
    </div>
  );
}`;

const codeTSX = `function MyComponent(props: { name: string }) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This is an example Preact component written in TypeScript.</p>
    </div>
  );
}`;

export function ExampleComponent() {
  const [language, setLanguage] = useState("jsx");

  const languages = [
    { label: "JavaScript", value: "jsx" },
    { label: "TypeScript", value: "tsx" },
  ];

  const code = language === "tsx" ? codeTSX : codeJSX;
  const filename = language === "tsx" ? "MyComponent.tsx" : "MyComponent.jsx";

  return (
    <div className="p-4">
      <CodeBlock
        aria-label="Example Code Block"
        filename={filename}
        language={language}
        highlightedLinesNumbers={[1, 3]}
        switcher={{
          options: languages,
          value: language,
          onChange: setLanguage,
        }}
      >
        {code}
      </CodeBlock>

      {/* Example without filename and without line numbers */}
      <CodeBlock
        aria-label="Simple Code Block"
        language="jsx"
        hideLineNumbers
      >
        {codeJSX}
      </CodeBlock>
    </div>
  );
}
