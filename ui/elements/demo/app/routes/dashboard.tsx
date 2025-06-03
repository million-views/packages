import { useState } from "react";
import {
  ActionBar,
  Breadcrumbs,
  Card,
  List,
  Pagination,
  Select,
  TabGroup,
  Table,
} from "@m5nv/ui-elements";
import type {
  Action,
  BreadcrumbItem,
  MenuItem,
  SelectOption,
  Tab,
  TableColumn,
} from "@m5nv/ui-elements";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: "/" },
    { id: "dashboard", label: "Dashboard" },
  ];

  const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈", badge: 2 },
    { id: "reports", label: "Reports", icon: "📋" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const dashboardActions: Action[] = [
    { id: "refresh", label: "Refresh", icon: "🔄" },
    { id: "export", label: "Export", icon: "📤" },
    { id: "filter", label: "Filter", icon: "🔍" },
    { id: "new", label: "New Report", icon: "➕" },
  ];

  const periodOptions: SelectOption[] = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" },
  ];

  // Convert placeholder content to MenuItem format for better semantics
  const analyticsItems: MenuItem[] = [
    {
      id: "user-analytics",
      label: "User Analytics",
      icon: "👥",
      description: "User behavior and engagement metrics",
    },
    {
      id: "conversion-funnel",
      label: "Conversion Funnel",
      icon: "📊",
      description: "Track user journey and conversion points",
    },
    {
      id: "performance-metrics",
      label: "Performance Metrics",
      icon: "⚡",
      description: "Site speed and performance analytics",
    },
  ];

  const reportsItems: MenuItem[] = [
    {
      id: "monthly-report",
      label: "Monthly Report",
      icon: "📅",
      description: "Comprehensive monthly business summary",
    },
    {
      id: "quarterly-review",
      label: "Quarterly Review",
      icon: "📈",
      description: "Quarterly performance analysis",
    },
    {
      id: "custom-reports",
      label: "Custom Reports",
      icon: "🔧",
      description: "Build and customize your own reports",
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      id: "dashboard-config",
      label: "Dashboard Configuration",
      icon: "⚙️",
      description: "Customize dashboard layout and widgets",
    },
    {
      id: "data-sources",
      label: "Data Sources",
      icon: "🔌",
      description: "Manage connected data sources",
    },
    {
      id: "alerts",
      label: "Alerts & Notifications",
      icon: "🔔",
      description: "Configure automated alerts",
    },
  ];

  // Sample data for tables
  const generateSampleData = () => {
    const statuses = ["Active", "Pending", "Completed", "Failed"];
    const names = [
      "John Doe",
      "Jane Smith",
      "Bob Johnson",
      "Alice Brown",
      "Charlie Wilson",
    ];
    const departments = ["Engineering", "Marketing", "Sales", "Support", "HR"];

    return Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      name: names[i % names.length],
      department: departments[i % departments.length],
      status: statuses[i % statuses.length],
      revenue: Math.floor(Math.random() * 10000) + 1000,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toLocaleDateString(),
    }));
  };

  const [tableData] = useState(generateSampleData());

  const tableColumns: TableColumn[] = [
    { key: "id", label: "ID", sortable: true, width: "80px" },
    { key: "name", label: "Name", sortable: true },
    { key: "department", label: "Department", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span
          style={{
            padding: "var(--mv-space-xs) var(--mv-space-sm)",
            borderRadius: "var(--mv-radius-sm)",
            fontSize: "0.875rem",
            fontWeight: "500",
            background: value === "Active"
              ? "var(--mv-color-success)"
              : value === "Pending"
              ? "var(--mv-color-warning)"
              : value === "Completed"
              ? "var(--mv-color-primary)"
              : "var(--mv-color-danger)",
            color: "white",
          }}
        >
          {value}
        </span>
      ),
    },
    {
      key: "revenue",
      label: "Revenue",
      sortable: true,
      align: "right",
      render: (value) => `$${value.toLocaleString()}`,
    },
    { key: "date", label: "Date", sortable: true },
  ];

  const metrics = [
    {
      title: "Total Revenue",
      value: "$124,563",
      change: "+12.5%",
      trend: "up",
    },
    { title: "Active Users", value: "8,456", change: "+5.2%", trend: "up" },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "-0.8%",
      trend: "down",
    },
    {
      title: "Avg. Order Value",
      value: "$89.50",
      change: "+2.1%",
      trend: "up",
    },
  ];

  const paginatedData = tableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleActionClick = (action: Action) => {
    console.log("Dashboard action:", action.id);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleItemClick = (item: MenuItem) => {
    console.log("Item clicked:", item.label);
    // Handle navigation or actions for each item
  };

  return (
    <div className="dashboard-container">
      <Breadcrumbs items={breadcrumbs} />

      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-controls">
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onSelect={(value) => setSelectedPeriod(value)}
            size="sm"
          />
          <ActionBar
            actions={dashboardActions}
            onActionClick={handleActionClick}
            variant="compact"
          />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <Card key={index} variant="elevated" padding="lg">
            <div className="metric-content">
              <div>
                <h3 className="metric-title">
                  {metric.title}
                </h3>
                <div className="metric-value">
                  {metric.value}
                </div>
              </div>
              <div className={`metric-change metric-change--${metric.trend}`}>
                <span>{metric.trend === "up" ? "↗" : "↘"}</span>
                <span className="metric-change-value">
                  {metric.change}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <Card variant="outlined" padding="none">
        <div className="dashboard-tabs">
          <TabGroup
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="underline"
          />
        </div>

        <div className="dashboard-content">
          {activeTab === "overview" && (
            <div>
              <div className="overview-header">
                <h3>Recent Activity</h3>
                <span className="overview-count">
                  Showing {paginatedData.length} of {tableData.length} entries
                </span>
              </div>

              <Table
                columns={tableColumns}
                data={paginatedData}
                sortable={true}
                selectable={true}
                onSort={(key, direction) =>
                  console.log("Sort:", key, direction)}
                onRowClick={(row) => console.log("Row clicked:", row)}
              />

              <div style={{ marginTop: "var(--mv-space-lg)" }}>
                <Pagination
                  totalItems={tableData.length}
                  itemsPerPage={pageSize}
                  currentPage={currentPage}
                  showPageInfo={true}
                  showPageSizeSelector={true}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <div className="tab-placeholder">
                <div className="tab-placeholder-icon">📈</div>
                <h3>Analytics Dashboard</h3>
                <p>Available analytics tools and insights:</p>
              </div>

              <List
                items={analyticsItems}
                variant="detailed"
                onItemClick={handleItemClick}
              />
            </div>
          )}

          {activeTab === "reports" && (
            <div>
              <div className="tab-placeholder">
                <div className="tab-placeholder-icon">📋</div>
                <h3>Reports</h3>
                <p>Generate and manage your business reports:</p>
              </div>

              <List
                items={reportsItems}
                variant="detailed"
                onItemClick={handleItemClick}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <div className="tab-placeholder">
                <div className="tab-placeholder-icon">⚙️</div>
                <h3>Dashboard Settings</h3>
                <p>Configure your dashboard preferences:</p>
              </div>

              <List
                items={settingsItems}
                variant="detailed"
                onItemClick={handleItemClick}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
