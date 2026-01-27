/**
 * 示例：使用 CustomDraw 组件进行自定义绘制
 * 展示直接调用 Canvas API、Transform 管理和子元素渲染功能
 * 运行: bun examples/customdraw.ts
 */
import { Box, createCanvas, CustomDraw, printLayout, Text } from "@/index";
import { GlobalFonts } from "@napi-rs/canvas";
import { fileURLToPath } from "bun";

GlobalFonts.registerFromPath(fileURLToPath(import.meta.resolve("@fontpkg/unifont/unifont-15.0.01.ttf")), "unifont");

const canvas = createCanvas({
  width: 800,
  height: 1000,
  pixelRatio: 2,
});

// 绘制饼图
function PieChart(data: Array<{ label: string; value: number; color: string }>) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return CustomDraw({
    width: 200,
    height: 200,
    draw(ctx, { width, height }) {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 5;

      let currentAngle = -Math.PI / 2;

      for (const item of data) {
        const sliceAngle = (item.value / total) * Math.PI * 2;

        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();

        // 绘制边框
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        currentAngle += sliceAngle;
      }
    },
  });
}

// 绘制网格背景
function GridBackground() {
  return CustomDraw({
    width: 100,
    height: 100,
    draw(ctx, { width, height }) {
      const gridSize = 20;

      ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
      ctx.lineWidth = 1;

      // 绘制垂直线
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 绘制水平线
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
  });
}

// 绘制圆形进度条
function ProgressRing(percentage: number, color: string) {
  return CustomDraw({
    width: 120,
    height: 120,
    draw(ctx, { inner, width, height }) {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 8;

      // 绘制背景圆
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 绘制进度圆
      const endAngle = (percentage / 100) * Math.PI * 2 - Math.PI / 2;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
      ctx.stroke();

      // 绘制百分比文本的背景
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.globalAlpha = 0.1;
      ctx.fillRect(centerX - 30, centerY - 20, 60, 40);
      ctx.restore();

      inner?.();
    },
    children: Box({
      width: "fill",
      height: "fill",
      justify: "center",
      align: "center",
      children: [
        Text({
          content: `${percentage}%`,
          font: { size: 20, weight: "bold", family: "unifont" },
          color: color,
        }),
      ],
    }),
  });
}

// 绘制折线图
function LineChart() {
  const data = [10, 25, 15, 30, 20, 35, 25, 40];

  return CustomDraw({
    width: 300,
    height: 150,
    draw(ctx, { width, height }) {
      const padding = 10;
      const graphWidth = width - padding * 2;
      const graphHeight = height - padding * 2;

      const maxValue = Math.max(...data);
      const pointSpacing = graphWidth / (data.length - 1);

      // 绘制网格线
      ctx.strokeStyle = "rgba(200, 200, 200, 0.2)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + (graphHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // 绘制折线
      ctx.strokeStyle = "#667eea";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < data.length; i++) {
        const x = padding + i * pointSpacing;
        const y = height - padding - (data[i] / maxValue) * graphHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // 绘制数据点
      ctx.fillStyle = "#667eea";
      for (let i = 0; i < data.length; i++) {
        const x = padding + i * pointSpacing;
        const y = height - padding - (data[i] / maxValue) * graphHeight;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 绘制阴影
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#667eea";
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);

      for (let i = 0; i < data.length; i++) {
        const x = padding + i * pointSpacing;
        const y = height - padding - (data[i] / maxValue) * graphHeight;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width - padding, height - padding);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
  });
}

const layout = canvas.render(
  Box({
    width: "fill",
    height: "fill",
    background: "#f5f7fa",
    padding: 20,
    direction: "column",
    gap: 20,
    children: [
      // 标题
      Text({
        content: "CustomDraw 组件演示",
        font: { size: 28, weight: "bold", family: "unifont" },
        color: "#333333",
      }),

      Text({
        content: "直接调用 Canvas API 进行自定义绘制，同时支持可选的子元素",
        font: { size: 14, family: "unifont" },
        color: "#666666",
      }),

      // 第一部分：简单绘制
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "1. 网格背景 + 直接 Canvas 绘制",
            font: { size: 16, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            clip: true,
            children: [GridBackground()],
          }),
        ],
      }),

      // 第二部分：饼图
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "2. 饼图示例",
            font: { size: 16, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            justify: "center",
            align: "center",
            direction: "row",
            gap: 40,
            children: [
              PieChart([
                { label: "类别 A", value: 30, color: "#667eea" },
                { label: "类别 B", value: 25, color: "#764ba2" },
                { label: "类别 C", value: 25, color: "#f093fb" },
                { label: "类别 D", value: 20, color: "#4facfe" },
              ]),
              PieChart([
                { label: "类别 1", value: 40, color: "#ff6b6b" },
                { label: "类别 2", value: 35, color: "#ff922b" },
                { label: "类别 3", value: 25, color: "#ffd93d" },
              ]),
            ],
          }),
        ],
      }),

      // 第三部分：进度圈（子元素示例）
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "3. 进度圆环（包含子元素内容）",
            font: { size: 16, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            direction: "row",
            gap: 20,
            justify: "center",
            align: "center",
            children: [ProgressRing(75, "#667eea"), ProgressRing(45, "#764ba2"), ProgressRing(90, "#ff6b6b")],
          }),
        ],
      }),

      // 第四部分：折线图
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "4. 折线图与网格",
            font: { size: 16, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 10,
            children: [LineChart()],
          }),
        ],
      }),
    ],
  })
);

// 保存文件
const buffer = await canvas.toBuffer("image/png");
await Bun.write("examples/customdraw.png", buffer);
console.log("✅ CustomDraw demo saved to examples/customdraw.png");

// 打印布局树
console.log("\n=== Layout Tree ===");
printLayout(layout);
