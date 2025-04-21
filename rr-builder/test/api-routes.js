import { build, prefix, route } from "@m5nv/rr-builder";
// in development, run `npm link @m5nv/rr-builder` in this folder
// to be able to run using node

export default build([
  ...prefix("api", [
    // GET /api/posts
    route("posts", "routes/api/posts.ts"),

    // GET /api/posts/:postId
    route(":postId", "routes/api/posts/[postId].ts"),

    // GET /api/users
    route("users", "routes/api/users.ts"),
  ]),
]);
