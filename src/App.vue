<script setup lang="ts">
import { ref } from "vue"
import OcrPatterning from "./components/ocrPatterning/index.vue";
// @ts-expect-error
import CheckBox from "./components/checkbox.vue"
import { pointType } from "./components/ocrPatterning/types"
import { drawCircle, drawShapeOnCanvas } from "./components/ocrPatterning/utils/draw"

const showCornerPoint = ref(false);
const alwaysClosed = ref(false);
const unknownFigureTransition = ref(false);
const ocrRef = ref();
const drawHandler = (points: pointType[]) => {
  drawShapeOnCanvas(ocrRef.value.canvas, points);
}

const mouseupHandler = (evt: any) => {
  // 闭合图形
  if (evt.isClosedShape) {
    // @ts-expect-error
    OCRTEXT.textContent = "闭合：" + evt.ocr.type
  } else {
    // @ts-expect-error
    OCRTEXT.textContent = "未闭合：" + evt.ocr.length + "点"
  }
}
</script>

<template>
  <OcrPatterning 
    ref="ocrRef" 
    :showCornerPoint="showCornerPoint" 
    :alwaysClosed="alwaysClosed" 
    :unknownFigureTransition="unknownFigureTransition" 
    @mouseup="mouseupHandler"
  ></OcrPatterning>
  <div class="op">
    <div>
      <div>
        <button @click="drawHandler([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 150, y: 200 }
        ])">绘制三角形</button>

        <button @click="drawHandler([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
          { x: 100, y: 200 }
        ])">绘制正方形</button>

        <button @click="drawHandler([
          { x: 100, y: 100 },
          { x: 250, y: 100 },
          { x: 250, y: 200 },
          { x: 100, y: 200 }
        ])">绘制矩形</button>

        <button @click="drawHandler([
          { x: 150, y: 100 },
          { x: 220, y: 150 },
          { x: 150, y: 200 },
          { x: 80, y: 150 }
        ])">绘制菱形</button>

        <button @click="drawHandler([
          { x: 120, y: 100 },
          { x: 160, y: 100 },
          { x: 220, y: 200 },
          { x: 80, y: 200 }
        ])">绘制梯形</button>

        <button @click="drawHandler([
          { x: 150, y: 100 },
          { x: 200, y: 130 },
          { x: 180, y: 200 },
          { x: 120, y: 200 },
          { x: 100, y: 130 }
        ])">绘制五边形</button>

        <button @click="drawHandler([
          { x: 150, y: 100 },
          { x: 200, y: 130 },
          { x: 200, y: 180 },
          { x: 150, y: 210 },
          { x: 100, y: 180 },
          { x: 100, y: 130 }
        ])">绘制六边形</button>

        <button @click="drawHandler([
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
        <button @click="drawCircle(ocrRef.canvas as HTMLCanvasElement, 150, 150, 100)">绘制圆形</button>
      </div>
      <div style="display: flex; margin-top: 10px; align-items: center;">
        <button @click="ocrRef.ocrCanvas" style="background: #f74">校验</button>
        <button @click="ocrRef.clear">清空画布</button>
        <CheckBox v-model="showCornerPoint" label="线段角点"></CheckBox>
        <CheckBox v-model="alwaysClosed" label="总是闭合"></CheckBox>
        <CheckBox v-model="unknownFigureTransition" label="未知图形不转化"></CheckBox>
      </div>
    </div>
    <div id="OCRTEXT">= v =</div>
  </div>
</template>

<style scoped lang="scss">
::v-global(body) {
  background-color: #e8e8e8;
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
