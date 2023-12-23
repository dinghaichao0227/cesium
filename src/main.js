import { createApp } from 'vue';
import App from './App.vue';
import router from "./router/router";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
// import "ant-design-vue/dist/antd.css";
import 'ant-design-vue/dist/reset.css';
import "normalize.css";
import "../src/style/theme.scss";

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import vGanttChart from "@/components/v-gantt/index";

import "virtual-ruler/dist/virtual-ruler.css";
import VirtualRuler from "virtual-ruler";


const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)
app.use(Antd);
app.use(router);
app.use(vGanttChart)
app.use(pinia);
app.use(VirtualRuler);
app.mount('#app')
