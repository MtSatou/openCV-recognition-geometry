<script setup lang="ts">
import OcrPatterning from "./components/ocrPatterning/index.vue";
// @ts-expect-error
import CheckBox from "./components/checkbox.vue"
</script>

<template>
  <OcrPatterning></OcrPatterning>
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
        <CheckBox v-model="alwaysClosed" label="总是闭合"></CheckBox>
        <CheckBox v-model="unknownFigureTransition" label="未知图形不转化"></CheckBox>
      </div>
    </div>
    <div id="OCRTEXT">= v =</div>
  </div>
</template>

<style scoped></style>
