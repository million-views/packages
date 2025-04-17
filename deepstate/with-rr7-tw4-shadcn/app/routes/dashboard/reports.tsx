"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardReportsPage() {

  return (
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
  );
}