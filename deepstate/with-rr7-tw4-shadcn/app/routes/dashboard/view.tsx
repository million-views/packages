"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("overview");
  const [activeSubView, setActiveSubView] = useState("summary");

  // Listen for view change events from the Navigator
  useEffect(() => {
    const handleViewChange = (event: CustomEvent) => {
      if (event.detail.pageHref === "/dashboard") {
        setActiveView(event.detail.viewId);
        if (event.detail.subViewId) {
          setActiveSubView(event.detail.subViewId);
        }
      }
    };

    const handleSubViewChange = (event: CustomEvent) => {
      if (
        event.detail.pageHref === "/dashboard" &&
        event.detail.viewId === activeView
      ) {
        setActiveSubView(event.detail.subViewId);
      }
    };

    const handleTaskAction = (event: CustomEvent) => {
      console.log("Task action:", event.detail.taskId);
      // Handle specific task actions here
    };

    window.addEventListener("viewChange", handleViewChange as EventListener);
    window.addEventListener(
      "subViewChange",
      handleSubViewChange as EventListener,
    );
    window.addEventListener("taskAction", handleTaskAction as EventListener);

    return () => {
      window.removeEventListener(
        "viewChange",
        handleViewChange as EventListener,
      );
      window.removeEventListener(
        "subViewChange",
        handleSubViewChange as EventListener,
      );
      window.removeEventListener(
        "taskAction",
        handleTaskAction as EventListener,
      );
    };
  }, [activeView]);

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      {activeView === "overview" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

          {activeSubView === "summary" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                  <CardDescription>
                    Active users in your platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">1,234</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Monthly revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">$12,345</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>Current active projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">42</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSubView === "performance" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Performance Metrics
              </h2>
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Performance metrics content goes here...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSubView === "metrics" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Business Metrics</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                  <CardDescription>Business growth indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Business metrics content goes here...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeView === "analytics" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Page Views</span>
                  <div className="flex items-center">
                    <span className="font-medium">12,543</span>
                    <ArrowRight className="h-4 w-4 ml-2 text-green-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <div className="flex items-center">
                    <span className="font-medium">3.2%</span>
                    <ArrowRight className="h-4 w-4 ml-2 text-green-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bounce Rate</span>
                  <div className="flex items-center">
                    <span className="font-medium">42.1%</span>
                    <ArrowRight className="h-4 w-4 ml-2 text-red-500 transform rotate-45" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === "reports" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Reports</h1>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Report</CardTitle>
                <CardDescription>
                  Performance summary for the current month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the monthly report content.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Report</CardTitle>
                <CardDescription>
                  Performance summary for the current quarter
                </CardDescription>
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
