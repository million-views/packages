import clsx from "clsx";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  ChevronDown,
  ChevronRight,
  Home,
  Menu,
  MoreHorizontal,
  X,
} from "lucide-preact";

// Import our custom DaisyUI components
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./_components";
import type { FunctionComponent } from "preact";
import { NavigationProvider, useNavigation } from "./_navigationContext";

// Enhanced interfaces for task-focused navigation
interface NavTask {
  title: string;
  id: string;
  icon: FunctionComponent;
  action?: () => void;
}

interface NavView {
  title: string;
  id: string;
  icon?: FunctionComponent;
  subViews?: NavView[];
  tasks?: NavTask[];
}

interface NavItem {
  title: string;
  href: string;
  icon?: FunctionComponent;
  views?: NavView[];
  tasks?: NavTask[];
}

interface ResponsiveNavigatorProps {
  items: NavItem[];
  className?: string;
  mobileMenuClassName?: string;
  activeClassName?: string;
  logo?: FunctionComponent;
  defaultView?: string;
  defaultSubView?: string;
  showViewIndicators?: boolean;
  primaryTasks?: NavTask[];
}

type DeviceType = "mobile" | "tablet" | "desktop";

// Safe check for browser environment
const isBrowser = typeof window !== "undefined";

export default function ResponsiveNavigator({
  items,
  className,
  mobileMenuClassName,
  activeClassName = "bg-primary/10 text-primary font-medium",
  logo,
  defaultView,
  defaultSubView,
  showViewIndicators = false,
  primaryTasks = [],
}: ResponsiveNavigatorProps) {
  const {
    activeView,
    activeSubView,
    currentPage,
    navigateTo,
    handleViewChange,
    handleSubViewChange,
    handleTaskAction,
  } = useNavigation();

  // Safely determine pathname (only access window in the browser)
  const pathname = currentPage || (isBrowser ? window.location.pathname : "/");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [visibleTasks, setVisibleTasks] = useState<NavTask[]>([]);
  const [overflowTasks, setOverflowTasks] = useState<NavTask[]>([]);
  const taskContainerRef = useRef<HTMLDivElement>(null);

  // Find the current active page
  const activePage = items.find((item) =>
    pathname === item.href ||
    (pathname.startsWith(`${item.href}/`) && item.href !== "/")
  );
  // Find the current active view
  const currentView = activePage?.views?.find((view) => view.id === activeView);

  // Determine device type based on viewport width
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (!isBrowser) return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }

      // Recalculate visible and overflow tasks
      calculateTasksVisibility();
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate which tasks should be visible and which should go in overflow menu
  const calculateTasksVisibility = () => {
    if (!taskContainerRef.current) return;

    const containerWidth = taskContainerRef.current.offsetWidth;
    const taskWidth = 56; // Approximate width of a task button in pixels
    const maxVisibleTasks = Math.floor((containerWidth - 56) / taskWidth); // Reserve space for overflow menu

    // Combine primary tasks with page and view specific tasks
    const allTasks = [
      ...primaryTasks,
      ...(activePage?.tasks || []),
      ...(currentView?.tasks || []),
    ];

    if (allTasks.length <= maxVisibleTasks) {
      setVisibleTasks(allTasks);
      setOverflowTasks([]);
    } else {
      setVisibleTasks(allTasks.slice(0, maxVisibleTasks));
      setOverflowTasks(allTasks.slice(maxVisibleTasks));
    }
  };

  // Recalculate tasks when the active page or view changes
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (!isBrowser) return;

    calculateTasksVisibility();
  }, [activePage, currentView, primaryTasks]);

  // Set default view for the active page if available
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (!isBrowser) return;

    if (activePage?.views?.length && !activeView) {
      handleViewChange(activePage.views[0].id);

      // If the first view has subviews, set the first subview as active
      if (activePage.views[0].subViews?.length) {
        handleSubViewChange(activePage.views[0].subViews[0].id);
      }
    }
  }, [activePage, activeView]);

  // Handle task action
  const onTaskAction = (task: NavTask) => {
    handleTaskAction(task.id, task.action);

    // Close task menu if open
    setIsTaskMenuOpen(false);
  };

  // Render breadcrumb for mobile/tablet
  const renderBreadcrumb = () => {
    if (!activePage) return null;

    return (
      <div className="flex items-center text-sm text-base-content/70 px-4 h-10 border-b overflow-hidden">
        <span className="truncate">{activePage.title}</span>
        {activeView && (
          <>
            <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            <span className="truncate">{currentView?.title}</span>
          </>
        )}
        {activeSubView && currentView?.subViews && (
          <>
            <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            <span className="truncate">
              {currentView.subViews.find((sv) => sv.id === activeSubView)
                ?.title}
            </span>
          </>
        )}
      </div>
    );
  };

  // Render desktop navigation
  const renderDesktopNavigation = () => {
    return (
      <>
        {/* Main Navigation - Always present */}
        <nav className={clsx("w-full bg-base-100 border-b", className)}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                {logo || (
                  <Button
                    variant="ghost"
                    className="font-bold text-xl"
                    onClick={() => navigateTo("/")}
                  >
                    <Home className="h-5 w-5 mr-2" />
                    App
                  </Button>
                )}
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {items.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={clsx(
                      "px-3 py-2 rounded-md text-sm",
                      (pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)) &&
                        activeClassName,
                    )}
                    onClick={() => navigateTo(item.href)}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.title}
                    {showViewIndicators && item.views &&
                      item.views.length > 0 && (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>

              {/* Task buttons container */}
              <div
                ref={taskContainerRef}
                className="flex items-center space-x-1"
              >
                {visibleTasks.map((task) => (
                  <TooltipProvider key={task.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onTaskAction(task)}
                          className="h-9 w-9"
                        >
                          {task.icon}
                          <span className="sr-only">{task.title}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{task.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}

                {overflowTasks.length > 0 && (
                  <DropdownMenu
                    open={isTaskMenuOpen}
                    onOpenChange={setIsTaskMenuOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {overflowTasks.map((task) => (
                        <DropdownMenuItem
                          key={task.id}
                          onClick={() => onTaskAction(task)}
                        >
                          {task.icon && (
                            <span className="mr-2">{task.icon}</span>
                          )}
                          {task.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden h-9 w-9"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Second Row for SPA Views - Only on desktop/tablet */}
        {deviceType !== "mobile" && (
          <div className="w-full bg-base-200 border-b h-12">
            {activePage?.views && activePage.views.length > 0
              ? (
                <div className="container mx-auto px-4 h-full">
                  <div className="flex items-center h-full overflow-x-auto">
                    {activePage.views.map((view) => (
                      <div key={view.id} className="relative group h-full">
                        {view.subViews && view.subViews.length > 0
                          ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={clsx(
                                    "h-full rounded-none border-b-2 border-transparent",
                                    activeView === view.id &&
                                      "border-primary text-primary font-medium",
                                  )}
                                >
                                  {view.icon && (
                                    <span className="mr-1">{view.icon}</span>
                                  )}
                                  {view.title}
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                className="w-48"
                              >
                                {view.subViews.map((subView) => (
                                  <DropdownMenuItem
                                    key={subView.id}
                                    className={clsx(
                                      activeSubView === subView.id &&
                                        "bg-primary/10 text-primary font-medium",
                                    )}
                                    onClick={() => {
                                      handleViewChange(view.id);
                                      handleSubViewChange(subView.id);
                                    }}
                                  >
                                    {subView.icon && (
                                      <span className="mr-2">
                                        {subView.icon}
                                      </span>
                                    )}
                                    {subView.title}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )
                          : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={clsx(
                                "h-full rounded-none border-b-2 border-transparent",
                                activeView === view.id &&
                                  "border-primary text-primary font-medium",
                              )}
                              onClick={() =>
                                handleViewChange(view.id, activePage.href)}
                            >
                              {view.icon && (
                                <span className="mr-1">{view.icon}</span>
                              )}
                              {view.title}
                            </Button>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )
              : (
                // Empty placeholder to maintain consistent layout
                <div
                  className="container mx-auto px-4 h-full"
                  aria-hidden="true"
                >
                </div>
              )}
          </div>
        )}

        {/* Third Row for Sub-Views (only shown when the active view has sub-views) - Only on desktop/tablet */}
        {deviceType !== "mobile" && currentView?.subViews &&
          currentView.subViews.length > 0 && (
          <div className="w-full bg-base-100 border-b h-10">
            <div className="container mx-auto px-4 h-full">
              <div className="flex items-center h-full overflow-x-auto">
                {currentView.subViews.map((subView) => (
                  <Button
                    key={subView.id}
                    variant="ghost"
                    size="sm"
                    className={clsx(
                      "h-full rounded-none text-xs border-b-2 border-transparent",
                      activeSubView === subView.id &&
                        "border-primary text-primary font-medium",
                    )}
                    onClick={() => handleSubViewChange(subView.id)}
                  >
                    {subView.icon && (
                      <span className="mr-1">{subView.icon}</span>
                    )}
                    {subView.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Render mobile navigation
  const renderMobileNavigation = () => {
    return (
      <>
        {/* Mobile Header */}
        <nav
          className={clsx(
            "w-full bg-base-100 border-b sticky top-0 z-50",
            className,
          )}
        >
          <div className="flex items-center justify-between h-14 px-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              {logo || (
                <Button
                  variant="ghost"
                  className="font-bold"
                  onClick={() => navigateTo("/")}
                >
                  <Home className="h-5 w-5 mr-2" />
                  App
                </Button>
              )}
            </div>

            {/* Task buttons container */}
            <div className="flex items-center space-x-1">
              {visibleTasks.map((task) => (
                <Button
                  key={task.id}
                  variant="ghost"
                  size="icon"
                  onClick={() => onTaskAction(task)}
                  className="h-9 w-9"
                >
                  {task.icon}
                  <span className="sr-only">{task.title}</span>
                </Button>
              ))}

              {overflowTasks.length > 0 && (
                <DropdownMenu
                  open={isTaskMenuOpen}
                  onOpenChange={setIsTaskMenuOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {overflowTasks.map((task) => (
                      <DropdownMenuItem
                        key={task.id}
                        onClick={() => onTaskAction(task)}
                      >
                        {task.icon && <span className="mr-2">{task.icon}</span>}
                        {task.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="h-9 w-9"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Breadcrumb for mobile */}
          {renderBreadcrumb()}
        </nav>

        {/* Mobile Sidebar */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="w-full max-w-sm p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-left">Navigation</SheetTitle>
              <SheetClose className="absolute right-4 top-4">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </SheetHeader>

            <div className="overflow-y-auto h-full pb-20">
              {/* Main Navigation */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-base-content/70 mb-2">
                  Main Navigation
                </h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className={clsx(
                        "w-full justify-start text-left px-3 py-2 rounded-md text-sm",
                        (pathname === item.href ||
                          pathname.startsWith(`${item.href}/`)) &&
                          activeClassName,
                      )}
                      onClick={() => {
                        navigateTo(item.href);
                        setIsSidebarOpen(false);
                      }}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Views for current page */}
              {activePage?.views && activePage.views.length > 0 && (
                <div className="p-4 border-t">
                  <h3 className="text-sm font-medium text-base-content/70 mb-2">
                    {activePage.title} Views
                  </h3>
                  <div className="space-y-1">
                    {activePage.views.map((view) => (
                      <div key={view.id}>
                        <Button
                          variant="ghost"
                          className={clsx(
                            "w-full justify-start text-left px-3 py-2 rounded-md text-sm",
                            activeView === view.id && activeClassName,
                          )}
                          onClick={() =>
                            handleViewChange(view.id, activePage.href)}
                        >
                          {view.icon && (
                            <span className="mr-2">{view.icon}</span>
                          )}
                          {view.title}
                        </Button>

                        {/* Sub-views */}
                        {activeView === view.id && view.subViews &&
                          view.subViews.length > 0 && (
                          <div className="ml-6 space-y-1 mt-1">
                            {view.subViews.map((subView) => (
                              <Button
                                key={subView.id}
                                variant="ghost"
                                size="sm"
                                className={clsx(
                                  "w-full justify-start text-left px-3 py-1.5 rounded-md text-sm",
                                  activeSubView === subView.id &&
                                    activeClassName,
                                )}
                                onClick={() => handleSubViewChange(subView.id)}
                              >
                                {subView.icon && (
                                  <span className="mr-2">{subView.icon}</span>
                                )}
                                {subView.title}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {(primaryTasks.length > 0 || activePage?.tasks?.length ||
                currentView?.tasks?.length) && (
                <div className="p-4 border-t">
                  <h3 className="text-sm font-medium text-base-content/70 mb-2">
                    Tasks
                  </h3>
                  <div className="space-y-1">
                    {[
                      ...primaryTasks,
                      ...(activePage?.tasks || []),
                      ...(currentView?.tasks || []),
                    ].map((task) => (
                      <Button
                        key={task.id}
                        variant="ghost"
                        className="w-full justify-start text-left px-3 py-2 rounded-md text-sm"
                        onClick={() => {
                          onTaskAction(task);
                          setIsSidebarOpen(false);
                        }}
                      >
                        {task.icon && <span className="mr-2">{task.icon}</span>}
                        {task.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  };

  // If we're server-side rendering, return minimal skeleton
  if (!isBrowser) {
    return (
      <header className="sticky top-0 z-50 w-full">
        <nav className={clsx("w-full bg-base-100 border-b", className)}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <Button
                  variant="ghost"
                  className="font-bold text-xl"
                >
                  <Home className="h-5 w-5 mr-2" />
                  App
                </Button>
              </div>
              <div className="hidden md:flex space-x-1">
                {items.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="px-3 py-2 rounded-md text-sm"
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.title}
                  </Button>
                ))}
              </div>
              <div className="flex items-center space-x-1"></div>
            </div>
          </div>
        </nav>
        <div className="w-full bg-base-200 border-b h-12">
          <div className="container mx-auto px-4 h-full" aria-hidden="true">
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {deviceType === "mobile"
        ? renderMobileNavigation()
        : renderDesktopNavigation()}
    </header>
  );
}

import { navigationItems, primaryTasks } from "./_navigation";

// Wrapper component that includes the NavigationProvider
export function NavigatorWithRouter() {
  return (
    <NavigationProvider>
      <ResponsiveNavigator
        items={navigationItems}
        primaryTasks={primaryTasks}
      />
    </NavigationProvider>
  );
}
