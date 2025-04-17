"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function DashboardAnalyticsPage() {

  return (
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
  );
}