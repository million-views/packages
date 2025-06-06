// ===========================================
// MIGRATED SHOWCASE.TSX - UPDATED FOR V2.0
// ===========================================

import React, { useState } from "react";
import {
  ActionBar,
  Card,
  CollapsibleSection,
  List,
  Navigation,
  Pagination,
  TabGroup,
  Table,
} from "@m5nv/ui-elements";
import type {
  Action,
  MenuItem,
  NavigationItem,
  Tab,
  TableColumn,
} from "@m5nv/ui-elements";

export default function ContainerQueryShowcase() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const sampleData = [
    {
      id: 1,
      name: "Alice Johnson",
      role: "Designer",
      status: "Active",
      email: "alice@company.com",
      department: "Creative",
      salary: "$65,000",
      startDate: "2023-01-15",
    },
    {
      id: 2,
      name: "Bob Smith",
      role: "Developer",
      status: "Active",
      email: "bob@company.com",
      department: "Engineering",
      salary: "$85,000",
      startDate: "2022-08-10",
    },
    {
      id: 3,
      name: "Carol Davis",
      role: "Manager",
      status: "Pending",
      email: "carol@company.com",
      department: "Operations",
      salary: "$95,000",
      startDate: "2023-03-22",
    },
    {
      id: 4,
      name: "David Wilson",
      role: "Analyst",
      status: "Active",
      email: "david@company.com",
      department: "Finance",
      salary: "$70,000",
      startDate: "2023-05-01",
    },
    {
      id: 5,
      name: "Emma Brown",
      role: "Designer",
      status: "Active",
      email: "emma@company.com",
      department: "Creative",
      salary: "$68,000",
      startDate: "2023-07-12",
    },
    {
      id: 6,
      name: "Frank Miller",
      role: "Developer",
      status: "Pending",
      email: "frank@company.com",
      department: "Engineering",
      salary: "$88,000",
      startDate: "2023-09-05",
    },
  ];

  const tableColumns: TableColumn[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "email", label: "Email", sortable: false },
    { key: "salary", label: "Salary", sortable: true, align: "right" },
    { key: "startDate", label: "Start Date", sortable: true },
  ];

  // FIXED: Proper NavigationItem structure
  const navigationItems: NavigationItem[] = [
    {
      id: "products",
      label: "Products",
      icon: "📦",
      dropdown: {
        groups: [
          {
            id: "products",
            title: "Products",
            items: [
              {
                id: "analytics",
                label: "Analytics Suite",
                description: "Advanced data visualization and reporting tools",
                icon: "📊",
              },
              {
                id: "dashboard",
                label: "Dashboard Pro",
                description: "Real-time monitoring and alerts",
                icon: "📈",
              },
              {
                id: "crm",
                label: "CRM Platform",
                description: "Customer relationship management",
                icon: "👥",
              },
            ],
          },
          {
            id: "tools",
            title: "Developer Tools",
            items: [
              {
                id: "api",
                label: "API Gateway",
                description: "Manage and secure your APIs",
                icon: "🔌",
              },
              {
                id: "monitoring",
                label: "System Monitor",
                description: "Track system performance",
                icon: "📡",
              },
            ],
          },
          {
            id: "resources",
            title: "Resources",
            items: [
              {
                id: "docs",
                label: "Documentation",
                description: "Comprehensive guides and tutorials",
                icon: "📚",
              },
              {
                id: "support",
                label: "Support Center",
                description: "Get help from our team",
                icon: "🎧",
              },
            ],
          },
        ],
        featuredItems: [
          { id: "new", label: "New Release", icon: "✨" },
          { id: "popular", label: "Most Popular", icon: "🔥" },
          { id: "trial", label: "Free Trial", icon: "🎁" },
        ],
        columns: 3,
      },
    },
    {
      id: "solutions",
      label: "Solutions",
      icon: "🛠️",
      dropdown: {
        groups: [
          {
            id: "enterprise",
            title: "Enterprise",
            items: [
              {
                id: "security",
                label: "Security Suite",
                description: "Enterprise-grade security",
                icon: "🔒",
              },
              {
                id: "compliance",
                label: "Compliance Tools",
                description: "Meet regulatory requirements",
                icon: "✅",
              },
            ],
          },
        ],
        columns: 1,
      },
    },
    {
      id: "pricing",
      label: "Pricing",
      icon: "💰",
      href: "/pricing",
    },
    {
      id: "resources",
      label: "Resources",
      icon: "📚",
      href: "/resources",
    },
  ];

  const actionBarActions: Action[] = [
    { id: "create", label: "Create New", icon: "➕" },
    { id: "search", label: "Search", icon: "🔍" },
    { id: "filter", label: "Filter", icon: "⚙️" },
    { id: "export", label: "Export Data", icon: "📤", badge: 3 },
    { id: "settings", label: "Settings", icon: "🛠️" },
    { id: "help", label: "Help", icon: "❓" },
  ];

  const listItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard Overview",
      icon: "📊",
      description: "View key metrics and performance indicators",
      badge: 5,
    },
    {
      id: "analytics",
      label: "Advanced Analytics",
      icon: "📈",
      description: "Deep dive into your data with powerful tools",
    },
    {
      id: "reports",
      label: "Custom Reports",
      icon: "📋",
      description: "Generate detailed reports for stakeholders",
      badge: 12,
    },
    {
      id: "integrations",
      label: "System Integrations",
      icon: "🔌",
      description: "Connect with third-party services and APIs",
    },
    {
      id: "users",
      label: "User Management",
      icon: "👥",
      description: "Manage team members and permissions",
      badge: 3,
    },
  ];

  const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "details", label: "Details", icon: "📋", badge: 2 },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "history", label: "History", icon: "📜" },
    {
      id: "external",
      label: "External Link",
      icon: "🔗",
      external: true,
      href: "https://example.com",
    },
  ];

  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState(true);

  const handleNavItemClick = (item: NavigationItem) => {
    console.log("Nav item clicked:", item);
  };

  const handleActionClick = (action: Action) => {
    console.log("Action clicked:", action);
  };

  const handleListItemClick = (item: MenuItem) => {
    console.log("List item clicked:", item);
  };

  const paginatedData = sampleData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">🚀 Container Query Showcase</h1>
          <p className="page-description">
            This page demonstrates how components intelligently adapt to their
            container width, not viewport width. Resize your browser window and
            watch components adapt to available space.
          </p>
        </div>
      </header>

      {/* FIXED: Navigation with proper design props */}
      <Card design={{ elevation: "floating", padding: "lg" }} responsive={true}>
        <h2>Navigation with Smart MegaDropdown</h2>
        <p className="text-secondary section-spacing">
          The dropdown adapts its columns and positioning based on available
          space. Hover over "Products" or "Solutions" to see the mega dropdown
          in action.
        </p>
        <Navigation
          brand={{ label: "Container Demo", icon: "🚀" }}
          items={navigationItems}
          onItemClick={handleNavItemClick}
          responsive={true}
          design={{ variant: "default", size: "md" }}
        />
      </Card>

      {/* FIXED: Table Component with proper design props */}
      <Card design={{ variant: "outlined", padding: "lg" }} responsive={true}>
        <h3>Responsive Table - Card Layout on Narrow Screens</h3>
        <p className="text-secondary section-spacing">
          This table switches to card layout when the container is narrow. Each
          card shows "Label: Value" format instead of table columns. Resize the
          window to see it adapt.
        </p>
        <Table
          columns={tableColumns}
          data={paginatedData}
          design={{ variant: "default", density: "comfortable", size: "md" }}
          sortable={true}
          selectable={true}
          responsive={true}
        />

        <Pagination
          totalItems={sampleData.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          design={{
            orientation: "horizontal",
            density: "comfortable",
            size: "md",
          }}
          showPageInfo={true}
          showPageSizeSelector={true}
          onPageChange={setCurrentPage}
          onPageSizeChange={setItemsPerPage}
          responsive={true}
        />
      </Card>

      {/* FIXED: ActionBar Tests with proper design props */}
      <Card design={{ variant: "outlined", padding: "lg" }} responsive={true}>
        <h3>ActionBar Container Query Demonstration</h3>
        <p className="text-secondary section-spacing">
          These ActionBar components are placed in containers of different
          widths to demonstrate container-aware responsive behavior. Notice how
          they adapt independently of the viewport size.
        </p>

        <div className="demo-grid">
          <div className="demo-container demo-container--wide">
            <h4 className="demo-title">Wide Container (600px+)</h4>
            <p className="demo-description">
              Shows icons and labels when there's enough space.
            </p>
            <ActionBar
              actions={actionBarActions}
              onActionClick={handleActionClick}
              design={{
                orientation: "horizontal",
                position: "left",
                density: "comfortable",
                variant: "default",
              }}
              responsive={true}
            />
          </div>

          <div className="demo-container demo-container--medium">
            <h4 className="demo-title">Medium Container (350px)</h4>
            <p className="demo-description">
              Should hide labels, showing only icons when space is limited.
            </p>
            <ActionBar
              actions={actionBarActions.slice(0, 4)}
              onActionClick={handleActionClick}
              design={{
                orientation: "horizontal",
                position: "left",
                density: "comfortable",
                variant: "default",
              }}
              responsive={true}
            />
          </div>

          <div className="demo-container demo-container--narrow">
            <h4 className="demo-title">Narrow Container (250px)</h4>
            <p className="demo-description">
              Compact icons only, smaller padding for tight spaces.
            </p>
            <ActionBar
              actions={actionBarActions.slice(0, 3)}
              onActionClick={handleActionClick}
              design={{
                orientation: "horizontal",
                position: "left",
                density: "compact",
                variant: "default",
              }}
              responsive={true}
            />
          </div>
        </div>
      </Card>

      {/* FIXED: List Component Tests with proper design props */}
      <Card design={{ variant: "outlined", padding: "lg" }} responsive={true}>
        <h3>List Component Container Adaptation</h3>
        <p className="text-secondary section-spacing">
          These List components demonstrate how descriptions and icons hide when
          containers become narrow, creating more usable interfaces.
        </p>

        <div className="grid grid--two-col">
          <div>
            <h4>Full Width List</h4>
            <p className="text-small text-secondary">
              Shows icons, labels, and descriptions with full spacing.
            </p>
            <List
              items={listItems.slice(0, 3)}
              design={{
                variant: "detailed",
                orientation: "vertical",
                density: "comfortable",
              }}
              onItemClick={handleListItemClick}
              responsive={true}
            />
          </div>

          <div className="demo-container demo-container--narrow">
            <h4 className="demo-title">Narrow Container List</h4>
            <p className="demo-description">
              Automatically hides descriptions and icons when space is limited.
            </p>
            <List
              items={listItems.slice(0, 3)}
              design={{
                variant: "detailed",
                orientation: "vertical",
                density: "comfortable",
              }}
              onItemClick={handleListItemClick}
              responsive={true}
            />
          </div>
        </div>
      </Card>

      {/* FIXED: Tab Component with proper design props */}
      <Card design={{ variant: "outlined", padding: "lg" }} responsive={true}>
        <h3>TabGroup - Container Aware</h3>
        <p className="text-secondary section-spacing">
          Tabs adapt their size and hide icons/external indicators on narrow
          containers. They also handle overflow with horizontal scrolling.
        </p>
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          design={{ variant: "default", size: "md", orientation: "horizontal" }}
          responsive={true}
        />
        <p className="section-spacing">
          Active tab content: <strong>{activeTab}</strong>
        </p>
      </Card>

      {/* FIXED: CollapsibleSection with proper design props */}
      <Card design={{ variant: "outlined", padding: "lg" }} responsive={true}>
        <h3>CollapsibleSection - Working Toggle</h3>
        <p className="text-secondary section-spacing">
          The toggle functionality works properly and adapts spacing based on
          container width. Click to expand/collapse.
        </p>
        <CollapsibleSection
          title="Expandable Content Section"
          icon="📁"
          badge={3}
          expanded={expandedSection}
          onToggle={setExpandedSection}
          design={{ variant: "default", size: "md" }}
          responsive={true}
        >
          <p className="text-secondary">
            This content can be toggled! The triangle icon properly rotates and
            the section expands/collapses as expected. Container queries also
            adapt the padding and layout based on available space.
          </p>
        </CollapsibleSection>
      </Card>

      {/* Live Container Query Demonstration */}
      <Card design={{ elevation: "flat", padding: "lg" }} responsive={true}>
        <h3>🎯 Live Container Query Demonstration</h3>
        <p className="text-secondary section-spacing">
          These nested containers show how components adapt to their immediate
          container, not the viewport size. Try resizing your browser window.
        </p>

        <div className="container-demo-grid">
          <div className="demo-container demo-container--wide">
            <h4 className="demo-title">Wide Container (2/3 width)</h4>
            <ActionBar
              actions={actionBarActions}
              onActionClick={handleActionClick}
              design={{
                orientation: "horizontal",
                position: "left",
                density: "comfortable",
                variant: "default",
              }}
              responsive={true}
            />
            <p className="text-muted section-spacing">
              → Shows full labels and icons
            </p>
          </div>

          <div className="demo-container demo-container--narrow">
            <h4 className="demo-title">Narrow Container (1/3 width)</h4>
            <ActionBar
              actions={actionBarActions.slice(0, 4)}
              onActionClick={handleActionClick}
              design={{
                orientation: "horizontal",
                position: "left",
                density: "compact",
                variant: "default",
              }}
              responsive={true}
            />
            <p className="text-muted section-spacing">
              → Hides labels, shows only icons
            </p>
          </div>
        </div>

        <div className="container-demo-section">
          {[1, 2, 3].map((i) => (
            <div key={i} className="container-demo-item">
              <h5>Container {i}</h5>
              <ActionBar
                actions={actionBarActions.slice(0, 3)}
                onActionClick={handleActionClick}
                design={{
                  orientation: "horizontal",
                  position: "left",
                  density: "compact",
                  variant: "default",
                }}
                responsive={true}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* FIXED: Pagination Component with proper design props */}
      <Card design={{ variant: "outlined", padding: "lg" }} responsive={true}>
        <h3>Pagination - Container Aware Response</h3>
        <p className="text-secondary section-spacing">
          Pagination adapts to different container widths: full → compact →
          minimal navigation.
        </p>

        <div className="section-spacing">
          <h4>Wide Container (600px+)</h4>
          <div className="demo-container demo-container--wide">
            <Pagination
              totalItems={sampleData.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              design={{
                orientation: "horizontal",
                density: "comfortable",
                size: "md",
              }}
              showPageInfo={true}
              showPageSizeSelector={true}
              onPageChange={setCurrentPage}
              onPageSizeChange={setItemsPerPage}
              responsive={true}
            />
          </div>
        </div>

        <div className="section-spacing">
          <h4>Medium Container (450px)</h4>
          <div className="demo-container demo-container--medium">
            <Pagination
              totalItems={sampleData.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              design={{
                orientation: "horizontal",
                density: "comfortable",
                size: "md",
              }}
              showPageInfo={false}
              showPageSizeSelector={false}
              onPageChange={setCurrentPage}
              onPageSizeChange={setItemsPerPage}
              responsive={true}
            />
          </div>
        </div>

        <div className="section-spacing">
          <h4>Narrow Container (350px)</h4>
          <div className="demo-container demo-container--narrow">
            <Pagination
              totalItems={sampleData.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              design={{
                orientation: "horizontal",
                density: "compact",
                size: "sm",
              }}
              showPageInfo={false}
              showPageSizeSelector={false}
              onPageChange={setCurrentPage}
              onPageSizeChange={setItemsPerPage}
              responsive={true}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
