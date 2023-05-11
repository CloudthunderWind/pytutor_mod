import {createApp} from 'vue'
import App from './App.vue'
import $ from 'jquery'
import Antd from 'ant-design-vue';
import router from "./router/router.ts";

import 'ant-design-vue/dist/antd.css';

const app = createApp(App);
app.use(router);
app.use($);
app.use(Antd);

app.mount('#app')
