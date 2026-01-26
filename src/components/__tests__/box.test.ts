import { Box } from "@/index";
import { describe, expect, test } from "bun:test";

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
