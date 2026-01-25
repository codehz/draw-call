/**
 * 示例：使用 draw-call 绘制一个卡片
 * 运行: bun examples/card.ts
 */
import { GlobalFonts } from "@napi-rs/canvas";
import { createCanvasAsync, Box, Text, linearGradient } from "../src";
import { fileURLToPath } from "bun";

async function main() {
  const fontRegister = GlobalFonts.registerFromPath(
    fileURLToPath(import.meta.resolve("@fontpkg/unifont/unifont-15.0.01.ttf")),
    "unifont",
  );

  const canvas = await createCanvasAsync({
    width: 400,
    height: 280,
    pixelRatio: 2,
  });

  // 绘制背景
  canvas.render(
    Box({
      width: "fill",
      height: "fill",
      background: "#f0f2f5",
      padding: 20,
      justify: "center",
      align: "center",
      children: [
        // 卡片
        Box({
          width: 360,
          background: "#ffffff",
          border: { radius: 12 },
          shadow: { offsetY: 4, blur: 16, color: "rgba(0,0,0,0.12)" },
          direction: "column",
          clip: true,
          children: [
            // 卡片头部
            Box({
              height: 100,
              background: linearGradient(135, "#667eea", "#764ba2"),
              padding: 20,
              justify: "end",
              align: "end",
              children: [
                Text({
                  content: "draw-call",
                  font: { size: 28, weight: "bold", family: "unifont" },
                  color: "#ffffff",
                  shadow: {
                    offsetX: 1,
                    offsetY: 1,
                    blur: 2,
                    color: "rgba(0,0,0,0.3)",
                  },
                }),
              ],
            }),
            // 卡片内容
            Box({
              padding: 20,
              direction: "column",
              gap: 12,
              children: [
                Text({
                  content: "声明式 Canvas 绘图",
                  font: { size: 18, weight: "bold", family: "unifont" },
                  color: "#333333",
                }),
                Text({
                  content:
                    "使用类似 UI 框架的方式来绘制 Canvas 内容，支持 Flexbox 布局、文本自动换行等特性。",
                  font: { size: 14, family: "unifont" },
                  color: "#666666",
                  lineHeight: 1.6,
                  wrap: true,
                }),
                // 标签
                Box({
                  direction: "row",
                  gap: 8,
                  children: [
                    Box({
                      padding: { left: 10, right: 10, top: 4, bottom: 4 },
                      background: "#e8f4ff",
                      border: { radius: 4 },
                      children: [
                        Text({
                          content: "Canvas",
                          font: { size: 12, family: "unifont" },
                          color: "#1890ff",
                        }),
                      ],
                    }),
                    Box({
                      padding: { left: 10, right: 10, top: 4, bottom: 4 },
                      background: "#f6ffed",
                      border: { radius: 4 },
                      children: [
                        Text({
                          content: "TypeScript",
                          font: { size: 12, family: "unifont" },
                          color: "#52c41a",
                        }),
                      ],
                    }),
                    Box({
                      padding: { left: 10, right: 10, top: 4, bottom: 4 },
                      background: "#fff7e6",
                      border: { radius: 4 },
                      children: [
                        Text({
                          content: "声明式",
                          font: { size: 12, family: "unifont" },
                          color: "#fa8c16",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );

  // 保存到文件
  const buffer = await canvas.toBuffer("image/png");
  await Bun.write("examples/card.png", buffer);
  console.log("Card saved to examples/card.png");
}

main().catch(console.error);
