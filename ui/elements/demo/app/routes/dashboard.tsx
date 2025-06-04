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
  const [compactView, setCompactView] = useState(false);

  // Container-aware dashboard actions
  const dashboardActions: Action[] = [
    {
      id: "compact",
      label: compactView ? "Expanded View" : "Compact View",
      icon: compactView ? "📊" : "📋",
    },
    { id: "refresh", label: "Refresh", icon: "🔄" },
    { id: "export", label: "Export", icon: "📤" },
    { id: "filter", label: "Filter", icon: "🔍" },
    { id: "new", label: "New Report", icon: "➕" },
  ];

  // Enhanced tabs with better mobile support
  const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈", badge: 2 },
    { id: "reports", label: "Reports", icon: "📋" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  // Enhanced metrics with container-aware display
  const metrics = [
    {
      title: "Total Revenue",
      value: "$124,563",
      change: "+12.5%",
      trend: "up" as const,
      icon: "💰",
      priority: "high" as const,
    },
    {
      title: "Active Users",
      value: "8,456",
      change: "+5.2%",
      trend: "up" as const,
      icon: "👥",
      priority: "high" as const,
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "-0.8%",
      trend: "down" as const,
      icon: "📊",
      priority: "medium" as const,
    },
    {
      title: "Avg. Order Value",
      value: "$89.50",
      change: "+2.1%",
      trend: "up" as const,
      icon: "🛒",
      priority: "medium" as const,
    },
    {
      title: "Page Views",
      value: "45,123",
      change: "+8.3%",
      trend: "up" as const,
      icon: "👀",
      priority: "low" as const,
    },
    {
      title: "Bounce Rate",
      value: "42.1%",
      change: "-3.2%",
      trend: "up" as const,
      icon: "📉",
      priority: "low" as const,
    },
  ];

  // Sample data with more realistic content
  const generateSampleData = () => {
    const statuses = ["Active", "Pending", "Completed", "Failed"];
    const names = [
      "John Doe",
      "Jane Smith",
      "Bob Johnson",
      "Alice Brown",
      "Charlie Wilson",
      "Diana Ross",
      "Frank Miller",
      "Grace Lee",
      "Henry Ford",
      "Ivy Chen",
    ];
    const departments = [
      "Engineering",
      "Marketing",
      "Sales",
      "Support",
      "HR",
      "Finance",
      "Operations",
    ];
    const companies = [
      "TechCorp",
      "DataSoft",
      "CloudBase",
      "AI Solutions",
      "WebFlow",
    ];

    return Array.from({ length: 75 }, (_, i) => ({
      id: i + 1,
      name: names[i % names.length],
      department: departments[i % departments.length],
      company: companies[i % companies.length],
      status: statuses[i % statuses.length],
      revenue: Math.floor(Math.random() * 10000) + 1000,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        .toLocaleDateString(),
      email: `${names[i % names.length].toLowerCase().replace(" ", ".")}@${
        companies[i % companies.length].toLowerCase()
      }.com`,
    }));
  };

  const [tableData] = useState(generateSampleData());

  // FIXED: Enhanced table columns that work with container-aware card layout
  const tableColumns: TableColumn[] = [
    { key: "id", label: "ID", sortable: true, width: "60px", align: "center" },
    { key: "name", label: "Name", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "company", label: "Company", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span className={`status-badge status-badge--${value.toLowerCase()}`}>
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
    { key: "email", label: "Email", sortable: false },
    { key: "date", label: "Date", sortable: true },
  ];

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: "/" },
    { id: "dashboard", label: "Dashboard" },
  ];

  const periodOptions: SelectOption[] = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" },
  ];

  const paginatedData = tableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleActionClick = (action: Action) => {
    if (action.id === "compact") {
      setCompactView(!compactView);
    }
    console.log("Dashboard action:", action.id);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    console.log("Sort:", key, direction);
    // Implement actual sorting logic here
  };

  const handleRowClick = (row: any) => {
    console.log("Row clicked:", row);
  };

  const renderOverview = () => (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--mv-space-md)",
          marginBottom: "var(--mv-space-lg)",
        }}
      >
        <h3 style={{ margin: 0 }}>Recent Activity</h3>
        <span className="text-small text-muted">
          Showing {paginatedData.length} of {tableData.length} entries
        </span>
      </div>

      {/* FIXED: Container-aware table with proper data attributes */}
      <Table
        columns={tableColumns}
        data={paginatedData}
        sortable={true}
        selectable={true}
        onSort={handleSort}
        onRowClick={handleRowClick}
        responsive={true}
      />

      {/* FIXED: Container-aware pagination */}
      <Pagination
        totalItems={tableData.length}
        itemsPerPage={pageSize}
        currentPage={currentPage}
        showPageInfo={true}
        showPageSizeSelector={true}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        responsive={true}
      />
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <div className="text-center" style={{ padding: "var(--mv-space-2xl)" }}>
        <div style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}>
          📈
        </div>
        <h3>Analytics Dashboard</h3>
        <p className="text-muted">
          Advanced analytics with container-aware responsive behavior. Charts
          and metrics automatically adapt to available space.
        </p>
      </div>

      {/* Demo container query behavior */}
      <Card variant="elevated" padding="lg" responsive={true}>
        <div className="grid grid--two-col">
          <div>
            <h4>Container Query Demo</h4>
            <p className="text-muted">
              These components automatically adapt based on the available
              container width, not the viewport size.
            </p>
          </div>
          <div>
            <ActionBar
              actions={[
                { id: "test1", label: "Action 1", icon: "🔧" },
                { id: "test2", label: "Action 2", icon: "📊" },
                { id: "test3", label: "Action 3", icon: "⚙️" },
              ]}
              responsive={true}
              onActionClick={handleActionClick}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div>
      <div className="text-center" style={{ padding: "var(--mv-space-2xl)" }}>
        <div style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}>
          📋
        </div>
        <h3>Reports Dashboard</h3>
        <p className="text-muted">
          Generate and manage reports with container-aware layouts. Report
          components adapt intelligently to their context.
        </p>
      </div>

      {/* Multiple container examples */}
      <div className="grid grid--auto-fit">
        <Card variant="outlined" padding="lg" responsive={true}>
          <h4>Main Report Area</h4>
          <p className="text-muted">
            This area has more space, so components show full details.
          </p>
          <ActionBar
            actions={dashboardActions.slice(0, 4)}
            onActionClick={handleActionClick}
            responsive={true}
          />
        </Card>

        <Card variant="outlined" padding="md" responsive={true}>
          <h4>Sidebar Reports</h4>
          <p className="text-muted">
            Narrow sidebar - components adapt by hiding labels and descriptions.
          </p>
          <ActionBar
            actions={dashboardActions.slice(0, 3)}
            onActionClick={handleActionClick}
            responsive={true}
          />
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="text-center" style={{ padding: "var(--mv-space-2xl)" }}>
        <div style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}>
          👥
        </div>
        <h3>User Management</h3>
        <p className="text-muted">
          User administration with responsive table layouts. The table adapts
          from full columns to card layout based on container width.
        </p>
      </div>

      <Card variant="outlined" padding="lg" responsive={true}>
        <Table
          columns={tableColumns.slice(0, 5)} // Show fewer columns for demo
          data={paginatedData.slice(0, 5)}
          sortable={true}
          selectable={true}
          responsive={true}
        />
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div>
      <div className="text-center" style={{ padding: "var(--mv-space-2xl)" }}>
        <div style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}>
          ⚙️
        </div>
        <h3>Settings Dashboard</h3>
        <p className="text-muted">
          Configuration options with responsive form layouts. Settings panels
          adapt to their container dimensions.
        </p>
      </div>

      <div className="grid grid--auto-fit">
        {Array.from(
          { length: 6 },
          (_, i) => (
            <Card key={i} variant="outlined" padding="md" responsive={true}>
              <h4>Setting Group {i + 1}</h4>
              <p className="text-muted">
                Container-aware setting panel that adapts to available space.
              </p>
            </Card>
          ),
        )}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs items={breadcrumbs} responsive={true} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--mv-space-md)",
          marginBottom: "var(--mv-space-xl)",
        }}
      >
        <h1 className="page-title">Enhanced Dashboard</h1>
        <div
          style={{
            display: "flex",
            gap: "var(--mv-space-md)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onSelect={(value) => setSelectedPeriod(value)}
            size="sm"
            responsive={true}
          />
          <ActionBar
            actions={dashboardActions}
            onActionClick={handleActionClick}
            variant="compact"
            responsive={true}
          />
        </div>
      </div>

      {/* Container-aware metrics grid */}
      <div
        className={`grid ${
          compactView ? "grid--auto-fit" : "grid--three-col"
        } margin-bottom-xl`}
      >
        {metrics
          .filter((metric) => !compactView || metric.priority === "high")
          .map((metric, index) => (
            <Card key={index} variant="elevated" padding="lg" responsive={true}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--mv-space-sm)",
                      marginBottom: "var(--mv-space-sm)",
                    }}
                  >
                    <span style={{ fontSize: "var(--mv-font-size-lg)" }}>
                      {metric.icon}
                    </span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "var(--mv-font-size-sm)",
                        color: "var(--mv-color-text-secondary)",
                        fontWeight: "var(--mv-font-weight-medium)",
                      }}
                    >
                      {metric.title}
                    </h3>
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "var(--mv-color-text-primary)",
                    }}
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
                  <span
                    style={{
                      fontSize: "var(--mv-font-size-sm)",
                      fontWeight: "500",
                    }}
                  >
                    {metric.change}
                  </span>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Enhanced dashboard with container queries */}
      <Card variant="outlined" padding="none" responsive={true}>
        <div style={{ padding: "var(--mv-space-lg) var(--mv-space-lg) 0" }}>
          <TabGroup
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
            responsive={true}
          />
        </div>

        <div style={{ padding: "var(--mv-space-xl)" }}>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "settings" && renderSettings()}
        </div>
      </Card>
    </div>
  );
}
