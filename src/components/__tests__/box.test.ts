import { Box } from "@/index";
import { createCanvas } from "@/node";
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

  describe("Horizontal layout (direction: row)", () => {
    test("should layout children in row direction", () => {
      const canvas = createCanvas({ width: 300, height: 100 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 100,
          direction: "row",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 80, height: 50, background: "#0f0" }),
            Box({ width: 60, height: 50, background: "#00f" }),
          ],
        })
      );

      // 第一个子元素应该在左边
      expect(node.children[0].layout.x).toBe(0);
      // 第二个子元素应该在第一个右边
      expect(node.children[1].layout.x).toBe(50);
      // 第三个子元素应该在第二个右边
      expect(node.children[2].layout.x).toBe(130);
    });

    test("should respect justify-content space-between in row", () => {
      const canvas = createCanvas({ width: 300, height: 100 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 100,
          direction: "row",
          justify: "space-between",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
            Box({ width: 50, height: 50, background: "#00f" }),
          ],
        })
      );

      // 第一个在左边
      expect(node.children[0].layout.x).toBe(0);
      // 第二个在中间
      expect(node.children[1].layout.x).toBeCloseTo(125, 0);
      // 第三个在右边
      expect(node.children[2].layout.x).toBe(250);
    });

    test("should respect justify-content center in row", () => {
      const canvas = createCanvas({ width: 300, height: 100 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 100,
          direction: "row",
          justify: "center",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
          ],
        })
      );

      // 中心居中，总宽度 100，容器宽度 300，剩余 200，所以起始位置应该是 100
      expect(node.children[0].layout.x).toBe(100);
      expect(node.children[1].layout.x).toBe(150);
    });

    test("should stretch children in row direction", () => {
      const canvas = createCanvas({ width: 200, height: 100 });
      const node = canvas.render(
        Box({
          width: 200,
          height: 100,
          direction: "row",
          align: "stretch",
          children: [Box({ width: 50, background: "#f00" }), Box({ width: 80, background: "#0f0" })],
        })
      );

      // 高度应该填充容器
      expect(node.children[0].layout.height).toBe(100);
      expect(node.children[1].layout.height).toBe(100);
    });
  });

  describe("Vertical layout (direction: column)", () => {
    test("should layout children in column direction", () => {
      const canvas = createCanvas({ width: 100, height: 300 });
      const node = canvas.render(
        Box({
          width: 100,
          height: 300,
          direction: "column",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 80, background: "#0f0" }),
            Box({ width: 50, height: 60, background: "#00f" }),
          ],
        })
      );

      // 第一个子元素应该在顶部
      expect(node.children[0].layout.y).toBe(0);
      // 第二个子元素应该在第一个下方
      expect(node.children[1].layout.y).toBe(50);
      // 第三个子元素应该在第二个下方
      expect(node.children[2].layout.y).toBe(130);
    });

    test("should respect justify-content space-between in column", () => {
      const canvas = createCanvas({ width: 100, height: 300 });
      const node = canvas.render(
        Box({
          width: 100,
          height: 300,
          direction: "column",
          justify: "space-between",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
            Box({ width: 50, height: 50, background: "#00f" }),
          ],
        })
      );

      // 第一个在顶部
      expect(node.children[0].layout.y).toBe(0);
      // 第二个在中间
      expect(node.children[1].layout.y).toBeCloseTo(125, 0);
      // 第三个在底部
      expect(node.children[2].layout.y).toBe(250);
    });

    test("should respect justify-content center in column", () => {
      const canvas = createCanvas({ width: 100, height: 300 });
      const node = canvas.render(
        Box({
          width: 100,
          height: 300,
          direction: "column",
          justify: "center",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
          ],
        })
      );

      // 中心居中，总高度 100，容器高度 300，剩余 200，所以起始位置应该是 100
      expect(node.children[0].layout.y).toBe(100);
      expect(node.children[1].layout.y).toBe(150);
    });

    test("should stretch children in column direction", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      const node = canvas.render(
        Box({
          width: 200,
          height: 200,
          direction: "column",
          align: "stretch",
          children: [Box({ height: 50, background: "#f00" }), Box({ height: 80, background: "#0f0" })],
        })
      );

      // 宽度应该填充容器
      expect(node.children[0].layout.width).toBe(200);
      expect(node.children[1].layout.width).toBe(200);
    });
  });

  describe("Gap", () => {
    test("should apply gap in row direction", () => {
      const canvas = createCanvas({ width: 300, height: 100 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 100,
          direction: "row",
          gap: 10,
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
            Box({ width: 50, height: 50, background: "#00f" }),
          ],
        })
      );

      // 第一个在位置 0
      expect(node.children[0].layout.x).toBe(0);
      // 第二个应该在 50 + 10 = 60
      expect(node.children[1].layout.x).toBe(60);
      // 第三个应该在 60 + 50 + 10 = 120
      expect(node.children[2].layout.x).toBe(120);
    });

    test("should apply gap in column direction", () => {
      const canvas = createCanvas({ width: 100, height: 300 });
      const node = canvas.render(
        Box({
          width: 100,
          height: 300,
          direction: "column",
          gap: 15,
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
            Box({ width: 50, height: 50, background: "#00f" }),
          ],
        })
      );

      // 第一个在位置 0
      expect(node.children[0].layout.y).toBe(0);
      // 第二个应该在 50 + 15 = 65
      expect(node.children[1].layout.y).toBe(65);
      // 第三个应该在 65 + 50 + 15 = 130
      expect(node.children[2].layout.y).toBe(130);
    });
  });

  describe("Padding", () => {
    test("should apply uniform padding", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      const node = canvas.render(
        Box({
          width: 200,
          height: 200,
          padding: 20,
          background: "#f0f0f0",
          children: [Box({ width: 100, height: 100, background: "#f00" })],
        })
      );

      // 内容区域应该从 (20, 20) 开始
      expect(node.layout.contentX).toBe(20);
      expect(node.layout.contentY).toBe(20);
      // 内容宽度应该是 200 - 20 - 20 = 160
      expect(node.layout.contentWidth).toBe(160);
      expect(node.layout.contentHeight).toBe(160);

      // 子元素应该从 (20, 20) 开始
      expect(node.children[0].layout.x).toBe(20);
      expect(node.children[0].layout.y).toBe(20);
    });

    test("should apply individual padding", () => {
      const canvas = createCanvas({ width: 300, height: 300 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 300,
          padding: { top: 10, right: 20, bottom: 30, left: 40 },
          background: "#f0f0f0",
          children: [Box({ width: 100, height: 100, background: "#f00" })],
        })
      );

      // 内容起始位置
      expect(node.layout.contentX).toBe(40);
      expect(node.layout.contentY).toBe(10);
      // 内容宽度 = 300 - 40 - 20 = 240
      expect(node.layout.contentWidth).toBe(240);
      // 内容高度 = 300 - 10 - 30 = 260
      expect(node.layout.contentHeight).toBe(260);

      // 子元素位置
      expect(node.children[0].layout.x).toBe(40);
      expect(node.children[0].layout.y).toBe(10);
    });

    test("should apply padding with flex children", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      const node = canvas.render(
        Box({
          width: 200,
          height: 200,
          padding: 10,
          direction: "row",
          gap: 5,
          background: "#f0f0f0",
          children: [Box({ flex: 1, background: "#f00" }), Box({ flex: 1, background: "#0f0" })],
        })
      );

      // 两个 flex 子元素应该均匀分布在内容区域
      // 内容宽度 = 200 - 10 - 10 = 180
      // 总 flex = 2，间隙 = 5，所以每个的宽度 = (180 - 5) / 2 = 87.5
      expect(node.children[0].layout.width).toBeCloseTo(87.5, 1);
      expect(node.children[1].layout.width).toBeCloseTo(87.5, 1);
    });
  });

  describe("Wrap", () => {
    test("should wrap children in row direction", () => {
      const canvas = createCanvas({ width: 150, height: 200 });
      const node = canvas.render(
        Box({
          width: 150,
          height: 200,
          direction: "row",
          wrap: true,
          children: [
            Box({ width: 60, height: 50, background: "#f00" }),
            Box({ width: 60, height: 50, background: "#0f0" }),
            Box({ width: 60, height: 50, background: "#00f" }),
          ],
        })
      );

      // 第一个和第二个在第一行，第三个在第二行
      expect(node.children[0].layout.y).toBe(0);
      expect(node.children[1].layout.y).toBe(0);
      expect(node.children[2].layout.y).toBe(50);

      // x 坐标
      expect(node.children[0].layout.x).toBe(0);
      expect(node.children[1].layout.x).toBe(60);
      expect(node.children[2].layout.x).toBe(0);
    });

    test("should wrap children in column direction", () => {
      const canvas = createCanvas({ width: 200, height: 150 });
      const node = canvas.render(
        Box({
          width: 200,
          height: 150,
          direction: "column",
          wrap: true,
          children: [
            Box({ width: 50, height: 60, background: "#f00" }),
            Box({ width: 50, height: 60, background: "#0f0" }),
            Box({ width: 50, height: 60, background: "#00f" }),
          ],
        })
      );

      // 第一个和第二个在第一列，第三个在第二列
      expect(node.children[0].layout.x).toBe(0);
      expect(node.children[1].layout.x).toBe(0);
      expect(node.children[2].layout.x).toBe(50);

      // y 坐标
      expect(node.children[0].layout.y).toBe(0);
      expect(node.children[1].layout.y).toBe(60);
      expect(node.children[2].layout.y).toBe(0);
    });

    test("should wrap with gap", () => {
      const canvas = createCanvas({ width: 160, height: 200 });
      const node = canvas.render(
        Box({
          width: 160,
          height: 200,
          direction: "row",
          wrap: true,
          gap: 10,
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
            Box({ width: 50, height: 50, background: "#00f" }),
          ],
        })
      );

      // 第一行：0, 60 (50+10)
      // 第二行：120 (50+10+50+10) 不符合，所以第三个应该换行到第二行
      expect(node.children[0].layout.y).toBe(0);
      expect(node.children[1].layout.y).toBe(0);
      expect(node.children[2].layout.y).toBe(60);
    });
  });

  describe("Combined layout properties", () => {
    test("should handle padding + gap + column direction", () => {
      const canvas = createCanvas({ width: 200, height: 300 });
      const node = canvas.render(
        Box({
          width: 200,
          height: 300,
          padding: 20,
          direction: "column",
          gap: 10,
          children: [
            Box({ width: 100, height: 50, background: "#f00" }),
            Box({ width: 100, height: 50, background: "#0f0" }),
          ],
        })
      );

      // 第一个子元素应该在 (20, 20)
      expect(node.children[0].layout.x).toBe(20);
      expect(node.children[0].layout.y).toBe(20);

      // 第二个子元素应该在 (20, 20+50+10)
      expect(node.children[1].layout.x).toBe(20);
      expect(node.children[1].layout.y).toBe(80);
    });

    test("should handle flex with padding and gap", () => {
      const canvas = createCanvas({ width: 200, height: 200 });
      const node = canvas.render(
        Box({
          width: 200,
          height: 200,
          padding: 10,
          direction: "row",
          gap: 10,
          children: [
            Box({ flex: 1, background: "#f00" }),
            Box({ flex: 1, background: "#0f0" }),
            Box({ flex: 1, background: "#00f" }),
          ],
        })
      );

      // 内容宽度 = 200 - 10 - 10 = 180
      // gap 总数 = 10 + 10 = 20
      // 每个 flex 子 = (180 - 20) / 3 = 53.33
      const expectedWidth = (180 - 20) / 3;
      expect(node.children[0].layout.width).toBeCloseTo(expectedWidth, 1);
      expect(node.children[1].layout.width).toBeCloseTo(expectedWidth, 1);
      expect(node.children[2].layout.width).toBeCloseTo(expectedWidth, 1);

      // x 坐标：10, 10+53.33+10, 10+53.33+10+53.33+10
      expect(node.children[0].layout.x).toBe(10);
      expect(node.children[1].layout.x).toBeCloseTo(10 + expectedWidth + 10, 1);
      expect(node.children[2].layout.x).toBeCloseTo(10 + 2 * (expectedWidth + 10), 1);
    });
  });
});
