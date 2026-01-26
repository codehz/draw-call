import { describe, expect, test } from "bun:test";
import { Box, Stack, Text } from "./index";
import { computeLayout, createCanvasMeasureContext } from "./layout";
import { createCanvas } from "./node";

describe("draw-call", () => {
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
  });

  describe("Box component", () => {
    test("should create box element", () => {
      const box = Box({
        width: 100,
        height: 50,
        background: "#fff",
      });
      expect(box.type).toBe("box");
      expect(box.width).toBe(100);
      expect(box.height).toBe(50);
      expect(box.background).toBe("#fff");
    });

    test("should support children", () => {
      const box = Box({
        children: [Box({ width: 50, height: 50 }), Box({ width: 30, height: 30 })],
      });
      expect(box.children?.length).toBe(2);
    });
  });

  describe("Text component", () => {
    test("should create text element", () => {
      const text = Text({
        content: "Hello World",
        font: { size: 16, family: "Arial" },
        color: "#333",
      });
      expect(text.type).toBe("text");
      expect(text.content).toBe("Hello World");
      expect(text.font?.size).toBe(16);
    });
  });

  describe("Stack component", () => {
    test("should create stack element", () => {
      const stack = Stack({
        children: [Box({ width: 100, height: 100, background: "#f00" }), Text({ content: "Overlay" })],
      });
      expect(stack.type).toBe("stack");
      expect(stack.children.length).toBe(2);
    });
  });

  describe("Stack alignment", () => {
    test("should align children to center horizontally", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      const ctx = createCanvasMeasureContext(canvas.getContext());
      const tree = computeLayout(
        Stack({
          width: 200,
          height: 200,
          align: "center",
          children: [Box({ width: 100, height: 50 })],
        }),
        ctx,
        { minWidth: 200, maxWidth: 200, minHeight: 200, maxHeight: 200 }
      );
      // child should be centered horizontally: (200 - 100) / 2 = 50
      expect(tree.children[0].layout.x).toBe(50);
      expect(tree.children[0].layout.y).toBe(0);
    });

    test("should align children to center vertically", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      const ctx = createCanvasMeasureContext(canvas.getContext());
      const tree = computeLayout(
        Stack({
          width: 200,
          height: 200,
          justify: "center",
          children: [Box({ width: 100, height: 50 })],
        }),
        ctx,
        { minWidth: 200, maxWidth: 200, minHeight: 200, maxHeight: 200 }
      );
      // child should be centered vertically: (200 - 50) / 2 = 75
      expect(tree.children[0].layout.x).toBe(0);
      expect(tree.children[0].layout.y).toBe(75);
    });

    test("should align children to center both axes", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      const ctx = createCanvasMeasureContext(canvas.getContext());
      const tree = computeLayout(
        Stack({
          width: 200,
          height: 200,
          align: "center",
          justify: "center",
          children: [Box({ width: 100, height: 50 })],
        }),
        ctx,
        { minWidth: 200, maxWidth: 200, minHeight: 200, maxHeight: 200 }
      );
      expect(tree.children[0].layout.x).toBe(50);
      expect(tree.children[0].layout.y).toBe(75);
    });

    test("should align children to end", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      const ctx = createCanvasMeasureContext(canvas.getContext());
      const tree = computeLayout(
        Stack({
          width: 200,
          height: 200,
          align: "end",
          justify: "end",
          children: [Box({ width: 100, height: 50 })],
        }),
        ctx,
        { minWidth: 200, maxWidth: 200, minHeight: 200, maxHeight: 200 }
      );
      // child should be at end: 200 - 100 = 100, 200 - 50 = 150
      expect(tree.children[0].layout.x).toBe(100);
      expect(tree.children[0].layout.y).toBe(150);
    });

    test("should default to start alignment", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      const ctx = createCanvasMeasureContext(canvas.getContext());
      const tree = computeLayout(
        Stack({
          width: 200,
          height: 200,
          children: [Box({ width: 100, height: 50 })],
        }),
        ctx,
        { minWidth: 200, maxWidth: 200, minHeight: 200, maxHeight: 200 }
      );
      expect(tree.children[0].layout.x).toBe(0);
      expect(tree.children[0].layout.y).toBe(0);
    });
  });

  describe("render", () => {
    test("should render simple box", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      canvas.render(
        Box({
          width: 100,
          height: 100,
          background: "#ff0000",
        })
      );
      // 如果没有抛出错误，测试通过
      expect(true).toBe(true);
    });

    test("should render nested boxes", () => {
      const canvas = createCanvas({ width: 400, height: 300 });
      canvas.render(
        Box({
          width: "fill",
          height: "fill",
          background: "#f5f5f5",
          padding: 20,
          direction: "column",
          gap: 10,
          children: [
            Box({
              height: 50,
              background: "#4a90d9",
            }),
            Box({
              flex: 1,
              background: "#e8e8e8",
            }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should render text", () => {
      const canvas = createCanvas({ width: 300, height: 100 });
      canvas.render(
        Box({
          width: "fill",
          height: "fill",
          padding: 20,
          children: [
            Text({
              content: "Hello, draw-call!",
              font: { size: 24, weight: "bold" },
              color: "#333",
            }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should render card layout", () => {
      const canvas = createCanvas({ width: 400, height: 300 });
      canvas.render(
        Box({
          width: 360,
          background: "#ffffff",
          border: { radius: 12 },
          shadow: { offsetY: 4, blur: 12, color: "rgba(0,0,0,0.1)" },
          direction: "column",
          clip: true,
          children: [
            Box({
              height: 120,
              background: "#4a90d9",
            }),
            Box({
              padding: 16,
              direction: "column",
              gap: 8,
              children: [
                Text({
                  content: "Card Title",
                  font: { size: 18, weight: "bold" },
                  color: "#333",
                }),
                Text({
                  content: "This is a description text for the card component.",
                  font: { size: 14 },
                  color: "#666",
                  wrap: true,
                }),
              ],
            }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should support flex justify content", () => {
      const canvas = createCanvas({ width: 400, height: 100 });
      canvas.render(
        Box({
          width: "fill",
          height: "fill",
          direction: "row",
          justify: "space-between",
          padding: 10,
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
            Box({ width: 50, height: 50, background: "#00f" }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should support flex align items", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      canvas.render(
        Box({
          width: "fill",
          height: "fill",
          direction: "row",
          align: "center",
          gap: 10,
          padding: 10,
          children: [
            Box({ width: 50, height: 30, background: "#f00" }),
            Box({ width: 50, height: 60, background: "#0f0" }),
            Box({ width: 50, height: 40, background: "#00f" }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should output to buffer", () => {
      const canvas = createCanvas({ width: 100, height: 100 });
      canvas.render(
        Box({
          width: "fill",
          height: "fill",
          background: "#ff6b6b",
          border: { radius: 10 },
        })
      );
      const buffer = canvas.toBuffer("image/png");
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
