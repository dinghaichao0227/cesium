//@ts-ignore

import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';


import routes from "./routes"
// // 在你的 Vue Router 代码中添加以下代码
// import path from 'path'

// const __dirname = path.resolve()

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
export default router;
