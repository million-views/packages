"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardMetricsPage() {

  return (
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
  );
}