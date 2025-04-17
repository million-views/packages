import {
  BarChart,
  Circle,
  Clock,
  Download,
  File,
  FileText,
  Home,
  LayoutDashboard,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

// Define primary tasks that are always available
export const primaryTasks = [
  {
    title: "New",
    id: "new",
    icon: <Plus className="h-4 w-4" />,
    action: () => console.log("New item action"),
  },
  {
    title: "Search",
    id: "search",
    icon: <Search className="h-4 w-4" />,
    action: () => console.log("Search action"),
  },
];

// Define the navigation structure in a single place to ensure consistency
export const navigationItems = [
  {
    title: "Home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    views: [
      {
        title: "Overview",
        id: "overview",
        icon: <BarChart className="h-4 w-4" />,
        subViews: [
          {
            title: "Summary",
            id: "summary",
            icon: <Circle className="h-4 w-4" />,
          },
          {
            title: "Performance",
            id: "performance",
            icon: <TrendingUp className="h-4 w-4" />,
          },
          {
            title: "Metrics",
            id: "metrics",
            icon: <Clock className="h-4 w-4" />,
          },
        ],
        tasks: [
          {
            title: "Export Dashboard",
            id: "export-dashboard",
            icon: <Download className="h-4 w-4" />,
            action: () => console.log("Export dashboard"),
          },
          {
            title: "Share Dashboard",
            id: "share-dashboard",
            icon: <Share className="h-4 w-4" />,
            action: () => console.log("Share dashboard"),
          },
        ],
      },
      {
        title: "Analytics",
        id: "analytics",
        icon: <FileText className="h-4 w-4" />,
        tasks: [
          {
            title: "Filter Data",
            id: "filter-data",
            icon: <Search className="h-4 w-4" />,
            action: () => console.log("Filter analytics data"),
          },
        ],
      },
      {
        title: "Reports",
        id: "reports",
        icon: <FileText className="h-4 w-4" />,
      },
    ],
    tasks: [
      {
        title: "Refresh Data",
        id: "refresh-data",
        icon: <RefreshCw className="h-4 w-4" />,
        action: () => console.log("Refresh dashboard data"),
      },
    ],
  },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="h-4 w-4" />,
    views: [
      {
        title: "All Users",
        id: "all-users",
        icon: <Users className="h-4 w-4" />,
        subViews: [
          {
            title: "Active",
            id: "active",
            icon: <Circle className="h-4 w-4" />,
          },
          {
            title: "Pending",
            id: "pending",
            icon: <Clock className="h-4 w-4" />,
          },
          {
            title: "Admins",
            id: "admins",
            icon: <Users className="h-4 w-4" />,
          },
        ],
      },
      {
        title: "Add User",
        id: "add-user",
        icon: <UserPlus className="h-4 w-4" />,
      },
    ],
    tasks: [
      {
        title: "Add User",
        id: "add-user-task",
        icon: <UserPlus className="h-4 w-4" />,
        action: () => console.log("Add new user"),
      },
    ],
  },
  {
    title: "Simple Page",
    href: "/simple-page",
    icon: <File className="h-4 w-4" />,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: <Mail className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];
