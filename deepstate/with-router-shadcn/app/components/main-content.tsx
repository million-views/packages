import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, FileText, Clipboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query"; // Import the hook
// import CodeBlock from "@/components/code-block";
import DynamicComponentLoader from '@/components/DynamicComponentLoader';
import DynamicCodeBlock from '@/components/DynamicCodeBlock';

export default function MainContent(props) {
  // console.log ('props: ', props);
  const {name, code, output, documentation, className} = props;

  // console.log ('MainContent - key: ', name, code);

  const isSmallScreen = useMediaQuery("(max-width: 64rem)"); // True if screen is < 768px
  // Define panel sizes conditionally
  const horizontalLayoutSizes = { editor: 65, output: 35 };
  const verticalLayoutSizes = { editor: 60, output: 40 }; // Adjust as needed


    return (
      <main>
        <ResizablePanelGroup
            direction={isSmallScreen ? "vertical" : "horizontal"}
            className="@container grid grid-cols-1 lg:grid-cols-23 gap-1"
          >
          {/* Editor Panel */}
          <ResizablePanel 
            className="@container h-full"
            defaultSize={isSmallScreen ? verticalLayoutSizes.editor : horizontalLayoutSizes.editor}
            minSize={35} // Keep a reasonable minSize
            > 
             <div className="@container w-[98cqw] @md:w-[98cqw] h-[98cqh] grid p-4 @sm:p-6"> {/* Adjust padding for small screens */}
              <Tabs defaultValue="code" className="flex flex-col overflow-hidden h-[90cqh]">
                {/* ... TabsList with Copy Button ... */}
                <TabsList className="shrink-0 justify-start bg-transparent mb-3 p-0 rounded-none w-full">
                    <TabsTrigger value="code"> 
                      <Code className="h-4 w-4" /> Code
                    </TabsTrigger>
                    <TabsTrigger value="documentation" > 
                      <FileText className="h-4 w-4" /> Documentation
                    </TabsTrigger>
                </TabsList>
                {/* ... TabsContent ... */}
                <TabsContent value="code" className="overflow-auto rounded-lg p-4 pb-10 min-h-[150px]"> {/* Added min-height */}
                  {/* Code goes here... */}
                  <DynamicCodeBlock filename={name} language="javascript" />
                  {/* <code>{code}</code> */}
                </TabsContent>
                <TabsContent value="documentation" className="flex-1 overflow-auto rounded-lg border p-4 min-h-[150px]"> {/* Added min-height */}
                  <p className="text-sm text-muted-foreground">{documentation}</p>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

           {/* Handle adapts automatically based on direction */}
           <ResizableHandle withHandle className="w-1 h-full md:h-full md:w-1 bg-transparent hover:bg-primary/10 active:bg-primary/20 data-[resize-handle-state=drag]:bg-primary/20 transition-colors duration-150 group data-[panel-group-direction=vertical]:h-2 data-[panel-group-direction=vertical]:w-full" >
              <div className="w-1 h-8 md:w-1 md:h-8 bg-border rounded-full my-auto md:my-auto md:mx-auto group-hover:bg-primary/50 group-data-[resize-handle-state=drag]:bg-primary/50 transition-colors duration-150 data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-8 data-[panel-group-direction=vertical]:mx-auto"></div>
            </ResizableHandle>

          {/* Output Panel */}
          <ResizablePanel 
            className="@container"
            defaultSize={isSmallScreen ? verticalLayoutSizes.output : horizontalLayoutSizes.output}
            minSize={35} // Keep a reasonable minSize
            >
            <div className="w-[98cqw] @md: w-[98cqw] flex flex-col h-full p-4 sm:p-6"> {/* Adjust padding for small screens */}
              {/* ... Output Header ... */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b shrink-0">
                <h3 className="text-base font-medium text-foreground">Output</h3>
              </div>
              {/* ... Output Content Area ... */}
              {/* <div className="flex-1 overflow-auto rounded-lg bg-muted p-4 min-h-[100px]"> Added min-height */}
                {/* <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words h-full outline-none">
                    {output}
                </pre> */}
                <DynamicComponentLoader filename={name} />                
              {/* </div> */}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    )
}
