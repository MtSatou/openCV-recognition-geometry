<template>
  <div>
    <canvas ref="canvasElement" class="ocrCanvas" width="600px" height="300px"></canvas><br /><br />
    <button @click="drawTriangle(canvasElement as HTMLCanvasElement, [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 150, y: 200 }
    ], 'red')">绘制三角形</button>
    <button @click="drawSquare(canvasElement as HTMLCanvasElement, 50, 50, 100, 'red')">绘制正方形</button>
    <button @click="drawRectangle(canvasElement as HTMLCanvasElement, 200, 50, 100, 50, 'red')">绘制矩形</button>
    <button @click="drawDiamond(canvasElement as HTMLCanvasElement, 200, 200, 100, 150, 'red')">绘制菱形</button>
    <button
      @click="drawTrapezoid(canvasElement as HTMLCanvasElement, 100, 100, 200, 100, 250, 200, 50, 200, 'red')">绘制梯形</button>
    <button @click="drawPentagon(canvasElement as HTMLCanvasElement, 150, 150, 100, 'red')">绘制五边形</button>
    <button @click="drawHexagon(canvasElement as HTMLCanvasElement, 150, 150, 100, 'red')">绘制六边形</button>
    <button @click="drawStar(canvasElement as HTMLCanvasElement, 150, 150, 100, 50, 5, 'red')">绘制五角星</button>
    <button @click="drawCircle(canvasElement as HTMLCanvasElement, 150, 150, 100, 'red')">绘制圆形</button>
    <br /><br />
    <button @click="ocr(canvasElement as HTMLCanvasElement)">校验</button>
    <button @click="clearCanvas(canvasElement as HTMLCanvasElement)">清空画布</button>
  </div>
</template>

<script lang="ts" setup>
import { ocr, isClosedShape, createCircleFromPoints } from "../utils/openCV"
import {
  clearCanvas,
  drawLine,
  drawTriangle,
  drawSquare,
  drawRectangle,
  drawDiamond,
  drawTrapezoid,
  drawPentagon,
  drawHexagon,
  drawStar,
  drawCircle,
  drawShapeOnCanvas,
  drawSquareFromPoints,
  drawRectangleFromPoints,
  drawShapeFromPoints
} from "../utils/draw"
import { ref, onMounted } from "vue";
const canvasElement = ref<HTMLCanvasElement>()!;

onMounted(() => {
  (async () => {
    const canvas = canvasElement.value!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    let drawing = false;
    let points: { x: number; y: number }[] = [];

    canvas.addEventListener("mousedown", () => {
      drawing = true;
      points = [];
    });

    canvas.addEventListener("mousemove", (event) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      points.push({ x, y });
      draw();
    });

    canvas.addEventListener("mouseup", () => {
      drawing = false;
      // 闭合图形
      if (isClosedShape(points)) {
        drawLine(canvas, points[0], points[points.length - 1])
        // openCV识别
        const mostFrequentShape = ocr(canvas)
        console.log(mostFrequentShape, "绘制")
        if (!mostFrequentShape) {
          // 未识别到的图形，直接获取顶点绘制直线
          return;
        }

        // 未知图形直接获取所有顶点坐标以直线连接
        if (mostFrequentShape.type === "未知") {
          clearCanvas(canvas);
          drawShapeFromPoints(canvas, mostFrequentShape.vertices, true)
        }
        // 特殊处理：画圆、矩形、正方形
        else if (mostFrequentShape.type === "圆形") {
          const { center, radius } = createCircleFromPoints(mostFrequentShape.vertices);
          clearCanvas(canvas);
          drawCircle(canvas, center.x, center.y, radius, "black");
        } else if (mostFrequentShape?.type === "矩形") {
          clearCanvas(canvas);
          drawRectangleFromPoints(canvas, mostFrequentShape.vertices);
        } else if (mostFrequentShape?.type === "正方形") {
          clearCanvas(canvas);
          drawSquareFromPoints(canvas, mostFrequentShape.vertices);
        } else {
          clearCanvas(canvas);
          drawShapeOnCanvas(canvas, mostFrequentShape.vertices);
        }
      } else {
        // 未闭合图形（线段）
        console.log("未闭合", points);
      }
    });

    // 移动绘制
    function draw() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      if (points.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }

  })();
});

</script>

<style scoped>
.ocrCanvas {
  border: 1px solid black;
}
</style>
