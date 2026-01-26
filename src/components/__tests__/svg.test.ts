import { Svg, svg } from "@/index";
import { describe, expect, test } from "bun:test";

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
