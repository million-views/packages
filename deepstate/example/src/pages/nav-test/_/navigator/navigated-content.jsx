// navigated-content.jsx
import { useComputed } from "@preact/signals";
import { useNavigation } from "./navigation-context";

/**
 * Component that renders the active route's component
 * This is used when you want to render components in-page rather than navigating to new pages
 */
export function NavigatedContent({ fallbackComponent = null }) {
  const { getActiveRoute } = useNavigation();

  // Use a computed signal to determine what component to render
  const ComponentToRender = useComputed(() => {
    const activeRoute = getActiveRoute.value;

    // If we have an active route with a component, return it
    if (activeRoute && activeRoute.component) {
      return {
        component: activeRoute.component,
        route: activeRoute,
      };
    }

    // If no active component is found, return the fallback
    if (fallbackComponent) {
      return {
        component: fallbackComponent,
        route: null,
      };
    }

    // No component to render
    return null;
  });

  // Render the computed component
  if (!ComponentToRender.value) {
    return (
      <div className="p-4">
        <p className="text-gray-500">No content to display</p>
      </div>
    );
  }

  const { component: Component, route } = ComponentToRender.value;
  return <Component route={route} />;
}
