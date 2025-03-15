import icon from "@assets/icon.svg";
import { NavigationProvider } from "@components/ui/providers/navigation";
import { Navbar } from "@components/ui/Navbar";
import { ActivatedContent } from "@components/ui/ActivatedContent";
import TodoExampleContent  from "@components/todo-list.jsx";
import BasicExampleContent from "@components/basic-examples.jsx";
import AdvExampleContent from "@components/advanced-examples.jsx";
import UIComponents from "@components/UiComponents.jsx"

// Page content components
const DashboardContent = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Welcome to the Dashboard</h2>
    <p>This is your main dashboard content area.</p>
  </div>
);

const navigationItems = [
  { name: "Dashboard", href: "#", component: DashboardContent },
  { name: "Basic", href: "#", component: () => <BasicExampleContent /> },
  { name: "Advanced", href: "#", component: () => <AdvExampleContent />},
  { name: "Todos", href: "#", component: () => <TodoExampleContent />},
  { name: "UIComponents", href: "#", component: () => <UIComponents />}
];

export function App() {
  // Define navigation items with their corresponding content components

  return (
    <NavigationProvider
      initialPage="Dashboard"
      navigationItems={navigationItems}
    >
      <div className="min-h-full">
        <Navbar logo={icon.src} />
        <ActivatedContent />
      </div>
    </NavigationProvider>
  );
}
