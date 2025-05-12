// ========================================
// Mock Navigation Data
// ========================================

export const navigationTree = {
  "main": [
    {
      "id": "routes/page",
      "path": "/",
      "label": "Home",
      "iconName": "Home",
      "end": true,
    },
    {
      "id": "routes/settings/page",
      "path": "/settings",
      "label": "Settings",
      "iconName": "Settings",
    },
    {
      "id": "routes/dashboard/page",
      "path": "/dashboard",
      "label": "Dashboard",
      "iconName": "LayoutDashboard",
      "end": true,
      "children": [
        {
          "id": "routes/dashboard/overview/summary",
          "path": "/dashboard/overview",
          "label": "Overview",
          "iconName": "CircleDot",
          "end": true,
          "children": [
            {
              "id": "routes/dashboard/overview/performance",
              "path": "/dashboard/overview/performance",
              "label": "Performance",
              "iconName": "TrendingUp",
            },
            {
              "id": "routes/dashboard/overview/metrics",
              "path": "/dashboard/overview/metrics",
              "label": "Metrics",
              "iconName": "Clock",
            },
          ],
        },
        {
          "id": "routes/dashboard/analytics/summary",
          "path": "/dashboard/analytics",
          "label": "Analytics",
          "iconName": "BarChart",
          "end": true,
          "children": [
            {
              "id": "routes/dashboard/analytics/traffic",
              "path": "/dashboard/analytics/traffic",
              "label": "Traffic",
              "iconName": "Activity",
            },
            {
              "id": "routes/dashboard/analytics/conversion",
              "path": "/dashboard/analytics/conversion",
              "label": "Conversion",
              "iconName": "PieChart",
            },
          ],
        },
        {
          "id": "routes/dashboard/reports/summary",
          "path": "/dashboard/reports",
          "label": "Reports",
          "iconName": "FileText",
          "end": true,
          "children": [
            {
              "id": "reports-monthly",
              "path": "/dashboard/reports/monthly",
              "label": "Monthly",
              "iconName": "Calendar",
            },
            {
              "id": "reports-quarterly",
              "path": "/dashboard/reports/quarterly",
              "label": "Quarterly",
              "iconName": "CalendarDays",
            },
            {
              "id": "reports-annual",
              "path": "/dashboard/reports/annual",
              "label": "Annual",
              "iconName": "CalendarRange",
            },
          ],
        },
      ],
    },
    {
      "id": "users-index",
      "path": "/users",
      "label": "All Users",
      "iconName": "Users",
      "end": true,
      "children": [
        {
          "id": "users-active",
          "path": "/users/active",
          "label": "Active Users",
          "iconName": "UserCheck",
        },
        {
          "id": "users-inactive",
          "path": "/users/inactive",
          "label": "Inactive Users",
          "iconName": "UserMinus",
        },
        {
          "id": "users-roles-index",
          "path": "/users/roles",
          "label": "All Roles",
          "iconName": "Shield",
          "end": true,
          "children": [
            {
              "id": "users-roles-admin",
              "path": "/users/roles/admin",
              "label": "Administrators",
              "iconName": "ShieldAlert",
            },
            {
              "id": "users-roles-editor",
              "path": "/users/roles/editor",
              "label": "Editors",
              "iconName": "Edit",
            },
            {
              "id": "users-roles-viewer",
              "path": "/users/roles/viewer",
              "label": "Viewers",
              "iconName": "Eye",
            },
          ],
        },
      ],
    },
  ],
  "admin": [
    {
      "id": "admin/dashboard",
      "path": "/admin",
      "label": "Admin Dashboard",
      "iconName": "LayoutDashboard",
    },
    {
      "id": "admin/users",
      "path": "/admin/users",
      "label": "Manage Users",
      "iconName": "Users",
      "children": [
        {
          "id": "admin/users/create",
          "path": "/admin/users/create",
          "label": "Create User",
          "iconName": "UserPlus",
        },
        {
          "id": "admin/users/permissions",
          "path": "/admin/users/permissions",
          "label": "User Permissions",
          "iconName": "Shield",
        },
      ],
    },
    {
      "id": "admin/settings",
      "path": "/admin/settings",
      "label": "Admin Settings",
      "iconName": "Settings",
    },
  ],
};
