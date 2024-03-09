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
  },
  {
    path: '/heatmap',
    name: 'heatmap',
    component: () => import("../views/heatmap/heatmap.vue")
  },
  {
    path: '/area',
    name: 'area',
    component: () => import("../views/area/area.vue")
  },
  {
    path: '/table',
    name: 'table',
    component: () => import("../views/table/index.vue")
  },
  {
    path: '/fruit',
    name: 'fruit',
    component: () => import("../views/fruit/index.vue")
  }
];

export default routes;
