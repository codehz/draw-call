/**
 * 示例：使用 draw-call 的 RichText 组件
 * 运行: bun examples/richtext.ts
 */
import { Box, createCanvas, RichText, Text } from "@/index";
import { GlobalFonts } from "@napi-rs/canvas";
import { fileURLToPath } from "bun";

GlobalFonts.registerFromPath(fileURLToPath(import.meta.resolve("@fontpkg/unifont/unifont-15.0.01.ttf")), "unifont");

const canvas = createCanvas({
  width: 400,
  height: 820,
  pixelRatio: 2,
});

// 绘制背景
canvas.render(
  Box({
    width: "fill",
    height: "fill",
    background: "#f8f9fa",
    padding: 20,
    direction: "column",
    gap: 20,
    children: [
      // 标题
      Text({
        content: "RichText 富文本演示",
        font: { size: 20, weight: "bold", family: "unifont" },
        color: "#333",
      }),

      // 基本用法
      Box({
        background: "#ffffff",
        border: { radius: 8 },
        padding: 12,
        shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.06)" },
        direction: "column",
        gap: 8,
        children: [
          Text({
            content: "基本用法 - 多样式文本",
            font: { size: 12, family: "unifont" },
            color: "#666",
          }),
          RichText({
            spans: [
              { text: "Hello, ", color: "#333", font: { size: 14, family: "unifont" } },
              { text: "World", color: "#ff6b6b", font: { size: 18, weight: "bold", family: "unifont" } },
              { text: "!", color: "#333", font: { size: 14, family: "unifont" } },
            ],
          }),
        ],
      }),

      // 渐变色文本
      Box({
        background: "#ffffff",
        border: { radius: 8 },
        padding: 12,
        shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.06)" },
        direction: "column",
        gap: 8,
        children: [
          Text({
            content: "带背景色的文本",
            font: { size: 12, family: "unifont" },
            color: "#666",
          }),
          RichText({
            spans: [
              { text: "红色背景", background: "#ffe8e8", color: "#f5222d" },
              { text: " " },
              { text: "绿色背景", background: "#f6ffed", color: "#52c41a" },
              { text: " " },
              { text: "蓝色背景", background: "#e8f4ff", color: "#1890ff" },
            ],
          }),
        ],
      }),

      // 下划线和删除线
      Box({
        background: "#ffffff",
        border: { radius: 8 },
        padding: 12,
        shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.06)" },
        direction: "column",
        gap: 8,
        children: [
          Text({
            content: "文本装饰 - 下划线和删除线",
            font: { size: 12, family: "unifont" },
            color: "#666",
          }),
          RichText({
            spans: [
              { text: "下划线文本", underline: true, color: "#333", font: { size: 14, family: "unifont" } },
              { text: " " },
              { text: "删除线文本", strikethrough: true, color: "#333", font: { size: 14, family: "unifont" } },
              { text: " " },
              {
                text: "组合效果",
                underline: true,
                strikethrough: true,
                color: "#f5222d",
                font: { size: 14, family: "unifont" },
              },
            ],
          }),
        ],
      }),

      // 自动换行
      Box({
        background: "#ffffff",
        border: { radius: 8 },
        padding: 12,
        shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.06)" },
        direction: "column",
        gap: 8,
        children: [
          Text({
            content: "自动换行 - 长文本",
            font: { size: 12, family: "unifont" },
            color: "#666",
          }),
          RichText({
            spans: [
              {
                text: "这是一个很长很长的富文本段落，它会自动换行以适应容器的宽度。",
                color: "#333",
                font: { size: 13, family: "unifont" },
              },
            ],
          }),
        ],
      }),

      // 混合样式换行
      Box({
        background: "#ffffff",
        border: { radius: 8 },
        padding: 12,
        shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.06)" },
        direction: "column",
        gap: 8,
        children: [
          Text({
            content: "混合样式自动换行",
            font: { size: 12, family: "unifont" },
            color: "#666",
          }),
          RichText({
            spans: [
              { text: "draw-call ", color: "#333", font: { size: 13, family: "unifont" } },
              { text: "是一个", color: "#666", font: { size: 13, family: "unifont" } },
              { text: "声明式", color: "#1890ff", font: { size: 13, weight: "bold", family: "unifont" } },
              { text: " Canvas 绘图库，支持", color: "#333", font: { size: 13, family: "unifont" } },
              { text: "Flexbox 布局", color: "#52c41a", font: { size: 13, family: "unifont" }, underline: true },
              { text: "和", color: "#333", font: { size: 13, family: "unifont" } },
              { text: "富文本渲染", color: "#f5222d", font: { size: 13, weight: "bold", family: "unifont" } },
              { text: "。", color: "#333", font: { size: 13, family: "unifont" } },
            ],
          }),
        ],
      }),

      // 对齐方式
      Box({
        background: "#ffffff",
        border: { radius: 8 },
        padding: 12,
        shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.06)" },
        direction: "column",
        gap: 8,
        children: [
          Text({
            content: "文本对齐方式",
            font: { size: 12, family: "unifont" },
            color: "#666",
          }),
          Box({
            width: "fill",
            background: "#f5f5f5",
            border: { radius: 4 },
            padding: 8,
            direction: "column",
            gap: 4,
            children: [
              Text({
                content: "左对齐:",
                font: { size: 11, family: "unifont" },
                color: "#999",
              }),
              RichText({
                align: "left",
                spans: [{ text: "这是一段左对齐的富文本", color: "#333", font: { size: 12, family: "unifont" } }],
              }),
            ],
          }),
          Box({
            width: "fill",
            background: "#f5f5f5",
            border: { radius: 4 },
            padding: 8,
            direction: "column",
            gap: 4,
            children: [
              Text({
                content: "居中对齐:",
                font: { size: 11, family: "unifont" },
                color: "#999",
              }),
              RichText({
                align: "center",
                width: "fill",
                spans: [{ text: "这是一段居中对齐的富文本", color: "#333", font: { size: 12, family: "unifont" } }],
              }),
            ],
          }),
          Box({
            width: "fill",
            background: "#f5f5f5",
            border: { radius: 4 },
            padding: 8,
            direction: "column",
            gap: 4,
            children: [
              Text({
                content: "右对齐:",
                font: { size: 11, family: "unifont" },
                color: "#999",
              }),
              RichText({
                align: "right",
                width: "fill",
                spans: [{ text: "这是一段右对齐的富文本", color: "#333", font: { size: 12, family: "unifont" } }],
              }),
            ],
          }),
        ],
      }),

      // 彩色标签云
      Box({
        background: "#ffffff",
        border: { radius: 8 },
        padding: 12,
        shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.06)" },
        direction: "column",
        gap: 8,
        children: [
          Text({
            content: "彩色标签展示",
            font: { size: 12, family: "unifont" },
            color: "#666",
          }),
          RichText({
            spans: [
              { text: "TypeScript", background: "#e8f4ff", color: "#1890ff", font: { size: 12, family: "unifont" } },
              { text: " " },
              { text: "Canvas", background: "#f6ffed", color: "#52c41a", font: { size: 12, family: "unifont" } },
              { text: " " },
              { text: "Flexbox", background: "#fff7e6", color: "#fa8c16", font: { size: 12, family: "unifont" } },
              { text: " " },
              { text: "声明式", background: "#ffe8e8", color: "#f5222d", font: { size: 12, family: "unifont" } },
              { text: " " },
              { text: "组件化", background: "#f0f0ff", color: "#2f54eb", font: { size: 12, family: "unifont" } },
            ],
          }),
        ],
      }),
    ],
  })
);

// 保存到文件
const buffer = await canvas.toBuffer("image/png");
await Bun.write("examples/richtext.png", buffer);
console.log("RichText demo saved to examples/richtext.png");
