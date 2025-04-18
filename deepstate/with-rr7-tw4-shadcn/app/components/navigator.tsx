"use client";

import * as React from "react";
import { Link, useLocation } from "react-router";
import { ChevronDown, ChevronRight, Home, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Icon } from "@/components/icon-mapper";
import type { NavigableRouteObject } from "@/route-helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigatorProps {
  routes: NavigableRouteObject[];
  level?: number;
  appName?: string;
  className?: string;
}

export function Navigator(
  { routes, level = 1, appName = "App", className }: NavigatorProps,
) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  // Check if we're on the home page
  const isHomePage = location.pathname === "/";

  // Check if a route is active
  const isActive = React.useCallback(
    (path = "", end = false) => {
      if (!path) return false;
      if (end) {
        return location.pathname === path;
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname],
  );

  // Get routes for the current level
  const currentLevelRoutes = React.useMemo(() => {
    return getRoutesForLevel(routes, level);
  }, [routes, level]);

  // Get child routes for the active parent
  const childRoutes = React.useMemo(() => {
    if (level <= 1) return [];

    // Find the active parent route at level-1
    const parentRoutes = getRoutesForLevel(routes, level - 1);
    const activeParent = parentRoutes.find((route) =>
      route.path && location.pathname.startsWith(route.path)
    );

    if (!activeParent || !activeParent.children) return [];
    return activeParent.children.filter((route) => !route.hideInNav);
  }, [routes, level, location.pathname]);

  // Generate breadcrumb items based on the current path
  const breadcrumbItems = React.useMemo(() => {
    if (isHomePage) return [];

    const items = [];

    // Always add home
    items.push({
      path: "/",
      label: "Home",
      isHome: true,
    });

    // Parse the current path to build breadcrumb segments
    const pathSegments = location.pathname.split("/").filter(Boolean);
    let currentPath = "";

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;

      // Find a matching route
      const matchingRoute = findRouteByPath(routes, currentPath);

      if (matchingRoute) {
        items.push({
          path: currentPath,
          label: matchingRoute.label ||
            segment.charAt(0).toUpperCase() + segment.slice(1),
          isLast: i === pathSegments.length - 1,
        });
      } else {
        // Fallback if no route is found
        items.push({
          path: currentPath,
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          isLast: i === pathSegments.length - 1,
        });
      }
    }

    return items;
  }, [location.pathname, isHomePage, routes]);

  // Helper function to find a route by path
  function findRouteByPath(
    routeList: NavigableRouteObject[],
    path: string,
  ): NavigableRouteObject | undefined {
    for (const route of routeList) {
      if (route.path === path) {
        return route;
      }
      if (route.children) {
        const found = findRouteByPath(route.children, path);
        if (found) return found;
      }
    }
    return undefined;
  }

  // Helper function to get routes at a specific level
  function getRoutesForLevel(
    routeList: NavigableRouteObject[],
    targetLevel: number,
    currentLevel = 1,
  ): NavigableRouteObject[] {
    if (currentLevel === targetLevel) {
      return routeList.filter((route) => !route.hideInNav);
    }

    if (currentLevel < targetLevel) {
      const result: NavigableRouteObject[] = [];
      routeList.forEach((route) => {
        if (route.children) {
          result.push(
            ...getRoutesForLevel(route.children, targetLevel, currentLevel + 1),
          );
        }
      });
      return result;
    }

    return [];
  }

  // Render a navigation item with potential dropdown for children
  const NavItem = (
    { route, mobile = false }: {
      route: NavigableRouteObject;
      mobile?: boolean;
    },
  ) => {
    const hasChildren = route.children &&
      route.children.some((child) => !child.hideInNav);
    const isRouteActive = isActive(route.path, route.end);

    if (hasChildren && !mobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isRouteActive ? "secondary" : "ghost"}
              className={cn(
                "flex items-center gap-2",
                mobile && "w-full justify-start",
              )}
            >
              {route.iconName && <Icon name={route.iconName} />}
              <span className={cn(mobile && "ml-2")}>{route.label}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {route.children
              ?.filter((child) => !child.hideInNav)
              .map((child, idx) => (
                <DropdownMenuItem key={idx} asChild>
                  <Link
                    to={child.path || ""}
                    className="flex items-center gap-2"
                  >
                    {child.iconName && <Icon name={child.iconName} />}
                    {child.label}
                  </Link>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        variant={isRouteActive ? "secondary" : "ghost"}
        asChild
        className={cn(
          "flex items-center gap-2",
          mobile && "w-full justify-start",
        )}
        onClick={mobile ? () => setOpen(false) : undefined}
      >
        <Link to={route.path || ""}>
          {route.iconName && <Icon name={route.iconName} />}
          <span className={cn(mobile && "ml-2")}>{route.label}</span>
        </Link>
      </Button>
    );
  };

  // Desktop navigation
  const DesktopNav = (
    <nav className={cn("hidden md:flex items-center space-x-4", className)}>
      <div className="flex items-center mr-6">
        <span className="text-xl font-bold">{appName}</span>
      </div>
      {currentLevelRoutes.map((route, index) => (
        <NavItem key={index} route={route} />
      ))}
    </nav>
  );

  // Child navigation (secondary level) - shown on desktop
  const ChildNav = !isMobile && childRoutes.length > 0 && (
    <div className="border-b">
      <div className="container flex overflow-x-auto">
        {childRoutes.map((route, index) => (
          <Button
            key={index}
            variant={isActive(route.path, route.end) ? "secondary" : "ghost"}
            asChild
            className="flex items-center gap-2"
          >
            <Link to={route.path || ""}>
              {route.iconName && <Icon name={route.iconName} />}
              {route.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );

  // Breadcrumb navigation - only shown on mobile
  const BreadcrumbNav = isMobile && !isHomePage && breadcrumbItems.length > 0 &&
    (
      <nav
        className="flex items-center text-sm text-muted-foreground py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        aria-label="Breadcrumb"
      >
        <div className="container flex items-center">
          <ol className="flex items-center space-x-2">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.path}>
                {index > 0 && (
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-1" />
                  </li>
                )}
                <li>
                  {item.isHome
                    ? (
                      <Link
                        to="/"
                        className="flex items-center hover:text-foreground transition-colors"
                        aria-label="Home"
                      >
                        <Home className="h-4 w-4" />
                      </Link>
                    )
                    : item.isLast
                    ? (
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                    )
                    : (
                      <Link
                        to={item.path}
                        className="hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </div>
      </nav>
    );

  // Mobile navigation
  const MobileNav = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-full pb-20">
          <div className="p-4">
            <div className="space-y-4">
              {/* Render all routes in mobile view, with proper nesting */}
              {renderMobileNavItems(routes.filter((route) => !route.hideInNav))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Helper function to render nested mobile navigation items
  function renderMobileNavItems(items: NavigableRouteObject[], depth = 0) {
    return items.map((item, index) => {
      const isItemActive = isActive(item.path, item.end);
      const hasChildren = item.children &&
        item.children.some((child) => !child.hideInNav);

      return (
        <div key={index}>
          <Button
            variant={isItemActive ? "secondary" : "ghost"}
            asChild
            className={cn("w-full justify-start", depth > 0 && "pl-6")}
            onClick={() => setOpen(false)}
          >
            <Link to={item.path || ""}>
              {item.iconName && <Icon name={item.iconName} />}
              <span className="ml-2">{item.label}</span>
            </Link>
          </Button>

          {/* Render children if they exist and the item is active */}
          {hasChildren && isItemActive && (
            <div className={cn("pl-6 border-l ml-4 mt-2 space-y-2")}>
              {renderMobileNavItems(
                item.children?.filter((child) => !child.hideInNav) || [],
                depth + 1,
              )}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center mr-4 md:mr-0">
              <span className="text-xl font-bold md:hidden">{appName}</span>
            </Link>
            {DesktopNav}
          </div>
          {MobileNav}
        </div>
      </header>
      {ChildNav}
      {BreadcrumbNav}
    </>
  );
}
