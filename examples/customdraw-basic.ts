/**
 * 示例：CustomDraw 基础用法
 * 展示如何使用 CustomDraw 进行简单的自定义绘制
 * 运行: bun examples/customdraw-basic.ts
 */
import { Box, createCanvas, CustomDraw, printLayout, Text } from "@/index";
import { GlobalFonts } from "@napi-rs/canvas";
import { fileURLToPath } from "bun";

GlobalFonts.registerFromPath(fileURLToPath(import.meta.resolve("@fontpkg/unifont/unifont-15.0.01.ttf")), "unifont");

const canvas = createCanvas({
  width: 600,
  height: 1000,
  pixelRatio: 2,
});

// 1. 最基础的例子：简单矩形
const SimpleRect = CustomDraw({
  width: 150,
  height: 80,
  draw(ctx, { width, height }) {
    const canvas = ctx.canvas;
    canvas.fillStyle = "#667eea";
    canvas.fillRect(0, 0, width, height);
    canvas.fillStyle = "#000000";
    canvas.font = "bold 16px sans-serif";
    canvas.textAlign = "center";
    canvas.textBaseline = "middle";
    canvas.fillText("Simple Rect", width / 2, height / 2);
  },
});

// 2. 使用 save/restore 的例子：旋转的矩形
const RotatedRect = CustomDraw({
  width: 150,
  height: 80,
  draw(ctx, { width, height }) {
    const canvas = ctx.canvas;
    // save/restore 会自动平衡，即使不显式调用也能正确恢复
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((Math.PI / 4) * 0.3); // 15 度
    canvas.fillStyle = "#764ba2";
    canvas.fillRect(-width / 2, -height / 2, width, height);
    ctx.restore();

    // 恢复后可以正常绘制
    canvas.fillStyle = "#000000";
    canvas.font = "16px sans-serif";
    canvas.textAlign = "center";
    canvas.textBaseline = "middle";
    canvas.fillText("Rotated", width / 2, height / 2);
  },
});

// 3. 圆形进度条（使用子元素）
const CircleProgress = CustomDraw({
  width: 140,
  height: 140,
  draw(ctx, { width, height, inner }) {
    const canvas = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 8;

    // 绘制背景圆
    canvas.strokeStyle = "rgba(0, 0, 0, 0.1)";
    canvas.lineWidth = 8;
    canvas.beginPath();
    canvas.arc(centerX, centerY, radius, 0, Math.PI * 2);
    canvas.stroke();

    // 绘制进度圆（65% 完成）
    const percentage = 65;
    canvas.strokeStyle = "#ff6b6b";
    canvas.lineCap = "round";
    canvas.beginPath();
    canvas.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (percentage / 100) * Math.PI * 2);
    canvas.stroke();

    // 调用 inner() 在中央渲染子元素（百分比文本）
    inner?.();
  },
  children: Box({
    width: "fill",
    height: "fill",
    justify: "center",
    align: "center",
    children: [
      Text({
        content: "65%",
        font: { size: 24, weight: "bold", family: "unifont" },
        color: "#ff6b6b",
      }),
    ],
  }),
});

// 4. 星形图案
const StarShape = CustomDraw({
  width: 150,
  height: 150,
  draw(ctx, { width, height }) {
    const canvas = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const points = 5;
    const outerRadius = Math.min(width, height) / 2 - 5;
    const innerRadius = outerRadius * 0.4;

    canvas.fillStyle = "#ffd93d";
    canvas.beginPath();

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (i === 0) {
        canvas.moveTo(x, y);
      } else {
        canvas.lineTo(x, y);
      }
    }

    canvas.closePath();
    canvas.fill();

    // 描边
    canvas.strokeStyle = "#fa8c16";
    canvas.lineWidth = 2;
    canvas.stroke();
  },
});

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
        content: "CustomDraw 基础用法",
        font: { size: 24, weight: "bold", family: "unifont" },
        color: "#333333",
      }),

      // 示例 1：简单矩形
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "1. 简单的自定义绘制",
            font: { size: 14, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            justify: "center",
            align: "center",
            children: [SimpleRect],
          }),
        ],
      }),

      // 示例 2：旋转矩形（save/restore 管理）
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "2. Transform 和 Save/Restore 管理",
            font: { size: 14, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            justify: "center",
            align: "center",
            children: [RotatedRect],
          }),
        ],
      }),

      // 示例 3：进度条（子元素）
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "3. CustomDraw 包含子元素（inner 函数）",
            font: { size: 14, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            justify: "center",
            align: "center",
            children: [CircleProgress],
          }),
        ],
      }),

      // 示例 4：星形（复杂路径）
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "4. 复杂形状（五角星）",
            font: { size: 14, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            justify: "center",
            align: "center",
            children: [StarShape],
          }),
        ],
      }),

      // 说明
      Box({
        background: "#e8f4ff",
        border: { radius: 8, color: "#1890ff" },
        padding: 15,
        direction: "column",
        gap: 8,
        children: [
          Text({
            content: "提示：",
            font: { size: 12, weight: "bold", family: "unifont" },
            color: "#1890ff",
          }),
          Text({
            content:
              "CustomDraw 提供受控的 transform/save/restore 能力，并通过 ctx.canvas 暴露原生 Canvas API。使用 inner() 方法可以在自定义绘制中渲染子元素。",
            font: { size: 12, family: "unifont" },
            color: "#1890ff",
            wrap: true,
            lineHeight: 1.5,
          }),
        ],
      }),
    ],
  })
);

// 保存文件
const buffer = await canvas.toBuffer("image/png");
await Bun.write("examples/customdraw-basic.png", buffer);
console.log("✅ CustomDraw basic demo saved to examples/customdraw-basic.png");

// 打印布局树
console.log("\n=== Layout Tree ===");
printLayout(layout);
