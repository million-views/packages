import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { useSignal } from "@preact/signals";

// Create a context for navigation state
const NavigationContext = createContext(null);

export function NavigationProvider({
  children,
  initialPage = "Dashboard",
  navigationItems = [],
}) {
  // Create the active page signal
  const activePage = useSignal(initialPage);

  // Simple helper functions instead of computed signals
  const isItemActive = (itemName) => itemName === activePage.value;

  const getActiveItem = () =>
    navigationItems.find((item) => item.name === activePage.value) ||
    navigationItems[0];

  // Context value with signal and helper functions
  const value = {
    activePage,
    navigationItems,
    isItemActive,
    getActiveItem,
    setActivePage: (page) => {
      activePage.value = page;
    },
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// Custom hook to use navigation context
export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  return context;
}
