# @codehz/draw-call

一个声明式 Canvas 绘图库，提供 Flexbox 布局引擎和组件化渲染系统。使用类似 UI 框架的方式来绘制 Canvas 内容，让 Canvas 绘图变得简单直观。

## ✨ 特性

- **Flexbox 布局引擎** - 支持完整的 Flexbox 布局，包括方向、对齐、间距等
- **组件化渲染** - 提供 Box、Text、Image、Svg、Stack 等组件
- **丰富的样式支持** - 渐变、阴影、边框、圆角等
- **文本排版** - 自动换行、省略号、行高控制等
- **SVG 图形** - 支持矩形、圆形、椭圆、路径等 SVG 图形
- **跨平台** - 支持浏览器和 Node.js 环境
- **TypeScript** - 完整的类型支持

## 📦 安装

```bash
bun install @codehz/draw-call
```

## 🚀 快速开始

### 浏览器环境

```typescript
import { createCanvas, Box, Text } from "@codehz/draw-call";

// 获取 canvas 元素
const canvasEl = document.getElementById("canvas") as HTMLCanvasElement;

// 创建 Canvas 实例
const canvas = createCanvas({
  width: 400,
  height: 300,
  pixelRatio: window.devicePixelRatio || 1,
  canvas: canvasEl,
});

// 渲染内容
canvas.render(
  Box({
    width: "fill",
    height: "fill",
    background: "#ffffff",
    padding: 20,
    children: [
      Text({
        content: "Hello, draw-call!",
        font: { size: 24, weight: "bold" },
        color: "#333333",
      }),
    ],
  })
);
```

### Node.js 环境

```typescript
import { createCanvas, Box, Text } from "@codehz/draw-call";
import { createNodeCanvas } from "@codehz/draw-call/node";

// 创建 Canvas 实例
const canvas = createNodeCanvas({
  width: 400,
  height: 300,
  pixelRatio: 2,
});

// 渲染内容
canvas.render(
  Box({
    width: "fill",
    height: "fill",
    background: "#ffffff",
    padding: 20,
    children: [
      Text({
        content: "Hello, draw-call!",
        font: { size: 24, weight: "bold" },
        color: "#333333",
      }),
    ],
  })
);

// 保存为图片
const buffer = await canvas.toBuffer("image/png");
await Bun.write("output.png", buffer);
```

## 📚 组件

### Box

容器组件，支持 Flexbox 布局和丰富的样式。

```typescript
Box({
  width: 200,
  height: 100,
  background: "#ffffff",
  border: { radius: 8, width: 1, color: "#e0e0e0" },
  shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.08)" },
  padding: 20,
  direction: "row",
  justify: "center",
  align: "center",
  children: [...],
})
```

### Text

文本组件，支持自动换行、行高控制等。

```typescript
Text({
  content: "这是一段文本",
  font: { size: 16, weight: "bold", family: "sans-serif" },
  color: "#333333",
  align: "center",
  lineHeight: 1.5,
  wrap: true,
  maxLines: 3,
  ellipsis: true,
});
```

### RichText

富文本组件，支持同时展示多种样式的文本，每个文本段落可以有不同的字体、颜色、背景、装饰等。

```typescript
RichText({
  spans: [
    {
      text: "普通文本 ",
      color: "#333333",
    },
    {
      text: "加粗文本 ",
      font: { size: 16, weight: "bold" },
      color: "#333333",
    },
    {
      text: "彩色文本 ",
      font: { size: 16, weight: "bold" },
      color: "#667eea",
    },
    {
      text: "带背景 ",
      color: "#ffffff",
      background: "#764ba2",
    },
    {
      text: "带下划线",
      underline: true,
      color: "#333333",
    },
    {
      text: "删除线",
      strikethrough: true,
      color: "#999999",
    },
  ],
  lineHeight: 1.5,
  align: "left",
  maxLines: 5,
  ellipsis: true,
});
```

### Image

图片组件，支持多种适配模式。

```typescript
Image({
  src: imageBitmap,
  width: 200,
  height: 150,
  fit: "cover", // contain | cover | fill | none | scale-down
  position: { x: "center", y: "center" },
  border: { radius: 8 },
});
```

