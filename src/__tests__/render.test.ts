import { Box, Svg, svg, Text } from "@/index";
import { createCanvas } from "@/node";
import { describe, expect, test } from "bun:test";

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
