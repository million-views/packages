// Example of updating the DashboardExample to use the new composition API

import React from "react";
import {
  Actions,
  Brand,
  Content,
  createIconRenderer,
  Drawer,
  Header,
  Navigator,
} from "../next";
import { Icons } from "../next/icons";

// Create the icon renderer with our icons registry
const renderIcon = createIconRenderer(Icons);

// Direct router implementation
const router = {
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ pathname: "/dashboard" }),
  matchPath: (pattern, pathname) =>
    pathname === pattern || pathname.startsWith(pattern + "/")
      ? { pathname }
      : null,
};

// Create a dashboard logo component
const DashboardLogo = () => (
  <div className="dashboard-logo">
    <span>{renderIcon("Apps", 24)}</span>
    <span>Admin Portal</span>
  </div>
);

// Dashboard theme
const dashboardTheme = {
  colors: {
    primary: "#6366F1", // Indigo
    // ... other theme values
  },
  // ... rest of theme
};

// Navigation data
const navigationData = [
  // Dashboard section
  {
    id: "main",
    label: "Main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
      },
      {
        id: "analytics",
        label: "Analytics",
        path: "/analytics",
        icon: "BarChart",
      },
    ],
  },
  // ... other sections
];

// Actions data
const actionsData = [
  {
    id: "notifications",
    icon: "Bell",
    label: "Notifications",
    type: "icon",
    position: "right",
    onClick: () => console.log("Notifications clicked"),
  },
  // ... other actions
];

// Custom search input component
const SearchInput = ({ placeholder }) => (
  <div className="dashboard-search">
    <input
      type="text"
      placeholder={placeholder}
      className="dashboard-search-input"
    />
  </div>
);

// Dashboard content component
const DashboardContent = () => (
  <>
    <div className="dashboard-card">
      <h1 className="dashboard-card-title">Dashboard Overview</h1>
      <p className="dashboard-card-text">
        Welcome to the admin dashboard. Navigate using the sidebar on the left.
      </p>
    </div>

    <div className="dashboard-grid">
      {["Users", "Orders", "Products", "Revenue"].map((item) => (
        <div key={item} className="dashboard-stat-card">
          <h2 className="dashboard-stat-title">{item}</h2>
          <p className="dashboard-stat-value">
            {Math.floor(Math.random() * 10000)}
          </p>
        </div>
      ))}
    </div>
  </>
);

const DashboardExample = () => {
  return (
    <Navigator
      brand={{ title: "Admin Portal" }}
      navigation={navigationData}
      router={router}
      renderIcon={renderIcon}
      actions={actionsData}
      theme="default"
      themeOverrides={dashboardTheme}
      responsive={{
        mobile: {
          breakpoint: 768,
          primaryNav: "drawer",
          brand: { truncateTitle: true },
        },
      }}
    >
      {/* React 19 style element for styling */}
      <style>
        {`
        .dashboard-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: calc(100vh - 64px);
        }
        .dashboard-content {
          padding: 24px;
          background-color: #F1F5F9;
        }
        .dashboard-search {
          flex: 1;
          max-width: 400px;
          margin: 0 24px;
        }
        .dashboard-search-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #E2E8F0;
          font-size: 14px;
        }
        .dashboard-card {
          background-color: white;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          padding: 24px;
          margin-bottom: 24px;
        }
        .dashboard-card-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .dashboard-card-text {
          color: #64748B;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }
        .dashboard-stat-card {
          background-color: white;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          padding: 24px;
        }
        .dashboard-stat-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .dashboard-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #6366F1;
        }
        .dashboard-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: bold;
          color: #6366F1;
        }
      `}
      </style>

      {/* Header with brand and actions */}
      <Header>
        <Brand logo={<DashboardLogo />} title="Admin Portal" />
        <SearchInput placeholder="Search..." />
        <Actions actions={actionsData} />
      </Header>

      {/* Layout with sidebar and content */}
      <div className="dashboard-layout">
        <Drawer mode="persistent" />
        <Content className="dashboard-content">
          <DashboardContent />
        </Content>
      </div>
    </Navigator>
  );
};

export default DashboardExample;
