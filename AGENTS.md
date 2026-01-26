# @codehz/draw-call 开发指南

## 项目概述

`@codehz/draw-call` 是一个声明式 Canvas 绘图库，提供 Flexbox 布局引擎和组件化渲染系统。

### 核心特性

- **Flexbox 布局引擎**: 支持完整的 Flexbox 布局，包括方向、对齐、间距等
- **组件化渲染**: 提供 Box、Text、Image、Svg、Stack 等组件
- **丰富的样式支持**: 渐变、阴影、边框、圆角等
- **文本排版**: 自动换行、省略号、行高控制等
- **SVG 图形**: 支持矩形、圆形、椭圆、路径等 SVG 图形
- **跨平台**: 支持浏览器和 Node.js 环境（通过 @napi-rs/canvas）

## 项目结构

```
src/
├── canvas.ts          # Canvas 创建和管理（浏览器环境）
├── node.ts            # Node.js 环境支持
├── components/        # 组件定义
│   ├── Box.ts         # Box 容器组件
│   ├── Stack.ts       # Stack 堆叠组件
│   ├── Text.ts        # Text 文本组件
│   ├── Image.ts       # Image 图片组件
│   └── Svg.ts         # SVG 图形组件
├── layout/            # 布局引擎
│   ├── engine.ts      # 布局计算核心
│   ├── components/    # 组件固有尺寸测量
│   └── utils/         # 布局工具函数
├── render/            # 渲染引擎
│   ├── components/    # 组件渲染实现
│   └── utils/         # 渲染工具函数
├── types/             # 类型定义
│   ├── base.ts        # 基础类型（颜色、尺寸、样式等）
│   ├── components.ts  # 组件类型
│   └── layout.ts      # 布局类型
└── compat/            # 兼容层
    ├── DOMMatrix.ts   # DOMMatrix polyfill
    └── Path2D.ts      # Path2D polyfill

examples/              # 示例代码
scripts/               # 构建脚本
drafts/                # 临时文档和设计稿（不提交到 git）
```

## 开发环境

### 工具链

默认使用 Bun 作为运行时和包管理器。

- 使用 `bun <file>` 代替 `node <file>` 或 `ts-node <file>`
- 使用 `bun test` 代替 `jest` 或 `vitest`
- 使用 `bun build <file.html|file.ts|file.css>` 代替 `webpack` 或 `esbuild`
- 使用 `bun install` 代替 `npm install` 或 `yarn install` 或 `pnpm install`
- 使用 `bun run <script>` 代替 `npm run <script>` 或 `yarn run <script>` 或 `pnpm run <script>`
- 使用 `bunx <package> <command>` 代替 `npx <package> <command>`
- Bun 自动加载 .env，无需使用 dotenv

### Bun APIs

- `Bun.serve()` 支持 WebSockets、HTTPS 和路由。不要使用 `express`
- `bun:sqlite` 用于 SQLite。不要使用 `better-sqlite3`
- `Bun.redis` 用于 Redis。不要使用 `ioredis`
- `Bun.sql` 用于 Postgres。不要使用 `pg` 或 `postgres.js`
- `WebSocket` 内置。不要使用 `ws`
- 优先使用 `Bun.file` 而不是 `node:fs` 的 readFile/writeFile
- 使用 `Bun.$`ls`` 代替 execa

### TypeScript 配置

- 使用 `@/*` 路径别名指向 `src/*`
- 启用严格模式
- 目标为 ESNext
- 模块解析为 bundler 模式

## 开发工作流

### 安装依赖

```bash
bun install
```

### 运行测试

```bash
bun test
```

测试文件使用 `*.test.ts` 命名，使用 Bun 内置的测试框架：

```ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

### 代码检查和格式化

```bash
# 检查代码
bun run lint

# 自动修复
bun run lint:fix

