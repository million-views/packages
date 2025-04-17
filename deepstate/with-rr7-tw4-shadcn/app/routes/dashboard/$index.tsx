import type { Route } from "./+types/$index";
import DashboardPage from "~/routes/dashboard/view";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Fancy Dashboard" },
    { name: "description", content: "Welcome to my Dashboard!" },
  ];
}

export default function () {
  return <DashboardPage />;
}
