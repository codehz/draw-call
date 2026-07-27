import { describe, expect, test } from "bun:test";

import { Box, createCanvas, Transform } from "@/index";

function samplePixel(canvas: ReturnType<typeof createCanvas>, x: number, y: number): [number, number, number, number] {
  const ctx = canvas.getContext();
  const data = ctx.getImageData(x, y, 1, 1).data;
  return [data[0], data[1], data[2], data[3]];
}

describe("Transform component", () => {
  test("should create transform element", () => {
    const transform = Transform({
      transform: { rotate: 45 },
      children: Box({ width: 40, height: 40, background: "#f00" }),
    });
    expect(transform.type).toBe("transform");
    expect(transform.transform).toEqual({ rotate: 45 });
    expect(transform.children.type).toBe("box");
  });
});

describe("Transform layout contract", () => {
  test("should keep Transform wrapper node in layout tree", () => {
    const canvas = createCanvas({ width: 120, height: 120 });
    const node = canvas.render(
      Box({
        width: 120,
        height: 120,
        children: [
          Transform({
            transform: { translate: [10, 0] },
            children: Box({ width: 40, height: 40, background: "#ff0000" }),
          }),
        ],
      })
    );

    expect(node.children).toHaveLength(1);
    expect(node.children[0].element.type).toBe("transform");
    expect(node.children[0].children).toHaveLength(1);
    expect(node.children[0].children[0].element.type).toBe("box");
    expect(node.children[0].layout.width).toBe(40);
    expect(node.children[0].layout.height).toBe(40);
    expect(node.children[0].children[0].layout.width).toBe(40);
    expect(node.children[0].children[0].layout.height).toBe(40);
  });

  test("should pass through child margin and size for parent layout", () => {
    const canvas = createCanvas({ width: 300, height: 100 });
    const node = canvas.render(
      Box({
        width: 300,
        height: 100,
        direction: "row",
        children: [
          Transform({
            transform: { rotate: 15 },
            children: Box({ width: 40, height: 40, margin: 10, background: "#0f0" }),
          }),
          Box({ width: 40, height: 40, background: "#00f" }),
        ],
      })
    );

    // Transform 不参与视觉包围盒，但子 margin/size 对父布局透明
    expect(node.children[0].element.type).toBe("transform");
    expect(node.children[0].layout.x).toBe(10);
    expect(node.children[0].layout.y).toBe(10);
    expect(node.children[1].layout.x).toBe(60);
  });

  test("should apply translate when rendering", () => {
    const canvas = createCanvas({ width: 100, height: 100 });
    canvas.render(
      Box({
        width: 100,
        height: 100,
        children: [
          Transform({
            transform: { translate: [30, 20] },
            children: Box({ width: 20, height: 20, background: "#ff0000" }),
          }),
        ],
      })
    );

    const origin = samplePixel(canvas, 5, 5);
    const moved = samplePixel(canvas, 35, 25);
    expect(origin[0]).toBeLessThan(20);
    expect(moved[0]).toBeGreaterThan(200);
    expect(moved[1]).toBeLessThan(20);
    expect(moved[2]).toBeLessThan(20);
  });

  test("should apply rotate around transformOrigin", () => {
    const canvas = createCanvas({ width: 100, height: 100 });
    canvas.render(
      Box({
        width: 100,
        height: 100,
        children: [
          Transform({
            transform: { rotate: 90 },
            transformOrigin: ["50%", "50%"],
            children: Box({ width: 40, height: 10, background: "#00ff00" }),
          }),
        ],
      })
    );

    // 水平条绕中心旋转 90° 后应出现在竖向中心附近
    const vertical = samplePixel(canvas, 20, 20);
    expect(vertical[1]).toBeGreaterThan(150);
  });

  test("should restore canvas state after transform", () => {
    const canvas = createCanvas({ width: 120, height: 80 });
    canvas.render(
      Box({
        width: 120,
        height: 80,
        direction: "row",
        children: [
          Transform({
            transform: { rotate: 30, translate: [5, 5] },
            children: Box({ width: 30, height: 30, background: "#ff0000" }),
          }),
          Box({ width: 30, height: 30, background: "#0000ff" }),
        ],
      })
    );

    const second = samplePixel(canvas, 45, 10);
    expect(second[2]).toBeGreaterThan(200);
    expect(second[0]).toBeLessThan(20);
  });

  test("should support nested transforms", () => {
    const canvas = createCanvas({ width: 100, height: 100 });
    const node = canvas.render(
      Box({
        width: 100,
        height: 100,
        children: [
          Transform({
            transform: { translate: [10, 10] },
            children: Transform({
              transform: { scale: 1 },
              children: Box({ width: 20, height: 20, background: "#ff00ff" }),
            }),
          }),
        ],
      })
    );

    expect(node.children[0].element.type).toBe("transform");
    expect(node.children[0].children[0].element.type).toBe("transform");
    expect(node.children[0].children[0].children[0].element.type).toBe("box");
  });
});
