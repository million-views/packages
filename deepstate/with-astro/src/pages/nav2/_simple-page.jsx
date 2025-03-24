import { Card, CardContent, CardHeader, CardTitle } from "./_components";

export default function SimplePage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Simple HTML Page</h1>
      <p className="text-lg text-base-content/70 mb-6">
        This is a simple page with no internal views or navigation. Notice how
        the second navigation row is still present but empty to maintain
        consistent layout.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Content Example</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a simple content example for a basic HTML page.</p>
          <p className="mt-4">
            Notice that there's no layout shift when navigating between this
            page and the Dashboard SPA, because the navigation structure
            maintains consistent height.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
