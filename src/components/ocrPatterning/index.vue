<template>
  <canvas 
    ref="canvasElement" 
    :width="typeof width === 'number' ? width + 'px' : width"
    :height="typeof height === 'number' ? height + 'px' : height"
    :key="canvasKey"
    :="$attrs"
  ></canvas>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { ocr } from "./utils/openCV"
import { clearCanvas } from "./utils/draw"
import { initTheme } from "./theme"
import { defaultCanvasOptions } from "./config"
import type { propsType } from "./types/props"

const emit = defineEmits(["mousedown", "mousemove", "mouseup"])

const canvasKey = ref(0);
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
    Object.assign(defaultCanvasOptions, props.brushOptions);
    initTheme(ctx, props, emit, props.brushOptions);
  }, { deep: true, immediate: true })
});

/**识别图像 */
const ocrCanvas = () => ocr(canvasElement.value!)
/**重载画布 */
const reload = () => {
  canvasKey.value++;
  nextTick(() => {
    const canvas = canvasElement.value!;
    const ctx = canvas.getContext("2d")!;
    Object.assign(defaultCanvasOptions, props.brushOptions);
    initTheme(ctx, props, emit, props.brushOptions);
  });
}

/**暴露属性 */
defineExpose({
  canvas: canvasElement,
  ocrCanvas,
  reload
})
</script>
