"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPerformancePage() {

  return (
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
  );
}