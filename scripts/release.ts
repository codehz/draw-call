import { readFileSync } from "node:fs";
import { join } from "node:path";
import { build } from "tsdown";

console.log("Starting build process...");

// 步骤 1: 使用 tsdown 编程 API 完成打包
// 为浏览器环境打包（将 process.versions.node 替换为 undefined，消除 Node.js 代码）
console.log("\n[1/2] Building for browser environment...");
const browserBundles = await build({
  entry: {
    index: "src/index.ts",
  },
  platform: "browser",
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  hash: false,
  shims: false,
  deps: {
    onlyBundle: false,
  },
  plugins: [
    {
      name: "replace-napi-rs-canvas",
      load(id) {
        if (id === join(import.meta.dir, "../src/compat/index.ts")) {
          return readFileSync(join(import.meta.dir, "../src/compat/browser.ts"), "utf-8");
        }
      },
    },
  ],
  outDir: "dist/browser",
});

console.log(`Generated ${browserBundles.length} browser bundle(s)`);

// 为 Node.js/Bun 环境打包（保留 process.versions.node）
console.log("\n[2/2] Building for Node.js/Bun environment...");
const nodeBundles = await build({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: false, // 不清除目录，追加到 dist
  treeshake: true,
  hash: false,
  deps: {
    neverBundle: ["@napi-rs/canvas"],
  },
  outDir: "dist/node",
});

console.log(`Generated ${nodeBundles.length} Node.js/Bun bundle(s)`);
console.log("\nBuild completed!");

console.log("\nBuild outputs:");
console.log("  - dist/browser/ (for browser environments)");
console.log("  - dist/node/ (for Node.js/Bun environments)");
process.exit(0);
