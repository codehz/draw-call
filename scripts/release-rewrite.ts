import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("dist/package.json", "utf-8"));

// 移除开发相关的字段
delete pkg.scripts;
delete pkg["lint-staged"];

// 添加发布相关的字段
pkg.main = "./index.cjs";
pkg.module = "./index.mjs";
pkg.types = "./index.d.cts";
pkg.exports = {
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
};

writeFileSync("dist/package.json", JSON.stringify(pkg, null, 2) + "\n");
