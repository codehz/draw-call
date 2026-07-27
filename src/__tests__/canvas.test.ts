import { describe, expect, test } from "bun:test";

import { Box, createCanvas } from "@/index";

describe("createCanvas", () => {
  test("should create canvas with specified dimensions", () => {
    const canvas = createCanvas({ width: 800, height: 600 });
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
    expect(canvas.pixelRatio).toBe(1);
  });

  test("should support pixel ratio", () => {
    const canvas = createCanvas({
      width: 400,
      height: 300,
      pixelRatio: 2,
    });
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(300);
    expect(canvas.pixelRatio).toBe(2);
  });

  test("fitContent should expand canvas by root margin", () => {
    const canvas = createCanvas({
      width: 400,
      height: 300,
      fitContent: true,
    });

    const node = canvas.render(
      Box({
        width: 100,
        height: 50,
        margin: 10,
        background: "#fff",
      })
    );

    // 布局 border-box 为 100×50，原点因 margin 偏移
    expect(node.layout.width).toBe(100);
    expect(node.layout.height).toBe(50);
    expect(node.layout.x).toBe(10);
    expect(node.layout.y).toBe(10);

    // 画布逻辑尺寸 = layout + 根 margin 四边 = 120×70
    expect(canvas.canvas.width).toBe(120);
    expect(canvas.canvas.height).toBe(70);
  });

  test("fitContent without margin should match layout size", () => {
    const canvas = createCanvas({
      width: 400,
      height: 300,
      fitContent: true,
    });

    canvas.render(
      Box({
        width: 80,
        height: 40,
        background: "#fff",
      })
    );

    expect(canvas.canvas.width).toBe(80);
    expect(canvas.canvas.height).toBe(40);
  });

  test("without fitContent root margin does not expand canvas", () => {
    const canvas = createCanvas({
      width: 200,
      height: 100,
    });

    const node = canvas.render(
      Box({
        width: 50,
        height: 30,
        margin: 20,
        background: "#fff",
      })
    );

    expect(node.layout.x).toBe(20);
    expect(node.layout.y).toBe(20);
    // 固定画布尺寸不变
    expect(canvas.canvas.width).toBe(200);
    expect(canvas.canvas.height).toBe(100);
  });
});
