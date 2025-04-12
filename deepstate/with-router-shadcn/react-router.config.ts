import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // see https://glama.ai/blog/2025-02-07-react-router-without-server-bundles
  serverBuildFile: '[name].js',
  serverModuleFormat: 'esm',
} satisfies Config;
