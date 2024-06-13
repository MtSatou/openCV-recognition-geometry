<template>
  <div>
    <canvas ref="canvasElement" class="ocrCanvas" :width="innerWidth - 15 + 'px'"
      :height="innerHeight - 120 + 'px'"></canvas><br /><br />
    <div class="op">
      <div>
        <div><button @click="drawShapeOnCanvas(canvasElement as HTMLCanvasElement, [
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
        </div>
        <div style="display: flex; margin-top: 10px; align-items: center;">
          <button @click="ocrHandler" style="background: #f74">校验</button>
          <button @click="clear">清空画布</button>
          <CheckBox v-model="showCornerPoint" label="线段角点"></CheckBox>
        </div>
      </div>
      <div id="OCRTEXT">= v =</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { pointType } from "../types"
import { ocr, isClosedShape, createCircleFromPoints, filterDensePoints } from "../utils/openCV"
import {
  clearCanvas,
  drawCircle,
  drawShapeOnCanvas,
  drawSquareFromPoints,
  drawRectangleFromPoints,
  drawShapeFromPoints
} from "../utils/draw"
// @ts-expect-error
import CheckBox from "../components/checkbox.vue"

const canvasElement = ref<HTMLCanvasElement>()!;
const { innerHeight, innerWidth } = window;

const showCornerPoint = ref(true);
onMounted(() => {
  (async () => {
    const canvas = canvasElement.value!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    let drawing = false;
    let points: pointType[] = [];
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
        setTEXT("闭合：" + mostFrequentShape?.type)
        if (!mostFrequentShape) {
          return;
        }

        // 未知图形直接获取所有顶点坐标以直线连接
        if (mostFrequentShape.type === "未知") {
          const corners = filterDensePoints(points)
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
          const corners = filterDensePoints(points)
          clearCanvas(canvas);
          drawShapeFromPoints(canvas, corners)
        } else {
          clearCanvas(canvas);
          drawShapeOnCanvas(canvas, mostFrequentShape.vertices);
        }
      } else {
        // 未闭合图形（线段）
        const corners = filterDensePoints(points)
        setTEXT("未闭合：" + corners.length + " 点")
        clearCanvas(canvas);
        drawShapeFromPoints(canvas, corners)

        // 显示角点
        if (showCornerPoint.value) {
          for (const c of corners) {
            drawCircle(canvasElement.value!, c.x, c.y, 5)
          }
        }
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

/**设置识别文字 */
const setTEXT = (text: string) => {
  // @ts-expect-error
  OCRTEXT.textContent = text;
}

/**识别图像 */
const ocrHandler = () => {
  const data = ocr(canvasElement.value!)
  setTEXT(data?.type)
}

/**清空画布*/
const clear = () => {
  setTEXT("= v =")
  clearCanvas(canvasElement.value!)
}
</script>

<style scoped lang="scss">
::v-global(body) {
  background-color: #e8e8e8;
}

.ocrCanvas {
  box-shadow: 0 0 5px 3px #ddd;
}

.op {
  display: flex;
  justify-content: space-between;

  button {
    padding: 6px 10px;
    margin-right: 10px;
    border: none;
    color: #eee;
    background-color: rgb(60, 141, 182);
    border-radius: 2px;
    cursor: pointer;
  }

  #OCRTEXT {
    color: rgb(60, 141, 182);
    background-color: #fff;
    min-width: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
  }

}
</style>
