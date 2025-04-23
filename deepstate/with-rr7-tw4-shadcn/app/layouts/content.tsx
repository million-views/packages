import { Outlet, type UIMatch, useMatches } from "react-router";
import { Icon } from "@/components/icon-mapper";
import { type NavMeta } from "@m5nv/rr-builder";
// import { useHydratedMatches } from "~/hooks/use-hydrated-matches";
import { useHydratedMatches } from "~/lib/nav5";
// Credit:
// [How to pass props to Layout component...?](https://stackoverflow.com/a/79537911/20360913)

/// Define what a match with NavMeta in the handle looks like
interface RouteMatch extends UIMatch {
  handle: NavMeta;
}

/// A simple layout for content
export default function ContentLayout() {
  const matches = useHydratedMatches();
  console.log(matches);
  const match = matches.at(-1) as RouteMatch;
  console.log("Content.Layout", match);
  const handle = match.handle;
  let { label, iconName } = handle ??
    { label: "Who are we?", iconName: "ShieldQuestion" };
  return (
    <article className="flex flex-col">
      <h2 className="flex flex-row gap-1 p-2">
        <Icon name={iconName as string} />
        {label}
      </h2>
      <section className="flex-1">
        <Outlet />
      </section>
    </article>
  );
}
