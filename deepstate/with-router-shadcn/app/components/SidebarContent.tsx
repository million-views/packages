
// src/components/SidebarContent.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SidebarContent({
  examples,
  selectedExampleId,
  onSelectExample,
  isMobile
}) {

  const paddingClass = isMobile ? 'px-4' : 'px-0'; // No horizontal padding needed if parent has it

  return (
    <nav className="flex flex-col gap-4 text-sm font-medium h-full">
      <div className={cn("flex flex-col gap-1", paddingClass)}>
        {/* Quieter heading */}
        <h2 className="text-xs font-medium uppercase text-muted-foreground tracking-wider mb-4 px-2">Examples</h2>
        {examples.map((example) => (
          <Button
            key={example.id}
            variant={selectedExampleId === example.id ? "secondary" : "ghost"}
            size="sm"
            // Added hover classes for visual feedback
            className={cn(
              "justify-start w-full px-2 h-9 rounded-md", // Ensure consistent height and rounding
              selectedExampleId !== example.id && "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onSelectExample(example.id)}
          >
            {example.name}
          </Button>
        ))}
      </div>
    </nav>
  );
}


export default SidebarContent; // Make sure SidebarContent is exported if not already