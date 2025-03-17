import { useEffect, useState } from "preact/hooks";
import { ArrowRight } from "lucide-preact";
import { Card, CardContent, CardHeader, CardTitle } from "./_components";
import { useNavigation } from "./_navigationContext";

// Dashboard content component
function DashboardContent() {
  // Use the navigation context directly instead of local state
  const {
    activeView,
    activeSubView,
    currentPage,
    handleViewChange,
    handleSubViewChange,
  } = useNavigation();

  // On initial render, set default view and subview if not already set
  useEffect(() => {
    if (!activeView && currentPage === "/dashboard") {
      // Set initial view to "overview" if not already set
      handleViewChange("overview");

      // Set initial subview to "summary" if not already set
      if (!activeSubView) {
        handleSubViewChange("summary");
      }
    }
  }, [
    activeView,
    activeSubView,
    currentPage,
    handleViewChange,
    handleSubViewChange,
  ]);

  // Listen for task action events
  useEffect(() => {
    const handleTaskAction = (event) => {
      console.log("Task action:", event.detail.taskId);
      // Handle specific task actions here
    };

    window.addEventListener("taskAction", handleTaskAction);
    return () => {
      window.removeEventListener("taskAction", handleTaskAction);
    };
  }, []);

  // Default to overview and summary if no active view/subview
  const currentView = activeView || "overview";
  const currentSubView = activeSubView || "summary";

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      {(currentView === "overview" || !currentView) && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

          {(currentSubView === "summary" || !currentSubView) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                  <p className="text-base-content/60 text-sm">
                    Active users in your platform
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">1,234</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <p className="text-base-content/60 text-sm">
                    Monthly revenue
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">$12,345</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                  <p className="text-base-content/60 text-sm">
                    Current active projects
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">42</p>
                </CardContent>
              </Card>
            </div>
          )}

          {currentSubView === "performance" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Performance Metrics
              </h2>
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <p className="text-base-content/60 text-sm">
                    Key performance indicators
                  </p>
                </CardHeader>
                <CardContent>
                  <p>Performance metrics content goes here...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {currentSubView === "metrics" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Business Metrics</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                  <p className="text-base-content/60 text-sm">
                    Business growth indicators
                  </p>
                </CardHeader>
                <CardContent>
                  <p>Business metrics content goes here...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {currentView === "analytics" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <p className="text-base-content/60 text-sm">
                Key performance indicators
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Page Views</span>
                  <div className="flex items-center">
                    <span className="font-medium">12,543</span>
                    <ArrowRight className="h-4 w-4 ml-2 text-success" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <div className="flex items-center">
                    <span className="font-medium">3.2%</span>
                    <ArrowRight className="h-4 w-4 ml-2 text-success" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bounce Rate</span>
                  <div className="flex items-center">
                    <span className="font-medium">42.1%</span>
                    <ArrowRight className="h-4 w-4 ml-2 text-error transform rotate-45" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentView === "reports" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Reports</h1>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Report</CardTitle>
                <p className="text-base-content/60 text-sm">
                  Performance summary for the current month
                </p>
              </CardHeader>
              <CardContent>
                <p>This is the monthly report content.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Report</CardTitle>
                <p className="text-base-content/60 text-sm">
                  Performance summary for the current quarter
                </p>
              </CardHeader>
              <CardContent>
                <p>This is the quarterly report content.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}

// Wrapper component to use NavigationProvider
export default function Dashboard() {
  // Note: We're not wrapping with NavigationProvider here as it's already
  // provided by the layout component
  return <DashboardContent />;
}
