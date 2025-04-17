import { reify } from "@m5nv/deepstate/react";
import { createContext, useContext } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Store = createContext();

function Value({ counter }) {
  const {$count} = counter;
  return (
    // <h1 className="text-xl font-semibold md:text-2xl text-center"></h1>
    <h2 className="text-xl font-semibold text-center text-[clamp(1.875rem,4cqi,3rem)]">Count: {$count}</h2>
  );
}

function CtxCounter () {
  const { state: counter, actions } = useContext(Store);


  return (
    <Card className="@container grid place-items-center bg-muted gap-y-4 w-full max-w-xs mx-auto my-8 p-6">

    <CardHeader className="p-0 w-full">
      <Value counter={counter} />
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

export default function ContextCounter() {
  const store = reify(
    { count: 1, double: (state) => state.count * 2 },
  ).attach({
    increment: (state) => {
      state.count++;
    }
  });

  return (
    <Store.Provider value={store}>
      <CtxCounter />
    </Store.Provider>
  );
}