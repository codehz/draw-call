import { Box, createCanvas, Image } from "@/index";
import { describe, expect, test } from "bun:test";

describe("Image component", () => {
  test("should create image element", () => {
    const sourceCanvas = createCanvas({ width: 100, height: 100 });
    const image = Image({
      src: sourceCanvas.canvas,
      width: 100,
      height: 100,
    });
    expect(image.type).toBe("image");
    expect(image.width).toBe(100);
    expect(image.height).toBe(100);
    expect(image.src).toBe(sourceCanvas.canvas);
  });

  test("should render image from another canvas", () => {
    const canvas = createCanvas({ width: 200, height: 200 });

    // 创建源 canvas 并绘制内容
    const sourceCanvas = createCanvas({ width: 100, height: 100 });
    const sourceCtx = sourceCanvas.getContext();
    sourceCtx.fillStyle = "#ff0000";
    sourceCtx.fillRect(0, 0, 100, 100);
    sourceCtx.fillStyle = "#ffffff";
    sourceCtx.fillText("Test", 25, 50);

    // 使用 Image 组件渲染源 canvas 的内容
    const node = canvas.render(
      Image({
        src: sourceCanvas.canvas,
        width: 100,
        height: 100,
      })
    );
    // 验证布局
    expect(node.layout.x).toBe(0);
    expect(node.layout.y).toBe(0);
    expect(node.layout.width).toBe(100);
    expect(node.layout.height).toBe(100);
  });

  test("should render image with different fit modes", () => {
    const canvas = createCanvas({ width: 300, height: 200 });

    // 创建源 canvas
    const sourceCanvas = createCanvas({ width: 200, height: 100 });
    const sourceCtx = sourceCanvas.getContext();
    sourceCtx.fillStyle = "#3498db";
    sourceCtx.fillRect(0, 0, 200, 100);

    // 测试 contain 模式
    const containNode = canvas.render(
      Image({
        src: sourceCanvas.canvas,
        width: 300,
        height: 200,
        fit: "contain",
      })
    );
    expect(containNode.layout.width).toBe(300);
    expect(containNode.layout.height).toBe(200);

    // 测试 cover 模式
    const coverNode = canvas.render(
      Image({
        src: sourceCanvas.canvas,
        width: 300,
        height: 200,
        fit: "cover",
      })
    );
    expect(coverNode.layout.width).toBe(300);
    expect(coverNode.layout.height).toBe(200);
  });

  test("should render image with opacity", () => {
    const canvas = createCanvas({ width: 200, height: 200 });
    const sourceCanvas = createCanvas({ width: 100, height: 100 });
    const sourceCtx = sourceCanvas.getContext();
    sourceCtx.fillStyle = "#ff0000";
    sourceCtx.fillRect(0, 0, 100, 100);

    const node = canvas.render(
      Image({
        src: sourceCanvas.canvas,
        width: 100,
        height: 100,
        opacity: 0.5,
      })
    );
    expect(node.layout.width).toBe(100);
    expect(node.layout.height).toBe(100);
  });

  test("should render image with shadow", () => {
    const canvas = createCanvas({ width: 200, height: 200 });
    const sourceCanvas = createCanvas({ width: 100, height: 100 });
    const sourceCtx = sourceCanvas.getContext();
    sourceCtx.fillStyle = "#3498db";
    sourceCtx.fillRect(0, 0, 100, 100);

    const node = canvas.render(
      Image({
        src: sourceCanvas.canvas,
        width: 100,
        height: 100,
        shadow: { offsetY: 4, blur: 8, color: "rgba(0,0,0,0.3)" },
      })
    );
    expect(node.layout.width).toBe(100);
    expect(node.layout.height).toBe(100);
  });

  test("should render image with border radius", () => {
    const canvas = createCanvas({ width: 200, height: 200 });
    const sourceCanvas = createCanvas({ width: 100, height: 100 });
    const sourceCtx = sourceCanvas.getContext();
    sourceCtx.fillStyle = "#e74c3c";
    sourceCtx.fillRect(0, 0, 100, 100);

    const node = canvas.render(
      Image({
        src: sourceCanvas.canvas,
        width: 100,
        height: 100,
        border: { radius: 10 },
      })
    );
    expect(node.layout.width).toBe(100);
    expect(node.layout.height).toBe(100);
  });

  test("should render image with position", () => {
    const canvas = createCanvas({ width: 200, height: 200 });
    const sourceCanvas = createCanvas({ width: 50, height: 50 });
    const sourceCtx = sourceCanvas.getContext();
    sourceCtx.fillStyle = "#2ecc71";
    sourceCtx.fillRect(0, 0, 50, 50);

    const node = canvas.render(
      Image({
        src: sourceCanvas.canvas,
        width: 200,
        height: 200,
        fit: "contain",
        position: { x: "center", y: "center" },
      })
    );
    expect(node.layout.width).toBe(200);
    expect(node.layout.height).toBe(200);
  });

  test("should render image with border", () => {
    const canvas = createCanvas({ width: 200, height: 200 });
    const sourceCanvas = createCanvas({ width: 100, height: 100 });
    const sourceCtx = sourceCanvas.getContext();
    sourceCtx.fillStyle = "#9b59b6";
    sourceCtx.fillRect(0, 0, 100, 100);

    const node = canvas.render(
      Image({
        src: sourceCanvas.canvas,
        width: 100,
        height: 100,
        border: { width: 2, color: "#333" },
      })
    );
    expect(node.layout.width).toBe(100);
    expect(node.layout.height).toBe(100);
  });

  test("should render image as child of Box", () => {
    const canvas = createCanvas({ width: 300, height: 400 });
    const sourceCanvas = createCanvas({ width: 100, height: 100 });
    const sourceCtx = sourceCanvas.getContext();
    sourceCtx.fillStyle = "#f1c40f";
    sourceCtx.fillRect(0, 0, 100, 100);

    const node = canvas.render(
      Box({
        width: 300,
        background: "#f5f5f5",
        padding: 20,
        direction: "column",
        gap: 10,
        children: [
          Box({
            width: "fill",
            height: 100,
            background: "#3498db",
          }),
          Image({
            src: sourceCanvas.canvas,
            width: "fill",
            height: 150,
            fit: "contain",
          }),
        ],
      })
    );
    // 验证根节点布局（高度由子元素撑开：100 + 10 + 150 + 20*2 = 300）
    expect(node.layout.width).toBe(300);
    expect(node.layout.height).toBe(300);
    expect(node.children.length).toBe(2);

    // 验证第一个子节点（蓝色 Box）
    expect(node.children[0].layout.width).toBe(260); // 300 - 20*2 padding
    expect(node.children[0].layout.height).toBe(100);

    // 验证第二个子节点（Image）
    expect(node.children[1].layout.width).toBe(260); // 300 - 20*2 padding
    expect(node.children[1].layout.height).toBe(150);
  });

  test("should calculate image intrinsic size correctly", () => {
    const sourceCanvas = createCanvas({ width: 200, height: 100 });
    const image = Image({
      src: sourceCanvas.canvas,
    });

    // 测试没有指定宽高的情况，应该使用图片的自然尺寸
    expect(image.src).toBe(sourceCanvas.canvas);

    // 在布局计算中验证 - 使用align: "start"防止拉伸
    const canvas = createCanvas({ width: 400, height: 300 });
    const node = canvas.render(
      Box({
        width: 400,
        height: 300,
        direction: "column",
        align: "start", // 防止子元素拉伸
        children: [
          Image({
            src: sourceCanvas.canvas, // 200x100 的图片
          }),
        ],
      })
    );

    // 验证 Image 节点的布局尺寸应该与图片的自然尺寸一致
    expect(node.children[0].layout.width).toBe(200);
    expect(node.children[0].layout.height).toBe(100);
  });

  test("should respect explicit width and height for image", () => {
    const sourceCanvas = createCanvas({ width: 200, height: 100 });
    const canvas = createCanvas({ width: 400, height: 300 });
    const node = canvas.render(
      Box({
        width: 400,
        height: 300,
        direction: "column",
        children: [
          Image({
            src: sourceCanvas.canvas, // 200x100 的图片
            width: 150,
            height: 75,
          }),
        ],
      })
    );

    // 验证 Image 节点的布局尺寸应该与指定的尺寸一致
    expect(node.children[0].layout.width).toBe(150);
    expect(node.children[0].layout.height).toBe(75);
  });
});
