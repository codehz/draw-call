/**
 * draw-call 网页演示
 * 展示库的各项功能：逐句布局、样式、文本排版等
 */
import { Box, Text, createCanvas, linearGradient } from "../src";

// 获取 canvas 元素并设置尺寸
const canvasEl = document.getElementById("canvas") as HTMLCanvasElement;
if (!canvasEl) throw new Error("Canvas element not found");

// 根据设备像素比设置实际大小
const dpr = window.devicePixelRatio || 1;
const width = 720;
const height = 400;

canvasEl.width = width * dpr;
canvasEl.height = height * dpr;
canvasEl.style.width = `${width}px`;
canvasEl.style.height = `${height}px`;

// 创建 Canvas 实例
const canvas = createCanvas({
  width,
  height,
  pixelRatio: dpr,
  canvas: canvasEl,
});

// 渲染演示内容
canvas.render(
  Box({
    width: "fill",
    height: "fill",
    background: "#ffffff",
    direction: "row",
    children: [
      // 左侧：功能展示区
      Box({
        flex: 1,
        background: linearGradient(135, "#667eea", "#764ba2"),
        padding: 20,
        direction: "column",
        justify: "space-between",
        align: "start",
        children: [
          // 标题部分
          Box({
            direction: "column",
            gap: 8,
            children: [
              Text({
                content: "draw-call",
                font: { size: 32, weight: "bold", family: "sans-serif" },
                color: "#ffffff",
              }),
              Text({
                content: "声明式 Canvas 绘图",
                font: { size: 14, family: "sans-serif" },
                color: "rgba(255,255,255,0.8)",
              }),
            ],
          }),

          // 功能列表
          Box({
            direction: "column",
            gap: 12,
            children: [
              // 功能项 1
              Box({
                direction: "row",
                gap: 8,
                align: "center",
                children: [
                  Box({
                    width: 8,
                    height: 8,
                    background: "#ffd700",
                    border: { radius: 4 },
                  }),
                  Text({
                    content: "Flexbox 布局引擎",
                    font: { size: 12, family: "sans-serif" },
                    color: "#ffffff",
                  }),
                ],
              }),
              // 功能项 2
              Box({
                direction: "row",
                gap: 8,
                align: "center",
                children: [
                  Box({
                    width: 8,
                    height: 8,
                    background: "#ffd700",
                    border: { radius: 4 },
                  }),
                  Text({
                    content: "丰富的样式支持",
                    font: { size: 12, family: "sans-serif" },
                    color: "#ffffff",
                  }),
                ],
              }),
              // 功能项 3
              Box({
                direction: "row",
                gap: 8,
                align: "center",
                children: [
                  Box({
                    width: 8,
                    height: 8,
                    background: "#ffd700",
                    border: { radius: 4 },
                  }),
                  Text({
                    content: "自动换行 & 排版",
                    font: { size: 12, family: "sans-serif" },
                    color: "#ffffff",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      // 右侧：卡片展示
      Box({
        flex: 1,
        padding: 20,
        direction: "column",
        gap: 12,
        background: "#f5f7fa",
        justify: "center",
        align: "center",
        children: [
          // 卡片 1：样式展示
          Box({
            width: "fill",
            background: "#ffffff",
            border: { radius: 8, width: 1, color: "#e0e0e0" },
            padding: 12,
            shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.08)" },
            direction: "column",
            gap: 8,
            children: [
              Text({
                content: "渐变背景示例",
                font: { size: 12, weight: "bold", family: "sans-serif" },
                color: "#333",
              }),
              Box({
                height: 30,
                background: linearGradient(90, "#667eea", "#764ba2", "#f093fb"),
                border: { radius: 4 },
              }),
            ],
          }),

          // 卡片 2：阴影展示
          Box({
            width: "fill",
            background: "#ffffff",
            border: { radius: 8, width: 1, color: "#e0e0e0" },
            padding: 12,
            shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.08)" },
            direction: "column",
            gap: 8,
            children: [
              Text({
                content: "多彩标签",
                font: { size: 12, weight: "bold", family: "sans-serif" },
                color: "#333",
              }),
              Box({
                direction: "row",
                gap: 6,
                children: [
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#e8f4ff",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "Canvas",
                        font: { size: 11, family: "sans-serif" },
                        color: "#1890ff",
                      }),
                    ],
                  }),
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#f6ffed",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "TypeScript",
                        font: { size: 11, family: "sans-serif" },
                        color: "#52c41a",
                      }),
                    ],
                  }),
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#fff7e6",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "声明式",
                        font: { size: 11, family: "sans-serif" },
                        color: "#fa8c16",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // 卡片 3：文本排版
          Box({
            width: "fill",
            background: "#ffffff",
            border: { radius: 8, width: 1, color: "#e0e0e0" },
            padding: 12,
            shadow: { offsetY: 2, blur: 8, color: "rgba(0,0,0,0.08)" },
            direction: "column",
            gap: 8,
            children: [
              Text({
                content: "自动换行示例",
                font: { size: 12, weight: "bold", family: "sans-serif" },
                color: "#333",
              }),
              Text({
                content: "draw-call 支持自动换行和文本排版，可以创建专业的 Canvas 内容。",
                font: { size: 10, family: "sans-serif" },
                color: "#666",
                wrap: true,
                lineHeight: 1.4,
              }),
            ],
          }),
        ],
      }),
    ],
  })
);
