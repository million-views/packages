import { useState } from "react";
import {
  ActionBar,
  Breadcrumbs,
  Card,
  Pagination,
  Select,
  TabGroup,
  Table,
} from "@m5nv/ui-elements";
import type {
  Action,
  BreadcrumbItem,
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

  return (
    <div style={{ padding: "var(--mv-space-xl)" }}>
      <Breadcrumbs items={breadcrumbs} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "var(--mv-space-lg) 0",
        }}
      >
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <div
          style={{
            display: "flex",
            gap: "var(--mv-space-md)",
            alignItems: "center",
          }}
        >
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--mv-space-lg)",
          marginBottom: "var(--mv-space-xl)",
        }}
      >
        {metrics.map((metric, index) => (
          <Card key={index} variant="elevated" padding="lg">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: "0 0 var(--mv-space-sm) 0",
                    fontSize: "0.875rem",
                    color: "var(--mv-color-text-secondary)",
                    fontWeight: "500",
                  }}
                >
                  {metric.title}
                </h3>
                <div
                  style={{ fontSize: "2rem", fontWeight: "bold", margin: "0" }}
                >
                  {metric.value}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--mv-space-xs)",
                  color: metric.trend === "up"
                    ? "var(--mv-color-success)"
                    : "var(--mv-color-danger)",
                }}
              >
                <span>{metric.trend === "up" ? "↗" : "↘"}</span>
                <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                  {metric.change}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <Card variant="outlined" padding="none">
        <div style={{ padding: "var(--mv-space-lg) var(--mv-space-lg) 0" }}>
          <TabGroup
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="underline"
          />
        </div>

        <div style={{ padding: "var(--mv-space-lg)" }}>
          {activeTab === "overview" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--mv-space-lg)",
                }}
              >
                <h3 style={{ margin: 0 }}>Recent Activity</h3>
                <span
                  style={{
                    color: "var(--mv-color-text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
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
            <div
              style={{ textAlign: "center", padding: "var(--mv-space-2xl)" }}
            >
              <div
                style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}
              >
                📈
              </div>
              <h3>Analytics Dashboard</h3>
              <p style={{ color: "var(--mv-color-text-secondary)" }}>
                Advanced analytics charts and insights would be displayed here.
                This demonstrates tab navigation and content switching.
              </p>
            </div>
          )}

          {activeTab === "reports" && (
            <div
              style={{ textAlign: "center", padding: "var(--mv-space-2xl)" }}
            >
              <div
                style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}
              >
                📋
              </div>
              <h3>Reports</h3>
              <p style={{ color: "var(--mv-color-text-secondary)" }}>
                Generated reports and document management interface. Shows how
                tabs can organize different functional areas.
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div
              style={{ textAlign: "center", padding: "var(--mv-space-2xl)" }}
            >
              <div
                style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}
              >
                ⚙️
              </div>
              <h3>Dashboard Settings</h3>
              <p style={{ color: "var(--mv-color-text-secondary)" }}>
                Configuration options for dashboard customization. Demonstrates
                contextual settings within tab navigation.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
