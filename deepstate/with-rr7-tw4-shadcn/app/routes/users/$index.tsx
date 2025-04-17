import type { Route } from "./+types/$index";
import UsersPage from "~/routes/users/view";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Fancy User" },
    { name: "description", content: "Welcome to my User!" },
  ];
}

export default function () {
  return <UsersPage />;
}
