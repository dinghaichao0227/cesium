import { createApp } from 'vue';
import App from './App.vue';
import router from "./router/router";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "normalize.css";
import "../src/style/theme.scss"




const pinia = createPinia()
const app = createApp(App)
app.use(Antd);
app.use(router);
app.use(pinia);
app.mount('#app')
