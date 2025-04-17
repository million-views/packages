"use client";

import * as React from "react";
import { Link, useLocation, useMatches } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

// Types for route items
export interface RouteItem {
  label: string;
  path?: string;
  Icon?: React.ReactNode;
  end?: boolean;
  collapsible?: boolean;
  children?: (RouteItem | undefined)[];
}

interface NavigatorProps {
  routes: RouteItem[];
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

  // Filter out undefined routes (for conditional routes)
  const filteredRoutes = React.useMemo(() => {
    return routes.filter(Boolean) as RouteItem[];
  }, [routes]);

  // Check if a route is active
  const isActive = React.useCallback(
    (path?: string, end = false) => {
      if (!path) return false;

      if (end) {
        return location.pathname === path;
      }

      return location.pathname.startsWith(path);
    },
    [location.pathname],
  );

  // Desktop navigation
  const DesktopNav = (
    <nav className={cn("hidden md:flex items-center space-x-4", className)}>
      <div className="flex items-center mr-6">
        <span className="text-xl font-bold">{appName}</span>
      </div>
      {filteredRoutes.map((route, index) => {
        if (route.children && route.children.length > 0) {
          return (
            <Collapsible key={index} className="relative group">
              <CollapsibleTrigger asChild>
                <Button
                  variant={isActive(route.path) ? "secondary" : "ghost"}
                  className="flex items-center gap-2"
                >
                  {route.Icon}
                  {route.label}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="absolute top-full left-0 z-50 min-w-[200px] bg-background border rounded-md shadow-md p-2 mt-1">
                {route.children.filter(Boolean).map((child, childIndex) => (
                  <Button
                    key={childIndex}
                    variant={isActive(child?.path) ? "secondary" : "ghost"}
                    asChild
                    className="w-full justify-start"
                  >
                    <Link to={child?.path || "#"}>
                      {child?.Icon}
                      <span className="ml-2">{child?.label}</span>
                    </Link>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        }

        return (
          <Button
            key={index}
            variant={isActive(route.path, route.end) ? "secondary" : "ghost"}
            asChild
            className="flex items-center gap-2"
          >
            <Link to={route.path || "#"}>
              {route.Icon}
              {route.label}
            </Link>
          </Button>
        );
      })}
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
              {filteredRoutes.map((route, index) => {
                if (route.children && route.children.length > 0) {
                  return (
                    <Collapsible key={index} className="w-full">
                      <div className="flex items-center justify-between">
                        {route.path
                          ? (
                            <Button
                              variant={isActive(route.path)
                                ? "secondary"
                                : "ghost"}
                              asChild
                              className="w-full justify-start"
                              onClick={() => setOpen(false)}
                            >
                              <Link to={route.path}>
                                {route.Icon}
                                <span className="ml-2">{route.label}</span>
                              </Link>
                            </Button>
                          )
                          : (
                            <div className="flex items-center py-2 px-4 text-sm font-medium">
                              {route.Icon}
                              <span className="ml-2">{route.label}</span>
                            </div>
                          )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <div className="pl-6 border-l ml-4 mt-2 space-y-2">
                          {route.children.filter(Boolean).map((
                            child,
                            childIndex,
                          ) => (
                            <Button
                              key={childIndex}
                              variant={isActive(child?.path)
                                ? "secondary"
                                : "ghost"}
                              asChild
                              className="w-full justify-start"
                              onClick={() => setOpen(false)}
                            >
                              <Link to={child?.path || "#"}>
                                {child?.Icon}
                                <span className="ml-2">{child?.label}</span>
                              </Link>
                            </Button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                return (
                  <Button
                    key={index}
                    variant={isActive(route.path, route.end)
                      ? "secondary"
                      : "ghost"}
                    asChild
                    className="w-full justify-start"
                    onClick={() => setOpen(false)}
                  >
                    <Link to={route.path || "#"}>
                      {route.Icon}
                      <span className="ml-2">{route.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
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
  );
}
