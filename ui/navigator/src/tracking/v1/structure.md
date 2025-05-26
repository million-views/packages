# Navigator Package Source Structure

```bash
tree -L 3 navigator/src/
navigator/src/
├── App.css
├── App.tsx
├── assets
│   └── react.svg
├── components
│   ├── icons.jsx
│   └── navigator
│       ├── actions.tsx
│       ├── context.tsx
│       ├── cwo.tsx
│       ├── header.tsx
│       ├── index.tsx
│       ├── main.tsx
│       ├── navigator.css
│       ├── navigator.md
│       ├── search.tsx
│       ├── structure.md
│       ├── switcher.tsx
│       ├── tiers.tsx
│       ├── types.ts
│       └── utils.tsx
├── index.css
├── main.tsx
├── nav.js
├── routing.tsx
└── vite-env.d.ts
```

## Architecture Overview

The Navigator component follows a modular architecture with clear separation of
concerns:

1. **Type System**
   - All types are centralized in `types.ts`
   - Provides a single source of truth for TypeScript definitions
   - Prevents circular dependencies

2. **Context Management**
   - `context.tsx` provides context and the useNavigator hook
   - Independent from component implementations
   - Used by all components that need access to shared state

3. **Component Hierarchy**
   - `main.tsx`: Main component that composes everything
   - `header.tsx`: Header with logo, title, search, and actions
   - `tiers.tsx`: Manages navigation levels and mobile menu
   - Customizable components in separate files for better modularity

4. **CSS Organization**
   - Semantic class names in `navigator.css`
   - Theme variables for customization
   - Full dark mode support

5. **Utility Functions**
   - Helper functions in `utils.tsx`
   - Router adapters for different routing libraries
   - Icon handling utilities

## Key Design Principles

1. **No Circular Dependencies**: Components have clear, unidirectional
   dependencies
2. **Modular Component Structure**: Each component has a single responsibility
3. **Centralized Types**: All types defined in one place
4. **Theming System**: CSS variables for theme customization
5. **Flexible Integration**: Router adapter pattern for various routing
   libraries

This architecture provides a maintainable, extensible foundation for the
Navigator component.
