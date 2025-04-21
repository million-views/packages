import { build, index, route } from "@m5nv/rr-builder";
// in development, run `npm link @m5nv/rr-builder` in this folder
// to be able to run using node

export default build([
  route("posts", "routes/posts/index.tsx", { id: "posts-wrapper" })
    .children(
      index("routes/posts/index.tsx", { id: "posts-index" }),
      route(":postId", "routes/posts/index.tsx", { id: "posts-detail" }),
      route(":postId/edit", "routes/posts/index.tsx", { id: "posts-edit" }),
    ),
]);
