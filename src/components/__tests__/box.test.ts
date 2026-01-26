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

    test("should calculate correct height when parent has fixed width and auto height with wrap", () => {
      const canvas = createCanvas({ width: 200, height: 400 });
      const node = canvas.render(
        Box({
          width: 200, // 固定宽度
          // 自动高度
          direction: "row",
          wrap: true,
          children: [
            Box({ width: 80, height: 50, background: "#f00" }),
            Box({ width: 80, height: 50, background: "#0f0" }),
            Box({ width: 80, height: 50, background: "#00f" }),
            Box({ width: 80, height: 50, background: "#ff0" }),
          ],
        })
      );

      // 由于容器宽度为200，每个子元素宽度为80，间隙为0，所以每行最多容纳2个元素
      // 第一行：2个元素，高度50
      // 第二行：2个元素，高度50
      // 总高度应该是 50 + 50 = 100
      expect(node.layout.height).toBe(100);

      // 验证子元素位置
      // 第一行
      expect(node.children[0].layout.x).toBe(0);
      expect(node.children[0].layout.y).toBe(0);
      expect(node.children[1].layout.x).toBe(80);
      expect(node.children[1].layout.y).toBe(0);
      // 第二行
      expect(node.children[2].layout.x).toBe(0);
      expect(node.children[2].layout.y).toBe(50);
      expect(node.children[3].layout.x).toBe(80);
      expect(node.children[3].layout.y).toBe(50);
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

  describe("Flex wrap in nested layout", () => {
    test("should wrap tags based on allocated flex space, not full container width", () => {
      // 测试场景：顶层两列flex布局（1:2），右侧有可换行的标签
      // 标签数量刚好在flex分配的空间后触发换行
      // 如果错误地按全宽度计算，则不会换行

      const canvas = createCanvas({ width: 300, height: 200 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 200,
          direction: "row",
          gap: 0,
          children: [
            // 左侧：flex: 1，占宽度 100
            Box({
              width: "fill",
              flex: 1,
              height: 200,
              background: "#f0f0f0",
            }),
            // 右侧：flex: 2，占宽度 200，包含可换行的标签
            Box({
              width: "fill",
              flex: 2,
              height: 200,
              background: "#ffffff",
              direction: "row",
              gap: 6,
              wrap: true,
              children: [
                // 创建5个宽度40的标签，加上4个间隙(6px)
                // 总宽度 = 5*40 + 4*6 = 200 + 24 = 224
                // 分配给右侧的宽度是 300 * 2/3 = 200，所以应该换行
                // 如果错误地使用全宽 300，则总共可容纳 (300-24)/40 = 6.9，即6个标签，不会换行
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#f6ffed" }),
              ],
            }),
          ],
        })
      );

      // 右侧容器的实际分配宽度应该是 200
      const rightContainer = node.children[1];
      expect(rightContainer.layout.width).toBeCloseTo(200, 0);

      // 验证换行：第一行应该最多容纳4个标签（4*40 + 3*6 = 178）或5个标签（5*40 + 4*6 = 224，超出）
      // 实际应该只有4个标签在第一行（y=0），第5、6个在第二行（y=20）
      const child0Y = rightContainer.children[0].layout.y;
      const child1Y = rightContainer.children[1].layout.y;
      const child4Y = rightContainer.children[4].layout.y;
      const child5Y = rightContainer.children[5].layout.y;

      // 前4个标签应在第一行
      expect(child0Y).toBe(0);
      expect(child1Y).toBe(0);

      // 第5、6个标签应在第二行
      expect(child4Y).toBeGreaterThan(0);
      expect(child5Y).toBe(child4Y);
    });

    test("should auto-expand height when wrap causes multiple rows", () => {
      // 测试场景：自动高度的flex容器，内部有wrap标签
      // 容器高度应该自动撑开到足以容纳所有换行后的标签
      // 如果高度计算错误，可能会导致内容溢出

      const canvas = createCanvas({ width: 300, height: 500 });
      const node = canvas.render(
        Box({
          width: 300,
          // 自动高度，顶层容器有足够空间
          direction: "row",
          gap: 0,
          children: [
            // 左侧：flex: 1，固定高度 20
            Box({
              flex: 1,
              height: 20,
              background: "#f0f0f0",
            }),
            // 右侧：flex: 2，自动高度，包含会换行的标签
            Box({
              flex: 2,
              // 不指定高度，应该自动撑开
              background: "#ffffff",
              direction: "row",
              gap: 6,
              wrap: true,
              children: [
                // 6个40px宽的标签，总宽度 = 6*40 + 5*6 = 270
                // 右侧分配 300*2/3 = 200，所以必定换行
                // 应该分成多行：4个在第一行（4*40+3*6=178），2个在第二行（2*40+6=86）
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#e8f4ff" }),
                Box({ width: 40, height: 20, background: "#f6ffed" }),
              ],
            }),
          ],
        })
      );

      const rightContainer = node.children[1];

      // 右侧容器应该自动扩展到足以容纳两行（每行高20）加上行间隙
      // 预期高度应该是 20 + 6 (gap) + 20 = 46
      expect(rightContainer.layout.height).toBeCloseTo(46, 0);

      // 验证标签确实分成两行
      expect(rightContainer.children[0].layout.y).toBe(0);
      expect(rightContainer.children[4].layout.y).toBeGreaterThan(0);
    });

    test("should auto-expand height with simple wrap (no flex)", () => {
      // 更简单的情况：直接在根容器上使用 wrap
      const canvas = createCanvas({ width: 200, height: 500 });
      const node = canvas.render(
        Box({
          width: 200,
          // 自动高度
          direction: "row",
          gap: 10,
          wrap: true,
          children: [
            Box({ width: 60, height: 30, background: "#f00" }),
            Box({ width: 60, height: 30, background: "#0f0" }),
            Box({ width: 60, height: 30, background: "#00f" }),
            Box({ width: 60, height: 30, background: "#ff0" }),
          ],
        })
      );

      // 宽度 200，每个元素 60，gap 10
      // 第一行：60 + 10 + 60 + 10 + 60 = 200，刚好放下 3 个
      // 第四个元素换行到第二行
      // 高度 = 30 + 10 + 30 = 70
      expect(node.layout.height).toBe(70);

      // 验证换行位置
      expect(node.children[0].layout.y).toBe(0);
      expect(node.children[1].layout.y).toBe(0);
      expect(node.children[2].layout.y).toBe(0); // 第三个也在第一行
      expect(node.children[3].layout.y).toBe(40); // 30 + 10
    });

    test("should auto-expand height with wrap and padding", () => {
      const canvas = createCanvas({ width: 220, height: 500 });
      const node = canvas.render(
        Box({
          width: 220,
          // 自动高度
          padding: 10,
          direction: "row",
          gap: 10,
          wrap: true,
          children: [
            Box({ width: 60, height: 30, background: "#f00" }),
            Box({ width: 60, height: 30, background: "#0f0" }),
            Box({ width: 60, height: 30, background: "#00f" }),
            Box({ width: 60, height: 30, background: "#ff0" }),
          ],
        })
      );

      // 内容宽度 = 220 - 10 - 10 = 200
      // 每个元素 60+10=70，每行最多 2 个
      // 高度 = padding.top + 行高 + gap + 行高 + padding.bottom = 10 + 30 + 10 + 30 + 10 = 90
      expect(node.layout.height).toBe(90);

      // 验证子元素位置（应该相对于 contentX, contentY）
      expect(node.children[0].layout.x).toBe(10);
      expect(node.children[0].layout.y).toBe(10);
    });

    test("should auto-expand width with column wrap", () => {
      const canvas = createCanvas({ width: 500, height: 150 });
      const node = canvas.render(
        Box({
          // 自动宽度
          height: 150,
          direction: "column",
          gap: 10,
          wrap: true,
          children: [
            Box({ width: 40, height: 50, background: "#f00" }),
            Box({ width: 40, height: 50, background: "#0f0" }),
            Box({ width: 40, height: 50, background: "#00f" }),
            Box({ width: 40, height: 50, background: "#ff0" }),
          ],
        })
      );

      // 高度 150，每个元素 50+10=60，每列最多 2 个（110 < 150）
      // 4 个元素分成 2 列，宽度 = 40 + 10 + 40 = 90
      expect(node.layout.width).toBe(90);

      // 验证换列位置
      expect(node.children[0].layout.x).toBe(0);
      expect(node.children[1].layout.x).toBe(0);
      expect(node.children[2].layout.x).toBe(50); // 40 + 10
      expect(node.children[3].layout.x).toBe(50);
    });

    test("should handle single row that fits (no actual wrap needed)", () => {
      const canvas = createCanvas({ width: 300, height: 100 });
      const node = canvas.render(
        Box({
          width: 300,
          direction: "row",
          gap: 10,
          wrap: true,
          children: [
            Box({ width: 50, height: 30, background: "#f00" }),
            Box({ width: 50, height: 30, background: "#0f0" }),
            Box({ width: 50, height: 30, background: "#00f" }),
          ],
        })
      );

      // 总宽度 = 50*3 + 10*2 = 170 < 300，不需要换行
      // 高度应该是单行高度 = 30
      expect(node.layout.height).toBe(30);

      // 所有元素应该在同一行
      expect(node.children[0].layout.y).toBe(0);
      expect(node.children[1].layout.y).toBe(0);
      expect(node.children[2].layout.y).toBe(0);
    });

    test("should handle deeply nested flex + wrap", () => {
      const canvas = createCanvas({ width: 400, height: 500 });
      const node = canvas.render(
        Box({
          width: 400,
          direction: "row",
          children: [
            // 左侧 flex: 1 = 100
            Box({
              flex: 1,
              height: 50,
              background: "#ccc",
            }),
            // 中间 flex: 2 = 200，包含嵌套 wrap
            Box({
              flex: 2,
              direction: "column",
              gap: 5,
              children: [
                Box({ height: 20, background: "#eee" }),
                // 这个 wrap 容器在 200px 宽度内
                Box({
                  direction: "row",
                  gap: 5,
                  wrap: true,
                  children: [
                    Box({ width: 50, height: 25, background: "#f00" }),
                    Box({ width: 50, height: 25, background: "#0f0" }),
                    Box({ width: 50, height: 25, background: "#00f" }),
                    Box({ width: 50, height: 25, background: "#ff0" }),
                    Box({ width: 50, height: 25, background: "#f0f" }),
                  ],
                }),
              ],
            }),
            // 右侧 flex: 1 = 100
            Box({
              flex: 1,
              height: 50,
              background: "#ccc",
            }),
          ],
        })
      );

      // 中间容器的 wrap 部分应该正确计算高度
      // 200px 宽度，每个元素 50+5=55，每行最多 3 个（165 < 200）
      // 5 个元素分成 2 行，wrap 高度 = 25 + 5 + 25 = 55
      // 中间容器总高度 = 20 + 5 + 55 = 80
      const middleContainer = node.children[1];
      expect(middleContainer.layout.width).toBeCloseTo(200, 0);
      expect(middleContainer.layout.height).toBeCloseTo(80, 0);

      // wrap 容器
      const wrapContainer = middleContainer.children[1];
      expect(wrapContainer.layout.height).toBeCloseTo(55, 0);
    });
  });
});
