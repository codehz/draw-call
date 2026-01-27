import { Box, createCanvas } from "@/index";

// 创建 Canvas，禁用图像平滑
const canvas1 = createCanvas({
  width: 300,
  height: 200,
  pixelRatio: 2,
  imageSmoothingEnabled: false, // 禁用平滑
});

// 创建 Canvas，启用高质量图像平滑
const canvas2 = createCanvas({
  width: 300,
  height: 200,
  pixelRatio: 2,
  imageSmoothingEnabled: true, // 启用平滑
  imageSmoothingQuality: "high", // 高质量
});

// 示例：渲染图像（实际使用时需要加载图像数据）
const element = Box({
  width: 300,
  height: 200,
  padding: 20,
  children: [
    // 这里可以添加 Image 组件来测试平滑效果
    Box({
      width: "fill",
      height: "fill",
      background: "#f0f0f0",
    }),
  ],
});

canvas1.render(element);
canvas2.render(element);

// 导出图像查看效果差异
console.log("Canvas 1 (禁用平滑):", canvas1.toDataURL());
console.log("Canvas 2 (高质量平滑):", canvas2.toDataURL());

// 在浏览器环境中，可以将图像显示在页面上
if (typeof document !== "undefined") {
  document.body.appendChild(canvas1.canvas);
  document.body.appendChild(canvas2.canvas);
}
