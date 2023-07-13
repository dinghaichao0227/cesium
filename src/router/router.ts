//@ts-ignore

import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
// 路由记录，这个跟vue2中用法一致，就不做过多解释了


import routes from "./routes"


const router = createRouter({
  history: createWebHashHistory(),
  routes
});
export default router;
