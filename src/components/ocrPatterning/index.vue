<template>
  <canvas 
    ref="canvasElement" 
    :width="typeof width === 'number' ? width + 'px' : width"
    :height="typeof height === 'number' ? height + 'px' : height"
    :="$attrs"
  ></canvas>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import type { propsType } from "./types/props"
import { ocr } from "./utils/openCV"
import {
  clearCanvas,
} from "./utils/draw"
import { useTheme, initBrushTheme } from "./theme"
import { defaultBrushOptions } from "./config"

const emit = defineEmits(["mousedown", "mousemove", "mouseup"])

const canvasElement = ref<HTMLCanvasElement>()!;

// const props = defineProps<propsType>()
const props = withDefaults(defineProps<propsType>(), {
  alwaysClosed: false,
  showCornerPoint: false,
  width: window.innerWidth - 15 + 'px',
  height: window.innerHeight - 120 + 'px',
  // brushOptions: {}
})

onMounted(() => {
  const canvas = canvasElement.value!;
  const ctx = canvas.getContext("2d")!;

  watch(() => props.brushOptions, () => {
    Object.assign(defaultBrushOptions, props.brushOptions);
    initBrushTheme(ctx, props.brushOptions);
  }, { deep: true, immediate: true })

  useTheme(canvas, props, emit);
});

/**识别图像 */
const ocrCanvas = () => ocr(canvasElement.value!)
/**清空画布*/
const clear = () => clearCanvas(canvasElement.value!)

/**暴露属性 */
defineExpose({
  canvas: canvasElement,
  clear,
  ocrCanvas
})
</script>
