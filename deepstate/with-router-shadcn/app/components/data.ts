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
  { id: 'Counter', name: 'Counter Example', language: 'javascript'},
  { id: 'CounterVariant1', name: 'Derived Counter', language: 'javascript'},
  { id: 'CounterWithContext', name: 'Counter With Context', language: 'javascript'},
  { id: 'TodoListVariant1', name: 'TodoList (Without Id)', language: 'javascript'},
  { id: 'TodoListVariant2', name: 'TodoList (With Id)', language: 'javascript'},
];

export const languages: Language[] = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'react', name: 'React' },
];
