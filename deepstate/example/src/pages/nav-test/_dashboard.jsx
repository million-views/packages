import {
  NavigatedContent,
  SpaNavigator,
  useNavigation,
} from "./_/navigator/spa.jsx";
import { Places } from "./_/navigator/places.jsx";
import icon from "@assets/icon.svg";

function Home() {
  return <h2>Dashboard Overview</h2>;
}

function Settings() {
  return <h2>Dashboard Settings</h2>;
}

function Profile() {
  return <h2>Dashboard Profile</h2>;
}

const navigationItems = [
  { name: "Dashboard", component: Home },
  { name: "Settings", component: () => <Settings /> },
  { name: "Profile", component: () => <Profile /> },
  { name: "About", href: "/nav-test/about" },
];

function App() {
  // Define navigation items with their corresponding content components

  return (
    <SpaNavigator
      initialPage="Dashboard"
      navigationItems={navigationItems}
    >
      <div className="min-h-full">
        <Places logo={icon.src} useNavigation={useNavigation} />
        <NavigatedContent />
      </div>
    </SpaNavigator>
  );
}

export { App };
