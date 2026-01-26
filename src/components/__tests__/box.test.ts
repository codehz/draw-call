import { Box } from "@/index";
import { createNodeCanvas } from "@/node";
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
      const canvas = createNodeCanvas({ width: 300, height: 100 });
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
      const canvas = createNodeCanvas({ width: 300, height: 100 });
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
      const canvas = createNodeCanvas({ width: 300, height: 100 });
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
      const canvas = createNodeCanvas({ width: 200, height: 100 });
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
      const canvas = createNodeCanvas({ width: 100, height: 300 });
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
      const canvas = createNodeCanvas({ width: 100, height: 300 });
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
      const canvas = createNodeCanvas({ width: 100, height: 300 });
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
      const canvas = createNodeCanvas({ width: 200, height: 200 });
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
      const canvas = createNodeCanvas({ width: 300, height: 100 });
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
      const canvas = createNodeCanvas({ width: 100, height: 300 });
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
      const canvas = createNodeCanvas({ width: 200, height: 200 });
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
      const canvas = createNodeCanvas({ width: 300, height: 300 });
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
      const canvas = createNodeCanvas({ width: 200, height: 200 });
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
      const canvas = createNodeCanvas({ width: 150, height: 200 });
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
      const canvas = createNodeCanvas({ width: 200, height: 150 });
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
      const canvas = createNodeCanvas({ width: 160, height: 200 });
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
      const canvas = createNodeCanvas({ width: 200, height: 400 });
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

  describe("Space-between justification", () => {
    test("should handle space-between in row with auto height", () => {
      const canvas = createNodeCanvas({ width: 300, height: 500 });
      const node = canvas.render(
        Box({
          width: 300,
          // 自动高度
          direction: "row",
          justify: "space-between",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
            Box({ width: 50, height: 50, background: "#00f" }),
          ],
        })
      );

      // 容器高度应该自适应为子元素高度
      expect(node.layout.height).toBe(50);

      // space-between：第一个在开始，最后一个在结束
      expect(node.children[0].layout.x).toBe(0);
      expect(node.children[2].layout.x).toBe(250); // 300 - 50

      // 中间元素应该在两者之间
      // 总宽度 300，子元素总宽 150 (50*3)，剩余空间 150
      // 2 个间隙，每个 75
      expect(node.children[1].layout.x).toBe(125); // 50 + 75
    });

    test("should handle space-between in column with auto width", () => {
      const canvas = createNodeCanvas({ width: 500, height: 300 });
      const node = canvas.render(
        Box({
          // 自动宽度
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

      // 容器宽度应该自适应为子元素宽度
      expect(node.layout.width).toBe(50);

      // space-between：第一个在开始，最后一个在结束
      expect(node.children[0].layout.y).toBe(0);
      expect(node.children[2].layout.y).toBe(250); // 300 - 50

      // 中间元素应该在两者之间
      // 总高度 300，子元素总高 150 (50*3)，剩余空间 150
      // 2 个间隙，每个 75
      expect(node.children[1].layout.y).toBe(125); // 50 + 75
    });

    test("should handle space-between with different sized children", () => {
      const canvas = createNodeCanvas({ width: 400, height: 200 });
      const node = canvas.render(
        Box({
          width: 400,
          height: 200,
          direction: "row",
          justify: "space-between",
          align: "center",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 80, height: 80, background: "#0f0" }),
            Box({ width: 60, height: 60, background: "#00f" }),
          ],
        })
      );

      // 第一个子元素在开始
      expect(node.children[0].layout.x).toBe(0);

      // 最后一个子元素在结束
      expect(node.children[2].layout.x).toBe(340); // 400 - 60

      // 总宽度 400，子元素总宽 190 (50+80+60)，剩余空间 210
      // 2 个间隙，每个 105
      expect(node.children[1].layout.x).toBe(155); // 50 + 105
    });

    test("should handle space-between with padding", () => {
      const canvas = createNodeCanvas({ width: 300, height: 200 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 200,
          padding: 20,
          direction: "row",
          justify: "space-between",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
            Box({ width: 50, height: 50, background: "#00f" }),
          ],
        })
      );

      // 内容宽度 = 300 - 20 - 20 = 260
      // 子元素总宽 150，剩余空间 110
      // 2 个间隙，每个 55

      // 第一个在 contentX
      expect(node.children[0].layout.x).toBe(20);

      // 第二个在 20 + 50 + 55
      expect(node.children[1].layout.x).toBe(125);

      // 第三个在 20 + 260 - 50
      expect(node.children[2].layout.x).toBe(230);
    });

    test("should handle space-between in column like demo.ts", () => {
      // 模拟 demo.ts 中的场景：左侧列使用 space-between 在顶部和底部分布内容
      const canvas = createNodeCanvas({ width: 300, height: 400 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 400,
          padding: 20,
          direction: "column",
          justify: "space-between",
          align: "start",
          children: [
            // 标题部分
            Box({
              direction: "column",
              gap: 8,
              children: [
                Box({ width: 150, height: 30, background: "#667eea" }), // 标题
                Box({ width: 120, height: 20, background: "#764ba2" }), // 副标题
              ],
            }),
            // 功能列表
            Box({
              direction: "column",
              gap: 12,
              children: [
                Box({ width: 100, height: 15, background: "#ffd700" }),
                Box({ width: 100, height: 15, background: "#ffd700" }),
                Box({ width: 100, height: 15, background: "#ffd700" }),
              ],
            }),
          ],
        })
      );

      // 内容高度 = 400 - 20 - 20 = 360
      // 第一个子元素应该在顶部
      expect(node.children[0].layout.y).toBe(20);

      // 计算子元素高度
      const firstChildHeight = node.children[0].layout.height;
      const secondChildHeight = node.children[1].layout.height;

      // 第二个子元素应该在底部
      expect(node.children[1].layout.y).toBe(380 - secondChildHeight);

      // 验证间距正确分布
      const spacing = node.children[1].layout.y - (node.children[0].layout.y + firstChildHeight);
      expect(spacing).toBeGreaterThan(0);
    });

    test("should handle space-between with only one child", () => {
      // space-between 只有一个子元素时，应该在开始位置
      const canvas = createNodeCanvas({ width: 300, height: 200 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 200,
          direction: "row",
          justify: "space-between",
          children: [Box({ width: 50, height: 50, background: "#f00" })],
        })
      );

      // 唯一的子元素应该在开始位置
      expect(node.children[0].layout.x).toBe(0);
    });

    test("should handle space-between with two children", () => {
      const canvas = createNodeCanvas({ width: 300, height: 200 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 200,
          direction: "row",
          justify: "space-between",
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
          ],
        })
      );

      // 第一个在开始
      expect(node.children[0].layout.x).toBe(0);

      // 第二个在结束
      expect(node.children[1].layout.x).toBe(250); // 300 - 50
    });

    test("should handle space-between with gap", () => {
      // gap 应该被包含在 space-between 的计算中
      const canvas = createNodeCanvas({ width: 300, height: 200 });
      const node = canvas.render(
        Box({
          width: 300,
          height: 200,
          direction: "row",
          justify: "space-between",
          gap: 10,
          children: [
            Box({ width: 50, height: 50, background: "#f00" }),
            Box({ width: 50, height: 50, background: "#0f0" }),
            Box({ width: 50, height: 50, background: "#00f" }),
          ],
        })
      );

      // 子元素总宽 150，gap 总数 20，总占用 170
      // 剩余空间 130，分成 2 个间隙，每个 65
      // 实际间隙 = gap + 分配的空间 = 10 + 65 = 75

      expect(node.children[0].layout.x).toBe(0);
      expect(node.children[1].layout.x).toBe(125); // 50 + 75
      expect(node.children[2].layout.x).toBe(250); // 50 + 75 + 50 + 75
    });

    test("should handle space-between in flex child with stretched height (demo.ts scenario)", () => {
      // 这是 demo.ts 的真实场景：
      // 父容器横向布局，子元素使用 flex 分配宽度
      // 左侧 flex 子元素没有指定高度，应该被 stretch 到父容器高度
      // 然后在拉伸后的高度内，使用 space-between 分布内容
      const canvas = createNodeCanvas({ width: 720, height: 600 });
      const node = canvas.render(
        Box({
          width: 720,
          height: 600,
          direction: "row",
          children: [
            // 左侧：flex: 1，应该被拉伸到父容器高度 600
            Box({
              flex: 1,
              // 没有指定高度，应该 stretch
              padding: 20,
              direction: "column",
              justify: "space-between",
              align: "start",
              background: "#667eea",
              children: [
                // 顶部内容
                Box({
                  direction: "column",
                  gap: 8,
                  children: [
                    Box({ width: 100, height: 30, background: "#fff" }), // 标题
                    Box({ width: 80, height: 20, background: "#fff" }), // 副标题
                  ],
                }),
                // 底部内容
                Box({
                  direction: "column",
                  gap: 12,
                  children: [
                    Box({ width: 120, height: 15, background: "#ffd700" }),
                    Box({ width: 120, height: 15, background: "#ffd700" }),
                    Box({ width: 120, height: 15, background: "#ffd700" }),
                  ],
                }),
              ],
            }),
            // 右侧：flex: 2
            Box({
              flex: 2,
              background: "#f5f7fa",
            }),
          ],
        })
      );

      // 验证左侧容器尺寸：width = 720 * 1/3 = 240, height 应该被拉伸到 600
      const leftBox = node.children[0];
      expect(leftBox.layout.width).toBeCloseTo(240, 0);
      expect(leftBox.layout.height).toBe(600);

      // 内容区域高度 = 600 - 20 - 20 = 560
      expect(leftBox.layout.contentHeight).toBe(560);

      // 验证内部两个子元素
      expect(leftBox.children.length).toBe(2);

      // 第一个子元素（标题区）应该在顶部
      const topBox = leftBox.children[0];
      expect(topBox.layout.y).toBe(20); // padding.top

      // 计算标题区高度：30 + 8 + 20 = 58
      expect(topBox.layout.height).toBe(58);

      // 第二个子元素（功能列表）应该在底部
      const bottomBox = leftBox.children[1];
      // 功能列表高度：15 + 12 + 15 + 12 + 15 = 69
      expect(bottomBox.layout.height).toBe(69);

      // 底部元素的 y 坐标应该是：contentY + contentHeight - bottomBox.height
      // = 20 + 560 - 69 = 511
      expect(bottomBox.layout.y).toBe(511);

      // 验证两个元素之间有间距（space-between 效果）
      const spacing = bottomBox.layout.y - (topBox.layout.y + topBox.layout.height);
      expect(spacing).toBeGreaterThan(400); // 应该有大量空白空间
    });
  });

  describe("Combined layout properties", () => {
    test("should handle padding + gap + column direction", () => {
      const canvas = createNodeCanvas({ width: 200, height: 300 });
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
      const canvas = createNodeCanvas({ width: 200, height: 200 });
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

      const canvas = createNodeCanvas({ width: 300, height: 200 });
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

      const canvas = createNodeCanvas({ width: 300, height: 500 });
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
      const canvas = createNodeCanvas({ width: 200, height: 500 });
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
      const canvas = createNodeCanvas({ width: 220, height: 500 });
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
      const canvas = createNodeCanvas({ width: 500, height: 150 });
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
      const canvas = createNodeCanvas({ width: 300, height: 100 });
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
      const canvas = createNodeCanvas({ width: 400, height: 500 });
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
