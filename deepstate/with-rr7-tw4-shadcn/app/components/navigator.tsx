"use client";

import * as React from "react";
import { Link, useLocation, useMatches } from "react-router";
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
import type { NavRoute } from "@/lib/rr-helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigatorProps {
  routes: NavRoute[];
  appName?: string;
  className?: string;
}

export function Navigator(
  { routes, appName = "App", className }: NavigatorProps,
) {
  const location = useLocation();
  const matches = useMatches();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  // Extract the current path segments
  const pathSegments = location.pathname.split("/").filter(Boolean);

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

  // Find all navigable routes (routes with a path and handle.label)
  const findNavigableRoutes = (routeList: NavRoute[]): NavRoute[] => {
    return routeList.flatMap((route) => {
      const isNavigable = route.path !== undefined && route.handle?.label;
      const result: NavRoute[] = isNavigable ? [route] : [];

      if (route.children) {
        result.push(...findNavigableRoutes(route.children));
      }

      return result;
    });
  };

  // Get the current route and its ancestors
  const getCurrentRouteHierarchy = React.useMemo(() => {
    // Start with an empty path
    let currentPath = "";
    const hierarchy: NavRoute[] = [];

    // Build up the path segment by segment and find matching routes
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;

      // Find a route that matches this path
      const findRouteByPath = (
        routeList: NavRoute[],
        path: string,
      ): NavRoute | undefined => {
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
      };

      const matchingRoute = findRouteByPath(routes, currentPath);
      if (matchingRoute) {
        hierarchy.push(matchingRoute);
      }
    }

    return hierarchy;
  }, [pathSegments, routes]);

  // Get top-level navigation items
  const topLevelNavItems = React.useMemo(() => {
    return routes[0]?.children?.filter((route) => route.handle?.label) || [];
  }, [routes]);

  // Get second-level navigation items based on the current active top-level item
  const secondLevelNavItems = React.useMemo(() => {
    if (getCurrentRouteHierarchy.length === 0) return [];

    // Find the active top-level route
    const activeTopLevel = topLevelNavItems.find(
      (route) => route.path && location.pathname.startsWith(`/${route.path}`),
    );

    if (!activeTopLevel || !activeTopLevel.children) return [];

    return activeTopLevel.children.filter((route) => route.handle?.label);
  }, [getCurrentRouteHierarchy, topLevelNavItems, location.pathname]);

  // Get third-level navigation items based on the current active second-level item
  const thirdLevelNavItems = React.useMemo(() => {
    if (getCurrentRouteHierarchy.length <= 1) return [];

    // Find the active second-level route
    const activeSecondLevel = secondLevelNavItems.find((route) => {
      if (!route.path) return false;

      // Handle index routes and regular routes differently
      if (route.index) {
        const parentPath = getCurrentRouteHierarchy[0]?.path || "";
        return location.pathname === `/${parentPath}`;
      }

      const fullPath = getCurrentRouteHierarchy[0]?.path
        ? `/${getCurrentRouteHierarchy[0].path}/${route.path}`
        : `/${route.path}`;

      return location.pathname.startsWith(fullPath);
    });

    if (!activeSecondLevel || !activeSecondLevel.children) return [];

    return activeSecondLevel.children.filter((route) => route.handle?.label);
  }, [getCurrentRouteHierarchy, secondLevelNavItems, location.pathname]);

  // Generate breadcrumb items based on the current path
  const breadcrumbItems = React.useMemo(() => {
    if (isHomePage) return [];

    const items = [];

    // Always add home
    items.push({
      path: "/",
      label: "Home",
      isHome: true,
      isLast: false, // Home is never the last item unless it's the only item
    });

    // Add items based on the route hierarchy
    getCurrentRouteHierarchy.forEach((route, index) => {
      if (route.handle?.label) {
        items.push({
          path: route.path ? `/${route.path}` : "/",
          label: route.handle.label,
          isHome: false,
          isLast: index === getCurrentRouteHierarchy.length - 1,
        });
      }
    });

    // If we only have the home item, mark it as last
    if (items.length === 1) {
      items[0].isLast = true;
    }

    return items;
  }, [isHomePage, getCurrentRouteHierarchy]);

  // Render a navigation item with potential dropdown for children
  const NavItem = (
    { route, mobile = false }: { route: NavRoute; mobile?: boolean },
  ) => {
    const hasChildren = route.children &&
      route.children.some((child) => child.handle?.label);
    const isRouteActive = isActive(
      route.path ? `/${route.path}` : "",
      route.handle?.end,
    );
    const meta = route.handle || {};

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
              {meta.iconName && <Icon name={meta.iconName} />}
              <span className={cn(mobile && "ml-2")}>{meta.label}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {route.children
              ?.filter((child) => child.handle?.label)
              .map((child, idx) => {
                const childMeta = child.handle || {};
                const childPath = child.index
                  ? `/${route.path || ""}`
                  : `/${route.path || ""}/${child.path || ""}`;

                return (
                  <DropdownMenuItem key={idx} asChild>
                    <Link to={childPath} className="flex items-center gap-2">
                      {childMeta.iconName && <Icon name={childMeta.iconName} />}
                      {childMeta.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    const routePath = route.index ? "/" : `/${route.path || ""}`;

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
        <Link to={routePath}>
          {meta.iconName && <Icon name={meta.iconName} />}
          <span className={cn(mobile && "ml-2")}>{meta.label}</span>
        </Link>
      </Button>
    );
  };

  // Top-level navigation (always visible)
  const TopLevelNav = (
    <nav className={cn("hidden md:flex items-center space-x-4", className)}>
      <div className="flex items-center mr-6">
        <span className="text-xl font-bold">{appName}</span>
      </div>
      {topLevelNavItems.map((route, index) => (
        <NavItem key={index} route={route} />
      ))}
    </nav>
  );

  // Second-level navigation (visible when in a section that has it)
  const SecondLevelNav = secondLevelNavItems.length > 0 && (
    <div className="border-b">
      <div className="container flex overflow-x-auto">
        {secondLevelNavItems.map((route, index) => {
          const meta = route.handle || {};
          const parentPath = getCurrentRouteHierarchy[0]?.path || "";
          const routePath = route.index
            ? `/${parentPath}`
            : `/${parentPath}/${route.path || ""}`;

          return (
            <Button
              key={index}
              variant={isActive(routePath, meta.end) ? "secondary" : "ghost"}
              asChild
              className="flex items-center gap-2"
            >
              <Link to={routePath}>
                {meta.iconName && <Icon name={meta.iconName} />}
                {meta.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );

  // Third-level navigation (visible when in a section that has it)
  const ThirdLevelNav = thirdLevelNavItems.length > 0 && (
    <div className="border-b">
      <div className="container flex overflow-x-auto">
        {thirdLevelNavItems.map((route, index) => {
          const meta = route.handle || {};
          const parentPath = getCurrentRouteHierarchy[0]?.path || "";
          const secondLevelPath = getCurrentRouteHierarchy[1]?.path || "";

          const routePath = route.index
            ? `/${parentPath}/${secondLevelPath}`
            : `/${parentPath}/${secondLevelPath}/${route.path || ""}`;

          return (
            <Button
              key={index}
              variant={isActive(routePath, meta.end) ? "secondary" : "ghost"}
              asChild
              className="flex items-center gap-2"
            >
              <Link to={routePath}>
                {meta.iconName && <Icon name={meta.iconName} />}
                {meta.label}
              </Link>
            </Button>
          );
        })}
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
              {/* Render all navigable routes in mobile view */}
              {renderMobileNavItems(topLevelNavItems)}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Helper function to render nested mobile navigation items
  function renderMobileNavItems(items: NavRoute[], depth = 0, parentPath = "") {
    return items.map((item, index) => {
      const meta = item.handle || {};
      const itemPath = item.index
        ? parentPath
        : parentPath
        ? `${parentPath}/${item.path || ""}`
        : `/${item.path || ""}`;

      const isItemActive = isActive(itemPath, meta.end);
      const hasChildren = item.children &&
        item.children.some((child) => child.handle?.label);

      return (
        <div key={index}>
          <Button
            variant={isItemActive ? "secondary" : "ghost"}
            asChild
            className={cn("w-full justify-start", depth > 0 && "pl-6")}
            onClick={() => setOpen(false)}
          >
            <Link to={itemPath}>
              {meta.iconName && <Icon name={meta.iconName} />}
              <span className="ml-2">{meta.label}</span>
            </Link>
          </Button>

          {/* Render children if they exist and the item is active */}
          {hasChildren && isItemActive && (
            <div className={cn("pl-6 border-l ml-4 mt-2 space-y-2")}>
              {renderMobileNavItems(
                item.children?.filter((child) => child.handle?.label) || [],
                depth + 1,
                itemPath,
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
            {TopLevelNav}
          </div>
          {MobileNav}
        </div>
      </header>
      {!isMobile && SecondLevelNav}
      {!isMobile && ThirdLevelNav}
      {BreadcrumbNav}
    </>
  );
}
