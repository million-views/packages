import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Filter, Search } from "lucide-react";

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      lastActive: "2 minutes ago",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Editor",
      status: "Active",
      lastActive: "1 hour ago",
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert.j@example.com",
      role: "Viewer",
      status: "Inactive",
      lastActive: "3 days ago",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@example.com",
      role: "Editor",
      status: "Active",
      lastActive: "5 hours ago",
    },
    {
      id: 5,
      name: "Michael Wilson",
      email: "michael.w@example.com",
      role: "Viewer",
      status: "Active",
      lastActive: "1 day ago",
    },
    {
      id: 6,
      name: "Sarah Brown",
      email: "sarah.b@example.com",
      role: "Admin",
      status: "Active",
      lastActive: "Just now",
    },
    {
      id: 7,
      name: "David Miller",
      email: "david.m@example.com",
      role: "Viewer",
      status: "Pending",
      lastActive: "Never",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search users..." className="pl-8" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>Add User</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "Admin"
                      ? "secondary"
                      : user.role === "Editor"
                      ? "default"
                      : "outline"}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "Active"
                      ? "default"
                      : user.status === "Inactive"
                      ? "destructive"
                      : "outline"}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.lastActive}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">7</span> of{" "}
          <span className="font-medium">7</span> users
        </div>

        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
