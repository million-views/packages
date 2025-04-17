import { reify } from "@m5nv/deepstate/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const store = reify(
  { count: 1, double: (state) => state.count * 2 },
).attach({
  increment: (state) => {
    state.count++;
  }
});

export default function Counter() {
  const counter = store.state;
  const actions = store.actions;
  const { $count, $double } = counter;

  return (
    <Card className="@container grid place-items-center bg-muted gap-y-4 w-full max-w-xs mx-auto my-8 p-6">

    <CardHeader className="p-0 w-full">
      <h1 className="text-xl font-semibold md:text-2xl text-center">
        Count: {$count}
      </h1>
      <h1 className="text-xl font-semibold md:text-2xl text-center">
        Double: {$double}
      </h1>
    </CardHeader>

    <CardContent className="@container p-0 w-full grid grid-cols-1">
      <Button
        className="w-[60cqw] mx-auto @sm:min-w-0 py-2 px-4 rounded transition duration-200"
        onClick={() => (actions.increment())}
      >
        Increment
      </Button>

    </CardContent>

    </Card>
  );
}