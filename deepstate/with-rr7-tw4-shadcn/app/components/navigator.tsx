"use client";

import * as React from "react";
import { Link, useLocation, useMatches } from "react-router";
import { Menu } from "lucide-react";
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

// Types for route items
export interface RouteItem {
  label: string;
  path: string;
  iconName?: string;
  end?: boolean;
  views?: RouteViewItem[];
}

export interface RouteViewItem {
  label: string;
  path: string;
  iconName?: string;
  end?: boolean;
}

interface NavigatorProps {
  routes: RouteItem[];
  viewRoutes?: RouteViewItem[];
  appName?: string;
  className?: string;
}

export function Navigator(
  { routes, viewRoutes, appName = "App", className }: NavigatorProps,
) {
  const location = useLocation();
  const matches = useMatches();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  // Check if a route is active
  const isActive = React.useCallback(
    (path: string, end = false) => {
      if (end) {
        return location.pathname === path;
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname],
  );

  // Find the current active main route
  const activeMainRoute = React.useMemo(() => {
    return routes.find((route) => isActive(route.path));
  }, [routes, isActive]);

  // Desktop navigation
  const DesktopNav = (
    <nav className={cn("hidden md:flex items-center space-x-4", className)}>
      <div className="flex items-center mr-6">
        <span className="text-xl font-bold">{appName}</span>
      </div>
      {routes.map((route, index) => (
        <Button
          key={index}
          variant={isActive(route.path, route.end) ? "secondary" : "ghost"}
          asChild
          className="flex items-center gap-2"
        >
          <Link to={route.path}>
            {route.iconName && <Icon name={route.iconName} />}
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  );

  // View navigation (secondary level)
  const ViewNav = viewRoutes && viewRoutes.length > 0 && (
    <div className="border-b">
      <div className="container flex overflow-x-auto">
        {viewRoutes.map((view, index) => (
          <Button
            key={index}
            variant={isActive(view.path, view.end) ? "secondary" : "ghost"}
            asChild
            className="flex items-center gap-2"
          >
            <Link to={view.path}>
              {view.iconName && <Icon name={view.iconName} />}
              {view.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
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
              {routes.map((route, index) => {
                const isRouteActive = isActive(route.path, route.end);

                return (
                  <div key={index}>
                    <Button
                      variant={isRouteActive ? "secondary" : "ghost"}
                      asChild
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <Link to={route.path}>
                        {route.iconName && <Icon name={route.iconName} />}
                        <span className="ml-2">{route.label}</span>
                      </Link>
                    </Button>

                    {/* Show views for the active route */}
                    {isRouteActive && route.views && route.views.length > 0 && (
                      <div className="pl-6 border-l ml-4 mt-2 space-y-2">
                        {route.views.map((view, viewIndex) => (
                          <Button
                            key={viewIndex}
                            variant={isActive(view.path, view.end)
                              ? "secondary"
                              : "ghost"}
                            asChild
                            className="w-full justify-start"
                            onClick={() => setOpen(false)}
                          >
                            <Link to={view.path}>
                              {view.iconName && <Icon name={view.iconName} />}
                              <span className="ml-2">{view.label}</span>
                            </Link>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

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
      {ViewNav}
    </>
  );
}
