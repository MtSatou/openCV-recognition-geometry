<template>
  <div class="canvas-container">
    <canvas 
      class="render-canvas" 
      ref="renderCanvasElement"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
    <canvas 
      class="proxy-canvas"
      ref="proxyCanvasElement" 
      :width="canvasWidth"
      :height="canvasHeight"
      :key="canvasKey"
      :="$attrs"
    ></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { ocr } from "./utils/openCV"
import { debounce } from "./utils/common"
import { mergeCanvas, clearCanvas } from "./utils/draw"
import { initTheme, callbackType } from "./theme"
import { defaultCanvasOptions } from "./config"
import { PenTypeMap } from "./constant";
import type { propsType } from "./types/props"

const emit = defineEmits(["mouseup"])

const canvasKey = ref(0);
const proxyCanvasElement = ref<HTMLCanvasElement>()!;
const renderCanvasElement = ref<HTMLCanvasElement>()!;

// const props = defineProps<propsType>()
const props = withDefaults(defineProps<propsType>(), {
  reserve: true,
  alwaysClosed: false,
  showCornerPoint: false,
  width: window.innerWidth - 15 + 'px',
  height: window.innerHeight - 120 + 'px',
  fillColor: "#00000000"
  // canvasOptions: {}
})
const canvasWidth = computed(() => typeof props.width === 'number' ? props.width + 'px' : props.width)
const canvasHeight = computed(() => typeof props.height === 'number' ? props.height + 'px' : props.height)
const canvasFillColor = computed(() => props.fillColor)

// 鼠标抬起处理函数
const mouseCallback = (evt: callbackType) => {
  if (evt.penData.penType === PenTypeMap.Pen_Laser) {
    return;
  }
  reload();
  const formCtx = proxyCanvasElement.value!.getContext("2d")!;
  const toCtx = renderCanvasElement.value!.getContext("2d")!;
  // const mergeImageData = props.reserve && setCanvasImgRgbaData(formCtx, toCtx) || null;
  mergeCanvas(formCtx, toCtx);
  emit("mouseup", evt);
}

/**识别图像 */
const ocrCanvas = () => ocr(proxyCanvasElement.value!);
/**重载proxy画布 */
const reload = () => {
  canvasKey.value++;
  nextTick(() => {
    const canvas = proxyCanvasElement.value!;
    const ctx = canvas.getContext("2d")!;
    Object.assign(defaultCanvasOptions, props.canvasOptions);
    initTheme(ctx, props, props.canvasOptions, mouseCallback);
  });
}
/**清空画布 */
const clear = () => {
  clearCanvas(proxyCanvasElement.value!);
  clearCanvas(renderCanvasElement.value!);
};

onMounted(() => {
  watch(() => props.canvasOptions, debounce(reload, 100), { deep: true, immediate: true });
  watch(() => props.reserve, debounce(clear, 100));
});

/**暴露属性 */
defineExpose({
  canvas: proxyCanvasElement,
  ocrCanvas,
  reload,
  clear
})
</script>

<style lang="scss" scoped>
  .canvas-container {
    position: relative;
    width: v-bind(canvasWidth);
    height: v-bind(canvasHeight);
    background-color: v-bind(canvasFillColor);
    .render-canvas {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }
    .proxy-canvas {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
    }
  }
</style>