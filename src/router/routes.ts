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
    component: () => import("../views/label/index.vue")
  },
  {
    path: '/splitScreen',
    name: 'splitScreen',
    component: () => import("../views/splitScreen/index.vue")
  },
  {
    path: '/map',
    name: 'map',
    component: () => import("../views/map/index.vue")
  }
];

export default routes;
