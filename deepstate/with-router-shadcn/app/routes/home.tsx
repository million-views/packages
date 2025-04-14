import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { examples } from '@/components/data';
import type { Route } from "./+types/home";

import MainContent from "@/components/MainContent";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

export default function Home() {
  const [selectedExampleId, setSelectedExampleId] = useState<string>(examples[0].id);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const selectedExample = examples.find(ex => ex.id === selectedExampleId) || examples[0];

  const handleSelectExample = (id: string) => {
    setSelectedExampleId(id);
    setIsSheetOpen(false);
  };

  const sidebarProps = {
    examples: examples,
    selectedExampleId: selectedExampleId,
    onSelectExample: handleSelectExample,
  };

  return (
    <div className="grid h-screen grid-rows-[auto_1fr] bg-background text-foreground max-w-screen-2xl mx-auto overflow-hidden">
      {/* Header: Spans the full width of the grid implicitly in the first row */}
      <Header
        sidebarProps={sidebarProps}
        isSheetOpen={isSheetOpen}
        onSheetOpenChange={setIsSheetOpen}
        // Add grid-specific classes if needed, but usually placed by row/col on children
        // className="col-span-full" // Usually not needed for single item in first row
      />

      {/* Container for the second row content (Sidebar + Main) */}
      {/* Use grid here too, responsive columns */}
      {/* Mobile: Single column */}
      {/* Desktop (md+): Two columns - Sidebar (fixed width) + MainContent (remaining width) */}
      {/* overflow-hidden is important for grid areas containing scrollable/resizable content */}
      <div className="grid grid-cols-1 md:grid-cols-[theme(width.64)_1fr] overflow-hidden gap-1">
        {/* Sidebar: Placed in the first column on desktop, hidden on mobile */}
        {/* The 'hidden md:block' handles visibility */}
        <Sidebar {...sidebarProps} />

        <MainContent
          name={selectedExample.id}
          code={selectedExample.code}
          output={selectedExample.output}
          documentation="Documentation content goes here..."
          // Add overflow-hidden here if MainContent root doesn't handle it sufficiently
          // className="overflow-hidden"
        />
      </div>
    </div>
  );
}
