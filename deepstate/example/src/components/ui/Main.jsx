import icon from "@assets/icon.svg";
import { NavigationProvider } from "././providers/navigation";
import { Navbar } from "./Navbar";
import { ActivatedContent } from "./ActivatedContent";
import { TodoList } from "@components/TodoList.jsx";
import { ExampleComponent as CodeBlockContent } from "./example-component.jsx";
import { DatePresets } from "./code-block2.jsx";

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
//   <div className="bg-white shadow rounded-lg p-6">
//     <h2 className="text-xl font-semibold mb-4">Calendar</h2>
//     <p>View your upcoming meetings and deadlines.</p>
//   </div>
// );

// const CodeBlockContent = () => <TodoList initial={initial} />;
//   <div className="bg-white shadow rounded-lg p-6">
//     <h2 className="text-xl font-semibold mb-4">Calendar</h2>
//     <p>View your upcoming meetings and deadlines.</p>
//   </div>
// );

const navigationItems = [
  { name: "Dashboard", href: "#", component: DashboardContent },
  { name: "Team", href: "#", component: TeamContent },
  { name: "Projects", href: "#", component: ProjectsContent },
  { name: "Calendar", href: "#", component: CalendarContent },
  { name: "Todos", href: "#", component: TodoAppContent },
  { name: "CodeBlock", href: "#", component: () => <CodeBlockContent /> },
  { name: "DatePresets", href: "#", component: () => <DatePresets /> },
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
