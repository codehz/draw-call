import { createCanvas } from "@/node";
import { describe, expect, test } from "bun:test";

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