# 格式化代码
bun run format
```

### Git Hooks

项目使用 Husky 和 lint-staged，在提交前自动运行：

- Prettier 格式化
- ESLint 检查和修复

### 构建和发布

```bash
# 构建项目
bun run release
```

发布流程：

1. 使用 tsdown 构建项目
2. 复制 package.json、README.md、LICENSE 到 dist/
3. 运行 release-rewrite.ts 脚本处理发布配置

## 组件开发

### 创建新组件

1. 在 `src/components/` 中创建组件文件
2. 在 `src/types/components.ts` 中定义组件类型
3. 在 `src/layout/components/` 中实现固有尺寸测量
4. 在 `src/render/components/` 中实现渲染逻辑
5. 在 `src/components/index.ts` 中导出组件

### 组件类型定义

组件类型应继承相应的 Props 接口：

```ts
// 基础布局属性
interface LayoutProps {
  width?: Size;
  height?: Size;
  margin?: number | Spacing;
  padding?: number | Spacing;
  // ...
}

// 容器布局属性
interface ContainerLayoutProps extends LayoutProps {
  direction?: FlexDirection;
  justify?: JustifyContent;
  align?: AlignItems;
  gap?: number;
  // ...
}
```

### 布局计算

布局引擎在 `src/layout/engine.ts` 中实现，遵循以下流程：

1. 测量固有尺寸（`measureIntrinsicSize`）
2. 解析宽高（`resolveSize`）
3. 应用 min/max 约束
4. 计算子元素布局
5. 应用偏移和对齐

### 渲染实现

渲染引擎在 `src/render/index.ts` 中实现，遵循以下流程：

1. 根据元素类型调用对应的渲染函数
2. 处理裁剪（clip）
3. 递归渲染子元素
4. 恢复上下文

## 类型系统

### 尺寸单位

```ts
type Size = number | `${number}%` | "auto" | "fill";
```

- `number`: 固定像素值
- `${number}%`: 百分比值
- `"auto"`: 自动计算（基于内容）
- `"fill"`: 填充可用空间

### 颜色类型

```ts
type Color = string | CanvasGradient | CanvasPattern | GradientDescriptor;
```

支持：

- CSS 颜色字符串（如 `#ff0000`, `rgb(255,0,0)`, `red`）
- CanvasGradient 对象
- CanvasPattern 对象
- 渐变描述符（`linearGradient` 或 `radialGradient`）

### 渐变辅助函数

```ts
// 线性渐变
linearGradient(angle: number, ...stops: (string | [number, string])[])

// 径向渐变
radialGradient(options, ...stops: (string | [number, string])[])
```

## 测试指南

### 测试文件位置

测试文件应与源文件放在同一目录下，使用 `*.test.ts` 命名。

### 测试最佳实践

1. 使用 `describe` 组织相关测试
2. 使用 `test` 定义单个测试用例
3. 使用 `expect` 进行断言
4. 测试边界情况和错误处理

### 示例

```ts
import { test, expect } from "bun:test";
import { Box, Text, createCanvas } from "@/index";

test("Box renders correctly", () => {
  const canvas = createCanvas({ width: 100, height: 100 });
  const node = canvas.render(
    Box({
      width: 50,
      height: 50,
      background: "#ff0000",
    })
  );

  expect(node.layout.width).toBe(50);
  expect(node.layout.height).toBe(50);
});
```

## 临时文档

使用 `drafts/` 目录存放临时文档和设计稿，该目录不会被提交到 git。

### 常见用途

- 设计文档
- 临时计划
- 实验性代码
- 笔记和想法

## 常见问题

### Node.js 环境支持

在 Node.js 环境中使用需要安装可选依赖：

```bash
bun install @napi-rs/canvas
```

然后使用 `createNodeCanvas` 代替 `createCanvas`。

### 性能优化

1. 避免频繁创建 Canvas 实例
2. 复用布局计算结果
3. 使用 `clip` 时注意性能影响
4. 大量文本时考虑使用 `maxLines` 限制行数

### 调试技巧

1. 使用 `canvas.getContext()` 获取原生 Canvas 上下文
2. 检查布局节点的 `layout` 属性查看计算结果
3. 使用 `canvas.toDataURL()` 导出图片查看渲染结果

## 相关资源

- [Bun 文档](https://bun.sh/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Flexbox 布局](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
