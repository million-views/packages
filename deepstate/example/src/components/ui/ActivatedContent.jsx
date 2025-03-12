import { useNavigation } from "./providers/navigation";

export function ActivatedContent() {
  // Access navigation state from context
  const { activePage, getActiveItem } = useNavigation();

  // Get the active component when rendering
  const activeItem = getActiveItem();
  const Content = activeItem.component;

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {activePage.value}
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Content />
        </div>
      </main>
    </div>
  );
}
