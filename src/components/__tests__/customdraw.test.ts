import { describe, expect, test } from "bun:test";

import { Box, createCanvas, CustomDraw } from "@/index";

describe("CustomDraw component", () => {
  test("should expose native canvas through ctx.canvas", () => {
    let called = false;

    const canvas = createCanvas({ width: 80, height: 80 });
    canvas.render(
      CustomDraw({
        width: 40,
        height: 40,
        draw(ctx) {
          called = true;
          ctx.canvas.fillStyle = "#ff0000";
          ctx.canvas.fillRect(0, 0, 40, 40);
        },
      })
    );

    expect(called).toBe(true);
  });

  test("should render children through inner", () => {
    const canvas = createCanvas({ width: 120, height: 120 });
    const layout = canvas.render(
      CustomDraw({
        width: 100,
        height: 100,
        draw(ctx, { inner }) {
          ctx.canvas.fillStyle = "#eeeeee";
          ctx.canvas.fillRect(0, 0, 100, 100);
          inner?.();
        },
        children: Box({
          width: 20,
          height: 30,
          background: "#ff0000",
        }),
      })
    );

    expect(layout.children).toHaveLength(1);
    expect(layout.children[0].layout.width).toBe(20);
    expect(layout.children[0].layout.height).toBe(30);
  });

  test("should track relative transforms and restore them", () => {
    const transforms: Array<[number, number, number, number, number, number]> = [];

    const canvas = createCanvas({ width: 120, height: 120 });
    canvas.render(
      CustomDraw({
        width: 100,
        height: 100,
        draw(ctx) {
          ctx.translate(10, 15);
          let current = ctx.getTransform();
          transforms.push([current.a, current.b, current.c, current.d, current.e, current.f]);

          ctx.save();
          ctx.rotate(Math.PI / 2);
          current = ctx.getTransform();
          transforms.push([current.a, current.b, current.c, current.d, current.e, current.f]);

          ctx.restore();
          current = ctx.getTransform();
          transforms.push([current.a, current.b, current.c, current.d, current.e, current.f]);
        },
      })
    );

    expect(transforms[0]).toEqual([1, 0, 0, 1, 10, 15]);
    expect(transforms[1][0]).toBeCloseTo(0, 6);
    expect(transforms[1][1]).toBeCloseTo(1, 6);
    expect(transforms[1][2]).toBeCloseTo(-1, 6);
    expect(transforms[1][3]).toBeCloseTo(0, 6);
    expect(transforms[1][4]).toBeCloseTo(10, 6);
    expect(transforms[1][5]).toBeCloseTo(15, 6);
    expect(transforms[2]).toEqual([1, 0, 0, 1, 10, 15]);
  });

  test("should restore native canvas state after unbalanced save", () => {
    const canvas = createCanvas({ width: 120, height: 120 });
    const ctx = canvas.getContext();

    canvas.render(
      Box({
        width: 120,
        height: 120,
        children: [
          CustomDraw({
            width: 60,
            height: 60,
            draw(customCtx) {
              customCtx.save();
              customCtx.translate(25, 10);
              customCtx.canvas.globalAlpha = 0.25;
            },
          }),
        ],
      })
    );

    const transform = ctx.getTransform();
    expect(transform.a).toBe(1);
    expect(transform.b).toBe(0);
    expect(transform.c).toBe(0);
    expect(transform.d).toBe(1);
    expect(transform.e).toBe(0);
    expect(transform.f).toBe(0);
    expect(ctx.globalAlpha).toBe(1);
  });
});
