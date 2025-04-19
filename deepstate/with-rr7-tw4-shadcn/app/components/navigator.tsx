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
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isHomePage = location.pathname === "/";

  const isActive = React.useCallback(
    (path = "", end = false) =>
      end ? location.pathname === path : location.pathname.startsWith(path),
    [location.pathname],
  );

  const hierarchy = React.useMemo(() => {
    let cur = "";
    const h: NavRoute[] = [];
    const findRoute = (list: NavRoute[], p: string): NavRoute | undefined => {
      for (const r of list) {
        if (r.path === p) return r;
        if (r.children) {
          const found = findRoute(r.children, p);
          if (found) return found;
        }
      }
    };
    pathSegments.forEach((seg) => {
      cur += `/${seg}`;
      const match = findRoute(routes, cur);
      if (match) h.push(match);
    });
    return h;
  }, [pathSegments, routes]);

  const topLevel = routes[0]?.children?.filter((r) => r.handle?.label) ?? [];
  const secondLevel = React.useMemo(() => {
    const active = topLevel.find(
      (r) => r.path && location.pathname.startsWith(`/${r.path}`),
    );
    return active?.children?.filter((r) => r.handle?.label) ?? [];
  }, [topLevel, location.pathname]);

  const thirdLevel = React.useMemo(() => {
    const active2 = secondLevel.find((r) => {
      const prefix = hierarchy[0]?.path ? `/${hierarchy[0].path}` : "";
      const full = r.index ? prefix : `${prefix}/${r.path}`;
      return location.pathname.startsWith(full);
    });
    return active2?.children?.filter((r) => r.handle?.label) ?? [];
  }, [secondLevel, hierarchy, location.pathname]);

  const breadcrumbs = React.useMemo(() => {
    if (isHomePage) return [];
    const items: {
      path: string;
      label: string;
      isHome: boolean;
      isLast: boolean;
    }[] = [
      { path: "/", label: "Home", isHome: true, isLast: false },
    ];
    hierarchy.forEach((r, idx) => {
      if (r.handle?.label) {
        items.push({
          path: r.index
            ? `/${hierarchy.slice(0, idx + 1).map((h) => h.path).join("/")}`
            : `/${r.path}`,
          label: r.handle.label,
          isHome: false,
          isLast: idx === hierarchy.length - 1,
        });
      }
    });
    if (items.length === 1) items[0].isLast = true;
    return items;
  }, [hierarchy, isHomePage]);

  return (
    <>
      <Header
        appName={appName}
        className={className}
        topLevel={topLevel}
        isMobile={isMobile}
        open={open}
        setOpen={setOpen}
      />
      {!isMobile && <LevelNav items={secondLevel} />}
      {!isMobile && <LevelNav items={thirdLevel} />}
      {isMobile && !isHomePage && <BreadcrumbNav items={breadcrumbs} />}
    </>
  );
}

function Header({
  appName,
  className,
  topLevel,
  isMobile,
  open,
  setOpen,
}: {
  appName: string;
  className?: string;
  topLevel: NavRoute[];
  isMobile: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className={cn("text-xl font-bold", isMobile && "md:hidden")}>
            {appName}
          </span>
        </Link>
        {!isMobile
          ? (
            <nav className={cn("flex items-center space-x-4", className)}>
              {topLevel.map((r, i) => (
                <NavItem key={i} route={r} setOpen={setOpen} mobile={false} />
              ))}
            </nav>
          )
          : <MobileNav open={open} setOpen={setOpen} items={topLevel} />}
      </div>
    </header>
  );
}

function LevelNav({ items }: { items: NavRoute[] }) {
  if (!items.length) return null;
  return (
    <div className="border-b">
      <div className="container flex overflow-x-auto">
        {items.map((r, i) => (
          <NavItem key={i} route={r} mobile={false} setOpen={undefined} />
        ))}
      </div>
    </div>
  );
}

function BreadcrumbNav({
  items,
}: {
  items: { path: string; label: string; isHome: boolean; isLast: boolean }[];
}) {
  return (
    <nav
      className="flex items-center text-sm text-muted-foreground py-4 border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 overflow-x-auto whitespace-nowrap"
      aria-label="Breadcrumb"
    >
      <div className="container flex items-center">
        <ol className="flex items-center space-x-2">
          {items.map((item, idx) => (
            <React.Fragment key={item.path}>
              {idx > 0 && (
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
}

function NavItem({
  route,
  mobile = false,
  setOpen,
}: {
  route: NavRoute;
  mobile?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const location = useLocation();
  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);
  const meta = route.handle || {};
  const base = route.index ? "/" : `/${route.path}`;
  const hasKids = route.children?.some((c) => c.handle?.label);

  if (hasKids && !mobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isActive(base, meta.end) ? "secondary" : "ghost"}
            className="flex items-center gap-2"
          >
            {meta.iconName && <Icon name={meta.iconName} />}
            <span>{meta.label}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {route.children!.filter((c) => c.handle?.label).map((c, i) => (
            <DropdownMenuItem key={i} asChild>
              <Link
                to={c.index ? base : `${base}/${c.path}`}
                className="flex items-center gap-2"
                onClick={() => setOpen?.(false)}
              >
                {c.handle?.iconName && <Icon name={c.handle.iconName} />}
                {c.handle?.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant={isActive(base, meta.end) ? "secondary" : "ghost"}
      asChild
      className={cn(mobile && "w-full justify-start")}
      onClick={() => setOpen?.(false)}
    >
      <Link to={base} className="flex items-center gap-2">
        {meta.iconName && <Icon name={meta.iconName} />}
        <span>{meta.label}</span>
      </Link>
    </Button>
  );
}

function MobileNav({
  open,
  setOpen,
  items,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items: NavRoute[];
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-full pb-20 p-4 space-y-4">
          {items.map((r, i) => (
            <NavItem key={i} route={r} mobile setOpen={setOpen} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
