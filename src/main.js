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

import 'leaflet/dist/leaflet.css'
// 引入Leaflet对象 挂载到Vue上，便于全局使用，也可以单独页面中单独引用


import * as L from 'leaflet'
import 'leaflet.pm'
import 'leaflet.pm/dist/leaflet.pm.css'

// Vue.config.productionTip = false;
// Vue.L = Vue.prototype.$L = L

/* leaflet icon */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})




const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)
app.use(Antd);
app.use(router);
app.use(vGanttChart);
app.use(pinia);
app.use(VirtualRuler);
app.mount('#app')
