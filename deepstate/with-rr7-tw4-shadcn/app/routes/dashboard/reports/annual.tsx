import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardReports() {
  const reports = [
    {
      id: 1,
      name: "Monthly Performance Report",
      date: "2023-04-01",
      status: "Completed",
    },
    {
      id: 2,
      name: "Quarterly Financial Summary",
      date: "2023-04-15",
      status: "Pending",
    },
    {
      id: 3,
      name: "User Engagement Analysis",
      date: "2023-03-28",
      status: "Completed",
    },
    {
      id: 4,
      name: "Marketing Campaign Results",
      date: "2023-04-10",
      status: "In Progress",
    },
    {
      id: 5,
      name: "Product Usage Statistics",
      date: "2023-03-15",
      status: "Completed",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Reports</h2>
          <p className="text-muted-foreground">View and generate reports</p>
        </div>
        <Button>Generate New Report</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={report.status === "Completed"
                      ? "default"
                      : report.status === "In Progress"
                      ? "secondary"
                      : "outline"}
                  >
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" className="mr-2">
                    View
                  </Button>
                  <Button variant="link" className="mr-2">
                    Download
                  </Button>
                  <Button variant="link" className="text-destructive">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Scheduled Reports</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Weekly Performance Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    Sent every Monday at 9:00 AM
                  </p>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" className="mr-2">
                    Edit
                  </Button>
                  <Button variant="ghost" className="text-destructive">
                    Disable
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Monthly Financial Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Sent on the 1st of every month
                  </p>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" className="mr-2">
                    Edit
                  </Button>
                  <Button variant="ghost" className="text-destructive">
                    Disable
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Quarterly Business Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Sent on the last day of each quarter
                  </p>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" className="mr-2">
                    Edit
                  </Button>
                  <Button variant="ghost" className="text-destructive">
                    Disable
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
