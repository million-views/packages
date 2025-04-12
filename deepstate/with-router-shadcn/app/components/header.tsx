// src/components/Header.tsx
import { Moon, Sun, Menu, Code2 } from "lucide-react"; // Added Code2 icon
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SidebarContent from "./sidebar-content";
import { cn } from "@/lib/utils";

function Header({
    sidebarProps,
    isSheetOpen,
    onSheetOpenChange,
    className
}) {
  const { theme, setTheme } = useTheme();

  console.log ('theme: ', theme);

  return (
    // Removed bottom margin, added border-b here
    <header className={cn("flex items-center justify-between h-16 px-4 md:px-6 shrink-0 border-b", className)}>
      <div className="flex items-center gap-3 md:gap-4"> {/* Consistent gap */}
         {/* Mobile Sidebar Trigger */}
         <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden"> {/* Use ghost */}
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 pt-6 bg-background"> {/* Adjusted padding */}
             <SidebarContent {...sidebarProps} isMobile={true} />
          </SheetContent>
        </Sheet>

        {/* Logo/Title with Icon */}
        <div className="flex items-center gap-2">
             <Code2 className="h-6 w-6 text-primary hidden sm:block"/> {/* Optional Icon */}
             <h1 className="text-lg font-semibold sm:text-xl">Snippet Showcase</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme Toggle - using ghost variant */}
        <Button
          variant="ghost" // Changed to ghost
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}

export default Header;