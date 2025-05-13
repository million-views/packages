// NavigatorContext.tsx
import { createContext, useContext } from "react";
import { type NavigatorContextType } from "./types";

// Create context with null as default value for fail-fast pattern
export const NavigatorContext = createContext<NavigatorContextType | null>(
  null,
);

// Custom hook for using navigator context with validation
export const useNavigator = () => {
  const context = useContext(NavigatorContext);
  if (context === null) {
    throw new Error("useNavigator must be used within a Navigator component");
  }
  return context;
};
