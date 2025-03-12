import { useState } from "preact/hooks";
import { Navbar } from "./Navbar";

export function AppLayout({
  children,
  logo,
  navigation = [],
  pageTitle = "Dashboard",
  onNavigationClick,
}) {
  return (
    <div className="min-h-full">
      <Navbar
        logo={logo}
        navigation={navigation}
        onNavigationClick={onNavigationClick}
      />

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {pageTitle}
            </h1>
          </div>
        </header>

        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
import icon from "@assets/icon.svg"; // Adjust path as needed

// Page content components
const DashboardContent = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Welcome to the Dashboard</h2>
    <p>This is your main dashboard content area.</p>
  </div>
);

const TeamContent = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Team Members</h2>
    <p>View and manage your team members here.</p>
  </div>
);

const ProjectsContent = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Projects Overview</h2>
    <p>Track the status of all your ongoing projects.</p>
  </div>
);

const CalendarContent = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Calendar</h2>
    <p>View your upcoming meetings and deadlines.</p>
  </div>
);

export function App() {
  // State to track the current active page
  const [activePage, setActivePage] = useState("Dashboard");

  // Navigation items with dynamic current state
  const navigation = [
    { name: "Dashboard", href: "#", current: activePage === "Dashboard" },
    { name: "Team", href: "#", current: activePage === "Team" },
    { name: "Projects", href: "#", current: activePage === "Projects" },
    { name: "Calendar", href: "#", current: activePage === "Calendar" },
  ];

  // Handle navigation item click
  const handleNavigationClick = (pageName) => {
    setActivePage(pageName);
  };

  // Render the appropriate content based on active page
  const renderContent = () => {
    switch (activePage) {
      case "Team":
        return <TeamContent />;
      case "Projects":
        return <ProjectsContent />;
      case "Calendar":
        return <CalendarContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <AppLayout
      logo={icon.src}
      navigation={navigation}
      pageTitle={activePage}
      onNavigationClick={handleNavigationClick}
    >
      {renderContent()}
    </AppLayout>
  );
}
