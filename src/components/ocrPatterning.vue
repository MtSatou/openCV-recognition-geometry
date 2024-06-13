<template>
  <div>
    <canvas ref="canvasElement" class="ocrCanvas" :width="innerWidth - 20 + 'px'"
      :height="innerHeight - 120 + 'px'"></canvas><br /><br />
    <button @click="drawShapeOnCanvas(canvasElement as HTMLCanvasElement, [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 150, y: 200 }
    ])">绘制三角形</button>

    <button @click="drawShapeOnCanvas(canvasElement as HTMLCanvasElement, [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 100, y: 200 }
    ])">绘制正方形</button>

    <button @click="drawShapeOnCanvas(canvasElement as HTMLCanvasElement, [
      { x: 100, y: 100 },
      { x: 250, y: 100 },
      { x: 250, y: 200 },
      { x: 100, y: 200 }
    ])">绘制矩形</button>

    <button @click="drawShapeOnCanvas(canvasElement as HTMLCanvasElement, [
      { x: 150, y: 100 },
      { x: 220, y: 150 },
      { x: 150, y: 200 },
      { x: 80, y: 150 }
    ])">绘制菱形</button>

    <button @click="drawShapeOnCanvas(canvasElement as HTMLCanvasElement, [
      { x: 120, y: 100 },
      { x: 160, y: 100 },
      { x: 220, y: 200 },
      { x: 80, y: 200 }
    ])">绘制梯形</button>

    <button @click="drawShapeOnCanvas(canvasElement as HTMLCanvasElement, [
      { x: 150, y: 100 },
      { x: 200, y: 130 },
      { x: 180, y: 200 },
      { x: 120, y: 200 },
      { x: 100, y: 130 }
    ])">绘制五边形</button>

    <button @click="drawShapeOnCanvas(canvasElement as HTMLCanvasElement, [
      { x: 150, y: 100 },
      { x: 200, y: 130 },
      { x: 200, y: 180 },
      { x: 150, y: 210 },
      { x: 100, y: 180 },
      { x: 100, y: 130 }
    ])">绘制六边形</button>

    <button @click="drawShapeOnCanvas(canvasElement as HTMLCanvasElement, [
      { x: 150, y: 100 },
      { x: 170, y: 140 },
      { x: 220, y: 150 },
      { x: 180, y: 180 },
      { x: 190, y: 230 },
      { x: 150, y: 200 },
      { x: 110, y: 230 },
      { x: 120, y: 180 },
      { x: 80, y: 150 },
      { x: 130, y: 140 }
    ])">绘制五角星</button>
    <button @click="drawCircle(canvasElement as HTMLCanvasElement, 150, 150, 100)">绘制圆形</button>
    <br /><br />
    <button @click="ocrHandler">校验</button>
    <button @click="clearCanvas(canvasElement as HTMLCanvasElement)">清空画布</button>
  </div>
</template>

<script lang="ts" setup>
import { ocr, isClosedShape, createCircleFromPoints, findCorners } from "../utils/openCV"
import {
  clearCanvas,
  drawCircle,
  drawShapeOnCanvas,
  drawSquareFromPoints,
  drawRectangleFromPoints,
  drawShapeFromPoints
} from "../utils/draw"
import { ref, onMounted } from "vue";
const canvasElement = ref<HTMLCanvasElement>()!;
const { innerHeight, innerWidth } = window;

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
        // openCV识别
        const mostFrequentShape = ocr(canvas)
        console.log("闭合", mostFrequentShape)
        if (!mostFrequentShape) {
          return;
        }

        // 未知图形直接获取所有顶点坐标以直线连接
        if (mostFrequentShape.type === "未知") {
          const corners = findCorners(points)
          clearCanvas(canvas);
          drawShapeFromPoints(canvas, corners, true)
        }
        // 特殊处理：画圆、矩形、正方形
        else if (mostFrequentShape.type === "圆形") {
          const { center, radius } = createCircleFromPoints(mostFrequentShape.vertices);
          clearCanvas(canvas);
          drawCircle(canvas, center.x, center.y, radius);
        } else if (mostFrequentShape?.type === "矩形") {
          clearCanvas(canvas);
          drawRectangleFromPoints(canvas, mostFrequentShape.vertices);
        } else if (mostFrequentShape?.type === "正方形") {
          clearCanvas(canvas);
          drawSquareFromPoints(canvas, mostFrequentShape.vertices);
        } else if (mostFrequentShape?.type === "五角星") {
          const corners = findCorners(points)
          clearCanvas(canvas);
          drawShapeFromPoints(canvas, corners)
        } else {
          clearCanvas(canvas);
          drawShapeOnCanvas(canvas, mostFrequentShape.vertices);
        }
      } else {
        // 未闭合图形（线段）
        const corners = findCorners(points)
        console.log("未闭合", corners)
        clearCanvas(canvas);
        drawShapeFromPoints(canvas, corners)
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

const ocrHandler = () => {
  const data = ocr(canvasElement.value!)
  console.log(data);
}

</script>

<style scoped>
::v-global(body) {
  background-color: #e8e8e8;
}
.ocrCanvas {
  box-shadow: 0 0 5px 3px #ddd;
}

button {
  padding: 6px 10px;
  margin-right: 10px;
  border: none;
  color: #eee;
  background-color: rgb(60, 141, 182);
  border-radius: 2px;
  cursor: pointer;
}
</style>
