export interface Example {
  id: string;
  name: string;
  code: string;
  output: string;
  language: string; // e.g., 'javascript', 'typescript', 'react'
}

export interface Language {
  id: string;
  name: string;
}


export const examples: Example[] = [
  { id: 'Counter', name: 'Counter Example', language: 'javascript', code: "console.log('Hello, World!');", output: "Console Output:\nHello, World!"},
  { id: 'CounterVariant1', name: 'Derived Counter', language: 'javascript', code: "const MyComponent = () => <div>Hello React!</div>;\n\n// Assuming ReactDOM is available\n// ReactDOM.render(<MyComponent />, document.getElementById('root'));", output: "Renders a Derived Counter component." },
  { id: 'simple-ts', name: 'Simple TypeScript', language: 'typescript', code: "function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('TypeScript'));", output: "Console Output:\nHello, TypeScript!" },
];

export const languages: Language[] = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'react', name: 'React' },
];
