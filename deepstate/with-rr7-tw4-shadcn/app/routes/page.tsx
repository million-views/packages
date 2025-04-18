import { Link } from "react-router";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart2,
  FileBarChart,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Welcome to the App</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This is a demo of the Navigator component with React Router v7. Click on
        the navigation items to see how it works.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <LayoutDashboard className="h-5 w-5 text-primary mb-1" />
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              View your dashboard with key metrics and insights.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/dashboard">
                View Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <BarChart2 className="h-5 w-5 text-primary mb-1" />
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Explore detailed analytics and performance data.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/dashboard/analytics">
                View Analytics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <Users className="h-5 w-5 text-primary mb-1" />
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage users, roles, and permissions.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/users">
                Manage Users
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <FileBarChart className="h-5 w-5 text-primary mb-1" />
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and view detailed reports.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/dashboard/reports">
                View Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <Settings className="h-5 w-5 text-primary mb-1" />
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure application settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/settings">
                Manage Settings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
