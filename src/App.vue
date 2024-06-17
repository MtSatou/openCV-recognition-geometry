<script setup lang="ts">
import { ref } from "vue"
import OcrPatterning from "./components/ocrPatterning/index.vue";
import type { canvasOptionsType } from "./components/ocrPatterning/types/theme"

const reserve = ref(true);
const showCornerPoint = ref(false);
const alwaysClosed = ref(false);
const ocrRef = ref<any>(null);

const clear = () => ocrRef.value.clear()
const mouseupHandler = (evt: any) => {
  console.log(evt, "evt")
}

const colorConfig = ref<canvasOptionsType>({
  color: '#6699ee',
  size: 5,
  lineType: '实线',
  penType: '铅笔',
})
</script>

<template>
  <OcrPatterning 
    ref="ocrRef" 
    :reserve="reserve"
    :showCornerPoint="showCornerPoint"
    :alwaysClosed="alwaysClosed"
    :canvasOptions="colorConfig"
    fillColor="#fff"
    :style="{
      boxShadow: '0 0 5px 3px #ddd'
    }" 
    @mouseup="mouseupHandler"
  >
  </OcrPatterning>
  <div class="op">
    <div>
      <div style="display: flex; margin-top: 10px; align-items: center;">
        <a-button @click="clear">清空</a-button>
        <a-checkbox v-model:checked="alwaysClosed">总是闭合</a-checkbox>
        <a-checkbox v-model:checked="showCornerPoint" :disabled="colorConfig.penType !== '智能笔'">线段角点（智能笔可用）</a-checkbox>
        <a-checkbox v-model:checked="reserve">保留画布</a-checkbox>
        <a-input v-model:value="colorConfig.color" type="color" style="width: 50px" />
        <a-select v-model:value="colorConfig.lineType" style="width: 120px">
          <a-select-option value="实线">实线</a-select-option>
          <a-select-option value="虚线">虚线</a-select-option>
        </a-select>
        <a-select v-model:value="colorConfig.penType" style="width: 120px; margin-left: 10px">
          <a-select-option value="铅笔">铅笔</a-select-option>

          <a-select-option value="毛笔">毛笔</a-select-option>
          <a-select-option value="激光笔">激光笔</a-select-option>
          <a-select-option value="智能笔">智能笔</a-select-option>
        </a-select>
        <a-slider v-model:value="colorConfig.size" :min="1" style="width: 200px; margin-left: 10px" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
::v-global(body) {
  background-color: #e8e8e8;
}

::v-deep() {

  button,
  input {
    margin-right: 10px;
  }
}

.op {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
</style>
