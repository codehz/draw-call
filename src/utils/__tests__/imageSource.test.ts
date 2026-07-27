import { describe, expect, test } from "bun:test";

import { createCanvas } from "@/index";
import { getImageNaturalSize, resolveCropRect } from "@/utils/imageSource";

describe("imageSource utils", () => {
  test("getImageNaturalSize reads canvas size", () => {
    const canvas = createCanvas({ width: 120, height: 80 });
    expect(getImageNaturalSize(canvas.canvas)).toEqual({ width: 120, height: 80 });
  });

  test("resolveCropRect returns rect inside bounds", () => {
    expect(resolveCropRect({ x: 10, y: 20, width: 30, height: 40 }, 100, 100)).toEqual({
      sx: 10,
      sy: 20,
      sw: 30,
      sh: 40,
    });
  });

  test("resolveCropRect clamps negative origin and excess size", () => {
    expect(resolveCropRect({ x: -10, y: -5, width: 50, height: 40 }, 100, 100)).toEqual({
      sx: 0,
      sy: 0,
      sw: 40,
      sh: 35,
    });
  });

  test("resolveCropRect clamps width to image right edge", () => {
    expect(resolveCropRect({ x: 80, y: 0, width: 50, height: 10 }, 100, 100)).toEqual({
      sx: 80,
      sy: 0,
      sw: 20,
      sh: 10,
    });
  });

  test("resolveCropRect returns null for empty or out-of-range crop", () => {
    expect(resolveCropRect({ x: 100, y: 0, width: 10, height: 10 }, 100, 100)).toBeNull();
    expect(resolveCropRect({ x: 0, y: 0, width: 0, height: 10 }, 100, 100)).toBeNull();
    expect(resolveCropRect({ x: 0, y: 0, width: 10, height: -5 }, 100, 100)).toBeNull();
    expect(resolveCropRect({ x: 0, y: 0, width: 10, height: 10 }, 0, 0)).toBeNull();
  });
});
