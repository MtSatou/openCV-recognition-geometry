<script setup lang="ts">
import { ref } from "vue"
import OcrPatterning from "./components/ocrPatterning/index.vue";
import { pointType } from "./components/ocrPatterning/types/cv"
import { drawCircle, drawShapeOnCanvas } from "./components/ocrPatterning/utils/draw"
import type { brushOptions } from "./components/ocrPatterning/types/theme"

const showCornerPoint = ref(false);
const alwaysClosed = ref(false);
const unknownFigureTransition = ref(false);
const ocrRef = ref<any>(null);

const ocr = () => {
  const data = ocrRef.value.ocrCanvas()
  // @ts-expect-error
  OCRTEXT.textContent = data.type
}
const clear =  () => {
  ocrRef.value.clear()
  // @ts-expect-error
  OCRTEXT.textContent = "= v ="
}
const drawCircleHandler = () => drawCircle(ocrRef.value.canvas.getContext("2d"), 150, 150, 100)
const drawHandler = (points: pointType[]) => {
  const ctx = ocrRef.value.canvas.getContext("2d");
  drawShapeOnCanvas(ctx, points);
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

const colorConfig = ref<brushOptions>({
  color: '#6699ee',
  size: 3,
  lineType: '实线'
})
</script>

<template>
  <OcrPatterning 
    ref="ocrRef" 
    :showCornerPoint="showCornerPoint" 
    :alwaysClosed="alwaysClosed" 
    :unknownFigureTransition="unknownFigureTransition" 
    :style="{
      boxShadow: '0 0 5px 3px #ddd'
    }"
    :brushOptions="colorConfig"
    @mouseup="mouseupHandler"
  ></OcrPatterning>
  <div class="op">
    <div>
      <div>
        <a-button @click="drawHandler([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 150, y: 200 }
        ])">绘制三角形</a-button>

        <a-button @click="drawHandler([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
          { x: 100, y: 200 }
        ])">绘制正方形</a-button>

        <a-button @click="drawHandler([
          { x: 100, y: 100 },
          { x: 250, y: 100 },
          { x: 250, y: 200 },
          { x: 100, y: 200 }
        ])">绘制矩形</a-button>

        <a-button @click="drawHandler([
          { x: 150, y: 100 },
          { x: 220, y: 150 },
          { x: 150, y: 200 },
          { x: 80, y: 150 }
        ])">绘制菱形</a-button>

        <a-button @click="drawHandler([
          { x: 120, y: 100 },
          { x: 160, y: 100 },
          { x: 220, y: 200 },
          { x: 80, y: 200 }
        ])">绘制梯形</a-button>

        <a-button @click="drawHandler([
          { x: 150, y: 100 },
          { x: 200, y: 130 },
          { x: 180, y: 200 },
          { x: 120, y: 200 },
          { x: 100, y: 130 }
        ])">绘制五边形</a-button>

        <a-button @click="drawHandler([
          { x: 150, y: 100 },
          { x: 200, y: 130 },
          { x: 200, y: 180 },
          { x: 150, y: 210 },
          { x: 100, y: 180 },
          { x: 100, y: 130 }
        ])">绘制六边形</a-button>

        <a-button @click="drawHandler([
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
        ])">绘制五角星</a-button>
        <a-button @click="drawCircleHandler">绘制圆形</a-button>
      </div>
      <div style="display: flex; margin-top: 10px; align-items: center;">
        <a-button @click="ocr">校验</a-button>
        <a-button @click="clear">清空画布</a-button>
        <a-checkbox v-model:checked="showCornerPoint">线段角点</a-checkbox>
        <a-checkbox v-model:checked="alwaysClosed">总是闭合</a-checkbox>
        <a-checkbox v-model:checked="unknownFigureTransition">未知图形不转化</a-checkbox>
        <a-input v-model:value="colorConfig.color" type="color" style="width: 50px"/>
        <a-select
          v-model:value="colorConfig.lineType"
          style="width: 120px"
        >
          <a-select-option value="实线">实线</a-select-option>
          <a-select-option value="虚线">虚线</a-select-option>
          <a-select-option value="毛笔" disabled>毛笔</a-select-option>
          <a-select-option value="激光笔">激光笔</a-select-option>
        </a-select>
        <a-slider v-model:value="colorConfig.size" :min="1" style="width: 200px"/>
      </div>
    </div>
    <div id="OCRTEXT">= v =</div>
  </div>
</template>

<style scoped lang="scss">
::v-global(body) {
  background-color: #e8e8e8;
}

::v-deep() {
  button, input {
    margin-right: 10px;
  }
}

.op {
  display: flex;
  justify-content: space-between;

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
