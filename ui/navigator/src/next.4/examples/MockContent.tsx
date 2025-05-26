export default function MockContent({ useLocation }) {
  const { pathname: path } = useLocation();

  if (path === "/") {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Welcome to Navigator Demo</h1>
        <p className="mb-4">
          This demo showcases our revised Navigation architecture with:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>AppHeader with logo, title, search, and user actions</li>
          <li>
            NavigationSystem with primary, secondary, tertiary navigation rows
          </li>
          <li>Composite Navigator that combines both components</li>
          <li>Section-based app switching</li>
          <li>Responsive design with mobile adaptations</li>
        </ul>
        <p>
          Try navigating through the different sections and options to see how
          the navigation responds.
        </p>
      </div>
    );
  }

  // Extract the last part of the path for a title
  const pathSegments = path.split("/").filter(Boolean);
  const title = pathSegments.length > 0
    ? pathSegments[pathSegments.length - 1]
    : "Home";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, " ")}
      </h1>
      <p className="mb-4">
        Current path: <code>{path}</code>
      </p>
      <p>
        This is the content area for this route. In a real application, this
        would contain the actual page content.
      </p>
    </div>
  );
}
