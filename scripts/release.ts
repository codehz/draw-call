import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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
  external: ["@napi-rs/canvas"],
  outDir: "dist/node",
});

console.log(`Generated ${nodeBundles.length} Node.js/Bun bundle(s)`);
console.log("\nBuild completed!");

// 步骤 2: 复制 package.json、README.md、LICENSE 到 dist/
console.log("\nCopying metadata files...");
const filesToCopy = ["package.json", "README.md", "LICENSE"];
for (const file of filesToCopy) {
  const content = readFileSync(file, "utf-8");
  writeFileSync(join("dist", file), content);
  console.log(`Copied: ${file}`);
}

// 步骤 3: 改写 dist/package.json
console.log("\nRewriting dist/package.json...");
const pkg = JSON.parse(readFileSync("dist/package.json", "utf-8"));

// 删除开发相关的字段
delete pkg.scripts;
delete pkg["lint-staged"];

// 添加发布相关的字段
pkg.main = "./node/index.cjs";
pkg.module = "./node/index.mjs";
pkg.types = "./node/index.d.cts";
pkg.exports = {
  ".": {
    types: {
      import: "./node/index.d.mts",
      require: "./node/index.d.cts",
    },
    browser: {
      types: {
        import: "./browser/index.d.mts",
        require: "./browser/index.d.cts",
      },
      import: "./browser/index.mjs",
      require: "./browser/index.cjs",
    },
    bun: {
      import: "./node/index.mjs",
    },
    import: "./node/index.mjs",
    require: "./node/index.cjs",
  },
};

writeFileSync("dist/package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("Rewritten dist/package.json");

// 步骤 4: 复制并改写 examples
function copyAndRewriteExamples() {
  const examplesDir = "examples";
  const distExamplesDir = "dist/examples";

  console.log("\nCopying and rewriting examples...");

  // 创建 dist/examples 目录
  if (!existsSync(distExamplesDir)) {
    mkdirSync(distExamplesDir, { recursive: true });
  }

  // 读取 examples 目录
  const files = readdirSync(examplesDir);

  for (const file of files) {
    // 只处理 TypeScript 文件
    if (!file.endsWith(".ts")) continue;

    const srcPath = join(examplesDir, file);
    const destPath = join(distExamplesDir, file);

    // 读取文件内容
    let content = readFileSync(srcPath, "utf-8");

    // 改写导入语句
    content = content
      // 替换 @/index 为 @codehz/draw-call
      .replace(/from "@\/index"/g, 'from "@codehz/draw-call"')
      // 替换 @/node 为 @codehz/draw-call（现在已合并）
      .replace(/from "@\/node"/g, 'from "@codehz/draw-call"');

    // 写入文件
    writeFileSync(destPath, content);
    console.log(`  - ${file}`);
  }
}

copyAndRewriteExamples();

console.log("\n✓ Release build completed successfully!");
console.log("Ready to publish from dist/ directory");
console.log("\nBuild outputs:");
console.log("  - dist/browser/ (for browser environments)");
console.log("  - dist/node/ (for Node.js/Bun environments)");
