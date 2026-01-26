import { Box, Stack, Svg, svg, Text } from "@/index";
import { computeLayout, createCanvasMeasureContext } from "@/layout";
import { createCanvas } from "@/node";
import { describe, expect, test } from "bun:test";

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

  describe("Svg component", () => {
    test("should create svg element", () => {
      const svgEl = Svg({
        width: 100,
        height: 100,
        children: [svg.circle({ cx: 50, cy: 50, r: 40, fill: "#3498db" })],
      });
      expect(svgEl.type).toBe("svg");
      expect(svgEl.children.length).toBe(1);
      expect(svgEl.children[0].type).toBe("circle");
    });

    test("should create svg with viewBox", () => {
      const svgEl = Svg({
        width: 200,
        height: 200,
        viewBox: { width: 24, height: 24 },
        children: [svg.rect({ width: 24, height: 24, fill: "#e74c3c" })],
      });
      expect(svgEl.viewBox?.width).toBe(24);
      expect(svgEl.viewBox?.height).toBe(24);
    });

    test("should create rect child", () => {
      const rect = svg.rect({ x: 10, y: 10, width: 80, height: 60, fill: "#fff", rx: 5 });
      expect(rect.type).toBe("rect");
      expect(rect.x).toBe(10);
      expect(rect.width).toBe(80);
      expect(rect.rx).toBe(5);
    });

    test("should create circle child", () => {
      const circle = svg.circle({ cx: 50, cy: 50, r: 25, fill: "#00f" });
      expect(circle.type).toBe("circle");
      expect(circle.cx).toBe(50);
      expect(circle.r).toBe(25);
    });

    test("should create ellipse child", () => {
      const ellipse = svg.ellipse({ cx: 50, cy: 50, rx: 40, ry: 20, fill: "#0f0" });
      expect(ellipse.type).toBe("ellipse");
      expect(ellipse.rx).toBe(40);
      expect(ellipse.ry).toBe(20);
    });

    test("should create line child", () => {
      const line = svg.line({ x1: 0, y1: 0, x2: 100, y2: 100, stroke: { color: "#000", width: 2 } });
      expect(line.type).toBe("line");
      expect(line.x1).toBe(0);
      expect(line.x2).toBe(100);
    });

    test("should create polyline child", () => {
      const polyline = svg.polyline({
        points: [
          [0, 0],
          [50, 25],
          [100, 0],
        ],
        stroke: { color: "#f00", width: 2 },
      });
      expect(polyline.type).toBe("polyline");
      expect(polyline.points.length).toBe(3);
    });

    test("should create polygon child", () => {
      const polygon = svg.polygon({
        points: [
          [50, 0],
          [100, 100],
          [0, 100],
        ],
        fill: "#ff0",
      });
      expect(polygon.type).toBe("polygon");
      expect(polygon.points.length).toBe(3);
    });

    test("should create path child", () => {
      const path = svg.path({ d: "M10 10 L90 90", stroke: { color: "#000", width: 1 } });
      expect(path.type).toBe("path");
      expect(path.d).toBe("M10 10 L90 90");
    });

    test("should create text child", () => {
      const text = svg.text({ x: 50, y: 50, content: "Hello", fill: "#333" });
      expect(text.type).toBe("text");
      expect(text.content).toBe("Hello");
    });

    test("should create group child", () => {
      const group = svg.g({
        transform: { translate: [10, 10] },
        children: [
          svg.rect({ width: 50, height: 50, fill: "#f00" }),
          svg.circle({ cx: 25, cy: 25, r: 10, fill: "#fff" }),
        ],
      });
      expect(group.type).toBe("g");
      expect(group.children.length).toBe(2);
      expect(group.transform?.translate).toEqual([10, 10]);
    });

    test("should support transform properties", () => {
      const rect = svg.rect({
        width: 50,
        height: 50,
        fill: "#f00",
        transform: {
          translate: [10, 20],
          rotate: 45,
          scale: [2, 1],
        },
      });
      expect(rect.transform?.translate).toEqual([10, 20]);
      expect(rect.transform?.rotate).toBe(45);
      expect(rect.transform?.scale).toEqual([2, 1]);
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

    test("should render simple svg", () => {
      const canvas = createCanvas({ width: 100, height: 100 });
      canvas.render(
        Svg({
          width: 100,
          height: 100,
          children: [svg.circle({ cx: 50, cy: 50, r: 40, fill: "#3498db" })],
        })
      );
      expect(true).toBe(true);
    });

    test("should render svg with viewBox", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      canvas.render(
        Svg({
          width: 200,
          height: 200,
          viewBox: { width: 24, height: 24 },
          children: [
            svg.circle({ cx: 12, cy: 12, r: 10, fill: "#3498db" }),
            svg.path({
              d: "M6 12l4 4 8-8",
              stroke: { color: "#fff", width: 2 },
            }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should render svg with multiple shapes", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      canvas.render(
        Svg({
          width: 200,
          height: 200,
          background: "#f5f5f5",
          children: [
            svg.rect({ x: 10, y: 10, width: 80, height: 60, fill: "#e74c3c", rx: 5 }),
            svg.circle({ cx: 150, cy: 40, r: 30, fill: "#3498db" }),
            svg.ellipse({ cx: 100, cy: 150, rx: 60, ry: 30, fill: "#2ecc71" }),
            svg.line({ x1: 10, y1: 100, x2: 190, y2: 100, stroke: { color: "#333", width: 2 } }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should render svg with group and transforms", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      canvas.render(
        Svg({
          width: 200,
          height: 200,
          viewBox: { width: 100, height: 100 },
          children: [
            svg.g({
              transform: { translate: [50, 50], rotate: 45 },
              children: [
                svg.rect({ x: -20, y: -20, width: 40, height: 40, fill: "#e74c3c" }),
                svg.circle({ cx: 0, cy: 0, r: 10, fill: "#fff" }),
              ],
            }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should render svg with polygon and polyline", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      canvas.render(
        Svg({
          width: 200,
          height: 200,
          children: [
            svg.polygon({
              points: [
                [100, 10],
                [150, 80],
                [50, 80],
              ],
              fill: "#f1c40f",
              stroke: { color: "#e67e22", width: 2 },
            }),
            svg.polyline({
              points: [
                [20, 150],
                [60, 120],
                [100, 180],
                [140, 100],
                [180, 160],
              ],
              stroke: { color: "#9b59b6", width: 3 },
            }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should render svg with text", () => {
      const canvas = createCanvas({ width: 200, height: 100 });
      canvas.render(
        Svg({
          width: 200,
          height: 100,
          children: [
            svg.text({
              x: 100,
              y: 50,
              content: "Hello SVG",
              fill: "#333",
              font: { size: 20, weight: "bold" },
              textAnchor: "middle",
              dominantBaseline: "middle",
            }),
          ],
        })
      );
      expect(true).toBe(true);
    });

    test("should render svg with preserveAspectRatio", () => {
      const canvas = createCanvas({ width: 300, height: 150 });
      canvas.render(
        Svg({
          width: 300,
          height: 150,
          viewBox: { width: 100, height: 100 },
          preserveAspectRatio: { align: "xMinYMin", meetOrSlice: "meet" },
          children: [svg.rect({ width: 100, height: 100, fill: "#3498db" })],
        })
      );
      expect(true).toBe(true);
    });
  });
});
