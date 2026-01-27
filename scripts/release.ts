import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { build } from "tsdown";

console.log("Starting build process...");

// 步骤 1: 使用 tsdown 编程 API 完成打包
const bundles = await build({
  entry: {
    index: "src/index.ts",
    node: "src/node.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  hash: false,
  external: ["@napi-rs/canvas"],
});

console.log("Build completed!");
console.log(`Generated ${bundles.length} bundle(s)`);

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
pkg.main = "./index.cjs";
pkg.module = "./index.mjs";
pkg.types = "./index.d.cts";
pkg.exports = {
  ".": {
    require: {
      types: "./index.d.cts",
      import: "./index.cjs",
      default: "./index.cjs",
    },
    import: {
      types: "./index.d.mts",
      import: "./index.mjs",
      default: "./index.mjs",
    },
  },
  "./node": {
    require: {
      types: "./node.d.cts",
      import: "./node.cjs",
      default: "./node.cjs",
    },
    import: {
      types: "./node.d.mts",
      import: "./node.mjs",
      default: "./node.mjs",
    },
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
      // 替换 @/node 为 @codehz/draw-call/node
      .replace(/from "@\/node"/g, 'from "@codehz/draw-call/node"');

    // 写入文件
    writeFileSync(destPath, content);
    console.log(`  - ${file}`);
  }
}

copyAndRewriteExamples();

console.log("\n✓ Release build completed successfully!");
console.log("Ready to publish from dist/ directory");
