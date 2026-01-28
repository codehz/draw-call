import { fileURLToPath, type BunPlugin } from "bun";

export default {
  name: "resolve-compat",
  setup(build) {
    build.onResolve({ filter: /^@\/compat$/ }, () => ({
      path: fileURLToPath(new URL("./src/compat/browser.ts", import.meta.url)),
    }));
  },
} satisfies BunPlugin;
