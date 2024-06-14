<template>
  <canvas ref="canvasElement" class="ocrCanvas" :width="innerWidth - 15 + 'px'"
    :height="innerHeight - 120 + 'px'"></canvas>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { pointType } from "./types"
import type { propsType } from "./types/props"
import { shapeTypesMap } from "./constant/index"
import { ocr, isClosedShape, createCircleFromPoints, filterDensePoints } from "./utils/openCV"
import {
  clearCanvas,
  drawCircle,
  drawShapeOnCanvas,
  drawSquareFromPoints,
  drawRectangleFromPoints,
  drawShapeFromPoints
} from "./utils/draw"

const emit = defineEmits(["mousedown", "mousemove", "mouseup"])

const canvasElement = ref<HTMLCanvasElement>()!;
const { innerHeight, innerWidth } = window;

// const props = defineProps<propsType>()
const props = withDefaults(defineProps<propsType>(), {
  alwaysClosed: false,
  showCornerPoint: false,
  unknownFigureTransition: false,
})

onMounted(() => {
  (async () => {
    const canvas = canvasElement.value!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    let drawing = false;
    let points: pointType[] = [];
    canvas.addEventListener("mousedown", (event) => {
      drawing = true;
      points = [];
      emit("mousedown", {
        event
      });
    });

    canvas.addEventListener("mousemove", (event) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      points.push({ x, y });
      draw();
      emit("mousedown", {
        event,
        rect,
        point: { x, y },
        points
      });
    });

    canvas.addEventListener("mouseup", (event) => {
      drawing = false;
      // 总是闭合
      if (props.alwaysClosed) {
        points.push(points[0]);
      }
      // 闭合图形
      if (isClosedShape(points)) {
        // openCV识别
        const mostFrequentShape = ocr(canvas)
        emit("mouseup", {
          event,
          ocr: mostFrequentShape,
          // 闭合
          isClosedShape: true
        })
        if (!mostFrequentShape) {
          return;
        }

        // 未知图形直接获取所有顶点坐标以直线连接
        if (mostFrequentShape.type === shapeTypesMap.Unknown) {
          // 勾选了未知图形不转化
          if (props.unknownFigureTransition) {
            return
          }
          const corners = filterDensePoints(points)
          clearCanvas(canvas);
          drawShapeFromPoints(canvas, corners, true)
        }
        // 特殊处理：圆形
        else if (mostFrequentShape.type === shapeTypesMap.Circle) {
          const { center, radius } = createCircleFromPoints(mostFrequentShape.vertices);
          clearCanvas(canvas);
          drawCircle(canvas, center.x, center.y, radius);
        } 
        // 特殊处理：矩形
        else if (mostFrequentShape?.type === shapeTypesMap.Rectangle) {
          clearCanvas(canvas);
          drawRectangleFromPoints(canvas, mostFrequentShape.vertices);
        } 
        // 特殊处理：正方形
        else if (mostFrequentShape?.type === shapeTypesMap.Square) {
          clearCanvas(canvas);
          drawSquareFromPoints(canvas, mostFrequentShape.vertices);
        } 
        // 特殊处理：五角星
        else if (mostFrequentShape?.type === shapeTypesMap.Star) {
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
        clearCanvas(canvas);
        drawShapeFromPoints(canvas, corners)
        emit("mouseup", {
          event,
          ocr: corners,
          // 未闭合
          isClosedShape: false
        })
        // 显示角点
        if (props.showCornerPoint) {
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

      // 总是闭合
      if (props.alwaysClosed) {
        ctx.lineTo(points[0].x, points[0].y);
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
  setTEXT(data?.type!)
}

/**清空画布*/
const clear = () => {
  setTEXT("= v =")
  clearCanvas(canvasElement.value!)
}

/**暴露属性 */
defineExpose({
  canvas: canvasElement,
  clear,
  ocrHandler
})
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
