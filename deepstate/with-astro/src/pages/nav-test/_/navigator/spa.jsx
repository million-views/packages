import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { useSignal } from "@preact/signals";

// Create a context for navigation state
const NavigationContext = createContext(null);

export function SpaNavigator({
  children,
  initialPage = "Dashboard",
  navigationItems = [],
}) {
  // Create the active page signal
  const activeItem = useSignal(initialPage);

  // Simple helper functions instead of computed signals
  const isItemActive = (itemName) => itemName === activeItem.value;

  const getActiveItem = () =>
    navigationItems.find((item) => item.name === activeItem.value) ||
    navigationItems[0];

  // Context value with signal and helper functions
  const value = {
    activeItem,
    navigationItems,
    isItemActive,
    getActiveItem,
    setActiveItem: (item) => {
      activeItem.value = item;
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

/**
 * Navigated Content Component
 * Renders the component associated with the active route
 */
export function NavigatedContent({ fallback = null }) {
  const { getActiveItem } = useNavigation();
  // Get the active component when rendering
  const activeItem = getActiveItem();
  const Content = activeItem.component;
  if (!Content && activeItem.href !== "#") {
    // For MPA, we just let the browser handle the navigation
    // if (link.href !== currentPath) {
    window.location.href = activeItem.href;
    // }
    // return <div>No content available</div>;
  }

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {activeItem.value}
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Content />
        </div>
      </main>
    </div>
  );

  // // Get the active component
  // const activeRoute = getActiveItem.value;

  // // If no active component is found, show fallback
  // if (!activeRoute || !activeRoute.component) {
  //   return fallback || null;
  // }

  // // Render the active component
  // const Component = activeRoute.component;
  // return <Component route={activeRoute} />;
}

export function ActivatedContent() {
  // Access navigation state from context
  const { activePage, getActiveItem } = useNavigation();

  // Get the active component when rendering
  const activeItem = getActiveItem();
  const Content = activeItem.component;

  if (!Content && activeItem.href !== "#") {
    // For MPA, we just let the browser handle the navigation
    // if (link.href !== currentPath) {
    window.location.href = activeItem.href;
    // }
    // return <div>No content available</div>;
  } else {
    return (
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {activePage.value}
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Content />
          </div>
        </main>
      </div>
    );
  }
}
