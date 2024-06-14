<template>
  <div class="checkbox">
    <label class="container">
      <input :checked="checked" type="checkbox" @change="inputChange">
      <div class="checkmark"></div>
      <span class="label">{{ label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
const emit = defineEmits(["update:modelValue"])
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ""
  }
})

const checked = computed<boolean>({
  set(value) {
    emit("update:modelValue", value)
  },
  get() {
    return props.modelValue
  }
})

const inputChange = (evt: any) => {
  emit("update:modelValue", evt.target.checked)
}
</script>

<style scoped>
/* 修改自 https://uiverse.io/SelfMadeSystem/calm-cat-84 */
.checkbox {
  width: fit-content;
  display: inline-block;

  .container {
    display: flex;
    align-items: center;
    width: fit-content;
    margin-right: 4px;
    position: relative;
    cursor: pointer;
    font-size: 20px;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    input {
      display: none;
    }

    .checkmark {
      display: inline-block;
      position: relative;
      top: 0;
      left: 0;
      height: 1em;
      width: 1em;
      background-color: #2196F300;
      border-radius: 0.15em;
      transition: all 0.25s;

      &:after {
        content: "";
        position: absolute;
        transform: rotate(0deg);
        border: 1px solid black;
        left: 0;
        top: 0;
        width: 1em;
        height: 1em;
        border-radius: 3px;
        transition: all 0.25s, border-width 0.1s;
      }

      input:checked~& {
        background-color: #2196F3;

        &:after {
          left: 0.3em;
          top: 0.15em;
          width: 0.25em;
          height: 0.5em;
          border-color: #fff0 white white #fff0;
          border-width: 0 0.15em 0.15em 0;
          border-radius: 0em;
          transform: rotate(45deg);
        }
      }
    }

    .label {
      font-size: 14px;
      margin-left: 8px;
    }
  }
}
</style>