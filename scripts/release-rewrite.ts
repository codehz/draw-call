import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const pkg = JSON.parse(readFileSync("dist/package.json", "utf-8"));

// 移除开发相关的字段
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

// 复制并改写 examples
function copyAndRewriteExamples() {
  const examplesDir = "examples";
  const distExamplesDir = "dist/examples";

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
    console.log(`Copied and rewrote: ${file}`);
  }
}

copyAndRewriteExamples();
console.log("Examples copied and rewritten successfully!");
