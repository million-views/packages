// src/components/Sidebar.tsx
import SidebarContent from '@/components/SidebarContent';
import { cn } from "@/lib/utils";

function Sidebar({ className, ...props }) {
  return (
    // Added padding-top (pt-6) to align content below header approx
    // Use cn to merge classes
    // This controls visibility based on breakpoint, works with grid layout
    <aside className="hidden md:block w-64 border-r bg-muted/40 p-10 overflow-y-auto shrink-0">
         {/* Pass isMobile=false explicitly for the desktop sidebar */}
         <SidebarContent {...props} isMobile={false} />
    </aside>
  );
}
export default Sidebar;
