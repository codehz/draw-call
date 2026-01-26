/**
 * 示例：演示 Transform 组件的基础属性
 * 展示移动（translate）、旋转（rotate）、放大（scale）等变换效果
 * 运行: bun examples/transform.ts
 */
import { Box, Text, Transform, printLayout } from "@/index";
import { createNodeCanvas } from "@/node";
import { GlobalFonts } from "@napi-rs/canvas";
import { fileURLToPath } from "bun";

GlobalFonts.registerFromPath(fileURLToPath(import.meta.resolve("@fontpkg/unifont/unifont-15.0.01.ttf")), "unifont");

const canvas = createNodeCanvas({
  width: 800,
  height: 1000,
  pixelRatio: 2,
});

// 创建一个简单的演示盒子
function DemoBox(label: string, transform?: any) {
  return Transform({
    transform,
    transformOrigin: ["50%", "50%"],
    children: Box({
      width: 80,
      height: 80,
      background: "#667eea",
      border: { radius: 8 },
      justify: "center",
      align: "center",
      children: [
        Text({
          content: label,
          font: { size: 12, weight: "bold", family: "unifont" },
          color: "#ffffff",
        }),
      ],
    }),
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
        content: "Transform 变换演示",
        font: { size: 28, weight: "bold", family: "unifont" },
        color: "#333333",
      }),

      // 第一行：平移演示
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "1. 平移 (Translate)",
            font: { size: 16, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            direction: "row",
            gap: 30,
            align: "center",
            children: [
              // 没有变换
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("原始"),
                  Text({
                    content: "原始位置",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 向右平移 30 像素
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("右移30", {
                    translate: [30, 0],
                  }),
                  Text({
                    content: "translateX(30)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 向下平移 20 像素
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("下移20", {
                    translate: [0, 20],
                  }),
                  Text({
                    content: "translateY(20)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 同时平移
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("对角", {
                    translate: [25, 15],
                  }),
                  Text({
                    content: "translate(25, 15)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      // 第二行：缩放演示
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "2. 缩放 (Scale)",
            font: { size: 16, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            direction: "row",
            gap: 30,
            align: "center",
            children: [
              // 原始
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("1.0"),
                  Text({
                    content: "scale(1.0)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 放大 1.5 倍
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("1.5倍", {
                    scale: 1.5,
                  }),
                  Text({
                    content: "scale(1.5)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 缩小到 0.7 倍
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("0.7倍", {
                    scale: 0.7,
                  }),
                  Text({
                    content: "scale(0.7)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 非均匀缩放
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("非均匀", {
                    scale: [1.3, 0.8],
                  }),
                  Text({
                    content: "scale(1.3, 0.8)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      // 第三行：旋转演示
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "3. 旋转 (Rotate)",
            font: { size: 16, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            direction: "row",
            gap: 30,
            align: "center",
            children: [
              // 原始
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("0°"),
                  Text({
                    content: "rotate(0°)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 顺时针 45 度
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("45°", {
                    rotate: 45, // 45度
                  }),
                  Text({
                    content: "rotate(45°)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 旋转 90 度
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("90°", {
                    rotate: 90, // 90度
                  }),
                  Text({
                    content: "rotate(90°)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 旋转 -30 度
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("-30°", {
                    rotate: -30, // -30度
                  }),
                  Text({
                    content: "rotate(-30°)",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      // 第四行：组合变换演示
      Box({
        direction: "column",
        gap: 10,
        children: [
          Text({
            content: "4. 组合变换",
            font: { size: 16, weight: "bold", family: "unifont" },
            color: "#666666",
          }),
          Box({
            background: "#ffffff",
            border: { radius: 8 },
            padding: 20,
            direction: "row",
            gap: 30,
            align: "center",
            children: [
              // 平移 + 旋转
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("移+转", {
                    translate: [20, 10],
                    rotate: 30, // 30度
                  }),
                  Text({
                    content: "移动 + 旋转",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 缩放 + 旋转
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("缩+转", {
                    scale: 1.2,
                    rotate: -22.5, // -22.5度
                  }),
                  Text({
                    content: "缩放 + 旋转",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 三个变换组合
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  DemoBox("全部", {
                    translate: [15, 10],
                    scale: 1.1,
                    rotate: 45, // 45度
                  }),
                  Text({
                    content: "移动 + 缩放 + 旋转",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
                  }),
                ],
              }),
              // 使用 transformOrigin 改变变换中心
              Box({
                direction: "column",
                gap: 8,
                align: "center",
                children: [
                  Transform({
                    transformOrigin: ["100%", "100%"],
                    transform: {
                      rotate: 45, // 45度
                      scale: 1.2,
                    },
                    children: Box({
                      width: 80,
                      height: 80,
                      background: "#764ba2",
                      border: { radius: 8 },
                      justify: "center",
                      align: "center",
                      children: [
                        Text({
                          content: "变换原点",
                          font: {
                            size: 12,
                            weight: "bold",
                            family: "unifont",
                          },
                          color: "#ffffff",
                        }),
                      ],
                    }),
                  }),
                  Text({
                    content: "自定义原点",
                    font: { size: 12, family: "unifont" },
                    color: "#999999",
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

// 保存文件
const buffer = await canvas.toBuffer("image/png");
await Bun.write("examples/transform.png", buffer);
console.log("Transform demo saved to examples/transform.png");

// 打印布局树
console.log("\n=== Layout Tree ===");
printLayout(layout);