### Svg

SVG 图形组件，支持多种图形元素。

```typescript
import { svg } from "@codehz/draw-call";

Svg({
  width: 200,
  height: 100,
  viewBox: { width: 200, height: 100 },
  children: [
    svg.rect({ x: 10, y: 10, width: 50, height: 30, fill: "#667eea" }),
    svg.circle({ cx: 100, cy: 50, r: 20, fill: "#764ba2" }),
    svg.path({ d: "M150 50 Q170 30, 190 50", stroke: { color: "#333", width: 2 } }),
  ],
});
```

### Stack

堆叠组件，子元素绝对定位。

```typescript
Stack({
  width: 200,
  height: 200,
  align: "center",
  justify: "center",
  children: [
    Box({ width: 100, height: 100, background: "#ff0000" }),
    Box({ width: 50, height: 50, background: "#00ff00" }),
  ],
});
```

## 🎨 样式

### 尺寸

```typescript
// 固定像素值
width: 100;

// 百分比
width: "50%";

// 自动计算
width: "auto";

// 填充可用空间
width: "fill";
```

### 颜色

```typescript
// CSS 颜色字符串
background: "#ff0000";
background: "rgb(255, 0, 0)";
background: "red";

// 渐变
import { linearGradient, radialGradient } from "@codehz/draw-call";

// 线性渐变
background: linearGradient(135, "#667eea", "#764ba2");

// 带位置色标的线性渐变
background: linearGradient(90, [0, "#667eea"], [0.5, "#764ba2"], [1, "#f093fb"]);

// 径向渐变
background: radialGradient({ startX: 0.5, startY: 0.5, endRadius: 0.5 }, "#667eea", "#764ba2");
```

### 边框

```typescript
border: {
  width: 2,
  color: "#e0e0e0",
  radius: 8, // 或 [8, 8, 8, 8] 分别对应左上、右上、右下、左下
}
```

### 阴影

```typescript
shadow: {
  offsetX: 0,
  offsetY: 4,
  blur: 16,
  color: "rgba(0,0,0,0.12)",
}
```

### 间距

```typescript
// 四边相同
padding: 20
margin: 10

// 分别设置
padding: { top: 10, right: 20, bottom: 10, left: 20 }
margin: { top: 5, right: 10, bottom: 5, left: 10 }
```

## 📐 布局

### Flexbox 布局

```typescript
Box({
  direction: "row", // row | column
  justify: "center", // flex-start | center | flex-end | space-between | space-around | space-evenly
  align: "center", // flex-start | center | flex-end | stretch | baseline
  gap: 10,
  wrap: true,
  children: [...],
})
```

### 弹性布局

```typescript
Box({
  direction: "row",
  children: [
    Box({ width: 100 }), // 固定宽度
    Box({ flex: 1 }), // 占据剩余空间
    Box({ flex: 2 }), // 占据 2 份剩余空间
  ],
});
```

## 🔧 高级用法

### 自定义字体（Node.js）

```typescript
import { GlobalFonts } from "@napi-rs/canvas";

GlobalFonts.registerFromPath("/path/to/font.ttf", "CustomFont");

Text({
  content: "自定义字体",
  font: { family: "CustomFont", size: 16 },
});
```

### 导出图片

```typescript
// 导出为 PNG
const buffer = await canvas.toBuffer("image/png");

// 导出为 JPEG
const buffer = await canvas.toBuffer("image/jpeg", { quality: 0.9 });

// 导出为 WebP
const buffer = await canvas.toBuffer("image/webp", { quality: 0.8 });
```

### 获取布局信息

```typescript
const layoutNode = canvas.render(
  Box({
    width: 200,
    height: 100,
    children: [...],
  })
);

console.log(layoutNode.layout.width);   // 200
console.log(layoutNode.layout.height);  // 100
console.log(layoutNode.layout.x);       // 0
console.log(layoutNode.layout.y);       // 0
```

## 📖 示例

查看 [examples](examples) 目录获取更多示例：

- [demo.ts](examples/demo.ts) - 浏览器环境演示
- [card.ts](examples/card.ts) - Node.js 环境卡片示例

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT
