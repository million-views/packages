// Core functionality, context, and types for the Navigator component
import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { createContext } from "preact";
import { useContext } from "preact/hooks";

// Type definitions
export interface NavTask {
  title: string;
  id: string;
  icon: any;
  action?: () => void;
}

export interface NavView {
  title: string;
  id: string;
  icon?: any;
  subViews?: NavView[];
  tasks?: NavTask[];
}

export interface NavItem {
  title: string;
  href: string;
  icon?: any;
  views?: NavView[];
  tasks?: NavTask[];
}

interface NavigatorContextType {
  activeView: import("@preact/signals").Signal<string | null>;
  activeSubView: import("@preact/signals").Signal<string | null>;
  deviceType: import("@preact/signals").Signal<"mobile" | "tablet" | "desktop">;
  isSidebarOpen: import("@preact/signals").Signal<boolean>;
  activePage: import("@preact/signals").ReadonlySignal<NavItem | undefined>;
  currentView: import("@preact/signals").ReadonlySignal<NavView | undefined>;
  visibleTasks: import("@preact/signals").ReadonlySignal<NavTask[]>;
  overflowTasks: import("@preact/signals").ReadonlySignal<NavTask[]>;
  setActiveView: (viewId: string, pageHref?: string) => void;
  setActiveSubView: (subViewId: string) => void;
  toggleSidebar: () => void;
  handleTaskAction: (task: NavTask) => void;
  navigate: (href: string) => void;
}

// Create context
const NavigatorContext = createContext<NavigatorContextType | undefined>(
  undefined,
);

// Provider component
export function NavigatorProvider({
  children,
  items,
  primaryTasks = [],
  currentPath,
  onNavigate,
}: {
  children: any;
  items: NavItem[];
  primaryTasks?: NavTask[];
  currentPath: string;
  onNavigate: (href: string) => void;
}) {
  // Core signals
  const activeView = useSignal<string | null>(null);
  const activeSubView = useSignal<string | null>(null);
  const deviceType = useSignal<"mobile" | "tablet" | "desktop">("desktop");
  const isSidebarOpen = useSignal(false);
  const taskContainerWidth = useSignal(0);

  // Computed values
  const activePage = useComputed(() => {
    return items.find((item) =>
      currentPath === item.href || currentPath.startsWith(`${item.href}/`)
    );
  });

  const currentView = useComputed(() => {
    if (!activePage.value?.views) return undefined;
    return activePage.value.views.find((view) => view.id === activeView.value);
  });

  // Calculate tasks
  const allTasks = useComputed(() => {
    return [
      ...primaryTasks,
      ...(activePage.value?.tasks || []),
      ...(currentView.value?.tasks || []),
    ];
  });

  const visibleTasks = useComputed(() => {
    if (deviceType.value === "mobile") {
      // On mobile, show max 3 tasks
      return allTasks.value.slice(0, 3);
    }

    const taskWidth = 56; // Approximate width of a task button in pixels
    const maxVisibleTasks =
      Math.floor((taskContainerWidth.value - 56) / taskWidth) || 3;

    if (allTasks.value.length <= maxVisibleTasks) {
      return allTasks.value;
    }

    return allTasks.value.slice(0, maxVisibleTasks);
  });

  const overflowTasks = useComputed(() => {
    if (allTasks.value.length <= visibleTasks.value.length) {
      return [];
    }

    return allTasks.value.slice(visibleTasks.value.length);
  });

  // Set default view when active page changes
  useSignalEffect(() => {
    if (activePage.value?.views?.length && !activeView.value) {
      activeView.value = activePage.value.views[0].id;

      if (activePage.value.views[0].subViews?.length) {
        activeSubView.value = activePage.value.views[0].subViews[0].id;
      } else {
        activeSubView.value = null;
      }
    }
  });

  // Handle resize for responsive behavior
  useSignalEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) { // Changed from 640 to 768 for better breakpoint
        deviceType.value = "mobile";
      } else if (width < 1024) {
        deviceType.value = "tablet";
      } else {
        deviceType.value = "desktop";
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  });

  // Methods
  const setActiveView = (viewId: string, pageHref?: string) => {
    const newView = activePage.value?.views?.find((view) => view.id === viewId);
    activeView.value = viewId;

    if (newView?.subViews?.length) {
      activeSubView.value = newView.subViews[0].id;
    } else {
      activeSubView.value = null;
    }

    // Close sidebar on mobile after selection
    if (deviceType.value === "mobile") {
      isSidebarOpen.value = false;
    }

    // Dispatch a custom event that pages can listen for
    const event = new CustomEvent("viewChange", {
      detail: {
        viewId,
        subViewId: newView?.subViews?.[0]?.id || null,
        pageHref: pageHref || activePage.value?.href,
      },
    });
    window.dispatchEvent(event);
  };

  const setActiveSubView = (subViewId: string) => {
    activeSubView.value = subViewId;

    // Close sidebar on mobile after selection
    if (deviceType.value === "mobile") {
      isSidebarOpen.value = false;
    }

    // Dispatch a custom event that pages can listen for
    const event = new CustomEvent("subViewChange", {
      detail: {
        viewId: activeView.value,
        subViewId,
        pageHref: activePage.value?.href,
      },
    });
    window.dispatchEvent(event);
  };

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const handleTaskAction = (task: NavTask) => {
    if (task.action) {
      task.action();
    }

    // Dispatch a custom event that pages can listen for
    const event = new CustomEvent("taskAction", {
      detail: {
        taskId: task.id,
        pageHref: activePage.value?.href,
        viewId: activeView.value,
      },
    });
    window.dispatchEvent(event);
  };

  const navigate = (href: string) => {
    onNavigate(href);
    isSidebarOpen.value = false;
  };

  // Create context value
  const contextValue: NavigatorContextType = {
    activeView,
    activeSubView,
    deviceType,
    isSidebarOpen,
    activePage,
    currentView,
    visibleTasks,
    overflowTasks,
    setActiveView,
    setActiveSubView,
    toggleSidebar,
    handleTaskAction,
    navigate,
  };

  return (
    <NavigatorContext.Provider value={contextValue}>
      {children}
    </NavigatorContext.Provider>
  );
}

// Hook to use navigator context
export function useNavigator() {
  const context = useContext(NavigatorContext);
  if (!context) {
    throw new Error("useNavigator must be used within a NavigatorProvider");
  }
  return context;
}

// Utility to measure element width
export function useResizeObserver(callback: (width: number) => void) {
  return (el: HTMLElement | null) => {
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callback(entry.contentRect.width);
      }
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  };
}
