/**
 * draw-call 网页演示
 * 展示库的各项功能：逐句布局、样式、文本排版、图片渲染等
 */
import { Box, createCanvas, Image, linearGradient, Svg, svg, Text } from "@/index";

// 创建一个 canvas 并绘制图片内容，返回用于 Image 组件的 canvas
function createDemoImage(): HTMLCanvasElement {
  const imgCanvas = document.createElement("canvas");
  imgCanvas.width = 120;
  imgCanvas.height = 60;
  const ctx = imgCanvas.getContext("2d");
  if (!ctx) return imgCanvas;

  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 120, 60);
  gradient.addColorStop(0, "#667eea");
  gradient.addColorStop(1, "#764ba2");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, 120, 60, 8);
  ctx.fill();

  // 绘制文字
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Image Demo", 60, 30);

  return imgCanvas;
}

// 获取 canvas 元素并设置尺寸
const canvasEl = document.getElementById("canvas") as HTMLCanvasElement;
if (!canvasEl) throw new Error("Canvas element not found");

// 根据设备像素比设置实际大小
const dpr = window.devicePixelRatio || 1;
const width = 720;
const height = 600;

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
        width: "fill",
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
        width: "fill",
        flex: 2,
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
                wrap: true,
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
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#ffe8e8",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "Flexbox",
                        font: { size: 11, family: "sans-serif" },
                        color: "#f5222d",
                      }),
                    ],
                  }),
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#f0f0ff",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "布局",
                        font: { size: 11, family: "sans-serif" },
                        color: "#2f54eb",
                      }),
                    ],
                  }),
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#e8f4f8",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "渲染",
                        font: { size: 11, family: "sans-serif" },
                        color: "#1765ad",
                      }),
                    ],
                  }),
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#f9f0ff",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "组件化",
                        font: { size: 11, family: "sans-serif" },
                        color: "#722ed1",
                      }),
                    ],
                  }),
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#fff0f5",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "跨平台",
                        font: { size: 11, family: "sans-serif" },
                        color: "#eb2f96",
                      }),
                    ],
                  }),
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#f6ffec",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "高性能",
                        font: { size: 11, family: "sans-serif" },
                        color: "#52c41a",
                      }),
                    ],
                  }),
                  Box({
                    padding: { left: 6, right: 6, top: 3, bottom: 3 },
                    background: "#fffbe6",
                    border: { radius: 3 },
                    children: [
                      Text({
                        content: "易用性",
                        font: { size: 11, family: "sans-serif" },
                        color: "#d48806",
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

          // 卡片 4：图片展示
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
                content: "Canvas 图片",
                font: { size: 12, weight: "bold", family: "sans-serif" },
                color: "#333",
              }),
              Image({
                src: createDemoImage(),
                width: 120,
                height: 60,
                border: { radius: 8 },
              }),
            ],
          }),

          // 卡片 5：SVG 图形展示
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
                content: "SVG 图形",
                font: { size: 12, weight: "bold", family: "sans-serif" },
                color: "#333",
              }),
              Svg({
                width: "fill",
                height: 100,
                viewBox: { width: 200, height: 100 },
                children: [
                  // 绘制背景网格
                  svg.rect({
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 100,
                    fill: "rgba(245, 247, 250, 0.5)",
                  }),
                  // 绘制矩形
                  svg.rect({
                    x: 10,
                    y: 20,
                    width: 40,
                    height: 30,
                    rx: 5,
                    fill: "#667eea",
                  }),
                  // 绘制圆形
                  svg.circle({
                    cx: 80,
                    cy: 35,
                    r: 15,
                    fill: "#764ba2",
                  }),
                  // 绘制椭圆
                  svg.ellipse({
                    cx: 120,
                    cy: 35,
                    rx: 20,
                    ry: 12,
                    fill: "#f093fb",
                  }),
                  // 绘制线条
                  svg.line({
                    x1: 10,
                    y1: 70,
                    x2: 60,
                    y2: 70,
                    stroke: { color: "#3498db", width: 2 },
                  }),
                  // 绘制多边形
                  svg.polygon({
                    points: [
                      [80, 70],
                      [90, 55],
                      [100, 70],
                    ],
                    fill: "#e74c3c",
                  }),
                  // 绘制路径
                  svg.path({
                    d: "M120 70 Q130 50, 140 70 T160 70",
                    fill: "none",
                    stroke: { color: "#2ecc71", width: 2 },
                  }),
                  // 绘制文本
                  svg.text({
                    x: 160,
                    y: 35,
                    content: "SVG",
                    font: { size: 16, weight: "bold", family: "sans-serif" },
                    fill: "#333",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
);
