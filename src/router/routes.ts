import { type RouteRecordRaw } from "vue-router";
import HomeView from "../views/home/index.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: '/label',
    name: 'label',
    component: () => import("@/views/label/index.vue")
  }
];

export default routes;
