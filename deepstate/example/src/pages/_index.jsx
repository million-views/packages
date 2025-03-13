import icon from "@assets/icon.svg";
import { NavigationProvider } from "@components/ui/providers/navigation";
import { Navbar } from "@components/ui/Navbar";
import { ActivatedContent } from "@components/ui/ActivatedContent";
import { TodoList } from "@components/TodoList.jsx";
import { ExampleComponent as CodeBlockContent } from "@components/ui/example-component.jsx";
import BasicExampleContent from "@components/BasicExamples.jsx";

// Page content components
const DashboardContent = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Welcome to the Dashboard</h2>
    <p>This is your main dashboard content area.</p>
  </div>
);

const AdvancedContent = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Advance Examples</h2>
    <p>Advanced usage examples of DeepState</p>
  </div>
);

const UIComponents = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">UI Components</h2>
    <p>Use of DeepState in UI components</p>
  </div>
);

const initial = {
  title: "Live well and prosper",
  draft: "",
  todos: [
    { id: 1, text: "Weed front garden.", completed: true },
    { id: 2, text: "Chill and smoke some Old Toby.", completed: true },
    { id: 3, text: "Keep ring secret and safe.", completed: false },
    { id: 4, text: "Meet Gandalf at Bree.", completed: false },
    { id: 5, text: "Destroy ring and defeat dark lord.", completed: false },
  ],
};

const TodoAppContent = () => <TodoList initial={initial} />;

const navigationItems = [
  { name: "Dashboard", href: "#", component: DashboardContent },
  { name: "Basic", href: "#", component: () => <BasicExampleContent /> },
  { name: "Advanced", href: "#", component: AdvancedContent },
  { name: "Todos", href: "#", component: TodoAppContent },
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
