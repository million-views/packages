// file: context.tsx
// Enhanced NavigatorContext with mobile menu state management
import { createContext, useContext, useState } from "react";
import type {
  NavigatorContextProviderProps,
  NavigatorContextType,
} from "./types";

// Create context with null as default value for fail-fast pattern
export const NavigatorContext = createContext<NavigatorContextType | null>(
  null,
);

// Enhanced provider component that includes mobile menu state
export const NavigatorProvider: React.FC<NavigatorContextProviderProps> = ({
  children,
  navigationTree,
  section,
  availableSections,
  onSectionChange,
  router,
  darkMode,
  displayMode,
  renderIcon,
  formatSectionName,
}) => {
  // Mobile menu state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle function that can be called from any component
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Build the full context value
  const contextValue: NavigatorContextType = {
    navigationTree,
    section,
    availableSections,
    onSectionChange,
    router,
    darkMode,
    displayMode,
    renderIcon,
    formatSectionName,

    // Mobile menu state
    isMobileMenuOpen,
    toggleMobileMenu,
  };

  return (
    <NavigatorContext.Provider value={contextValue}>
      {children}
    </NavigatorContext.Provider>
  );
};

// Custom hook for using navigator context with validation
export const useNavigator = () => {
  const context = useContext(NavigatorContext);
  if (context === null) {
    throw new Error(
      "useNavigator must be used within a NavigatorProvider component",
    );
  }
  return context;
};
