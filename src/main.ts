import App from './App.vue'
import { createApp } from 'vue';
import { Button, Input, Checkbox, Select, Slider } from 'ant-design-vue';

const app = createApp(App);

/* 会自动注册 Button 下的子组件, 例如 Button.Group */
app.use(Input)
app.use(Button)
app.use(Select)
app.use(Slider)
app.use(Checkbox)
app.mount('#app')
