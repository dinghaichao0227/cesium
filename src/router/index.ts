import router from './router';

router.beforeEach((to, from, next) => {
  // sharedState.data = '';
  const pageAStore = pinia.getStore('map');
  pageAStore.setDynamicData('');
  next();
});
export default router;
