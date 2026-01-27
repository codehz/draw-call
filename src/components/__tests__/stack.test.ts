import { Box, createCanvas, Stack, Text } from "@/index";
import { computeLayout, createCanvasMeasureContext } from "@/layout";
import { describe, expect, test } from "bun:test";

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
