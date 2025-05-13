# Navigator Package Structure

```
navigator/
├── src/
│   ├── components/
│   │   ├── Navigator.tsx            # Main Navigator component
│   │   ├── NavigatorContext.tsx     # Context and useNavigator hook
│   │   ├── NavigationHeader.tsx     # Header component
│   │   ├── NavigationTiers.tsx      # Navigation tiers 
│   │   ├── NavigatorSearch.tsx      # Search component
│   │   ├── NavigatorAppSwitcher.tsx # App switcher component
│   │   ├── NavigatorActions.tsx     # Actions component
│   │   └── cwo.tsx                  # Conditional rendering helpers
│   ├── utils/
│   │   └── NavigatorUtils.tsx       # Utility functions
│   ├── css/
│   │   └── navigator.css            # Semantic CSS classes using Tailwind
│   ├── types.ts                     # Shared type definitions
│   └── index.ts                     # Main export file
├── dist/                            # Built files
│   ├── components/
│   ├── utils/
│   ├── css/
│   └── index.js
├── types/                           # TypeScript definition files
├── examples/                        # Example implementations
│   ├── react-router/
│   ├── next-js/
│   └── theme-examples/
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

## Architecture Overview

The Navigator component follows a modular architecture with clear separation of
concerns:

1. **Type System**
   - All types are centralized in `types.ts`
   - Provides a single source of truth for TypeScript definitions
   - Prevents circular dependencies

2. **Context Management**
   - `NavigatorContext.tsx` provides context and the useNavigator hook
   - Independent from component implementations
   - Used by all components that need access to shared state

3. **Component Hierarchy**
   - `Navigator.tsx`: Main component that composes everything
   - `NavigationHeader.tsx`: Header with logo, title, search, and actions
   - `NavigationTiers.tsx`: Manages navigation levels and mobile menu
   - Customizable components in separate files for better modularity

4. **CSS Organization**
   - Semantic class names in `navigator.css`
   - Theme variables for customization
   - Full dark mode support

5. **Utility Functions**
   - Helper functions in `NavigatorUtils.tsx`
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
