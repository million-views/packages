import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

export default build([
  route("posts", "routes/posts/index.tsx", { id: "posts-wrapper" })
    .children(
      index("routes/posts/index.tsx", { id: "posts-index" }),
      route(":postId", "routes/posts/index.tsx", { id: "posts-detail" }),
      route(":postId/edit", "routes/posts/index.tsx", { id: "posts-edit" }),
    ),
]);
