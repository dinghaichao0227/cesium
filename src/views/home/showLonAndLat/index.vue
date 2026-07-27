<template>
  <div class="latLon">
    <div>经度：{{ longitude }}</div>
    <div>维度：{{ latitude }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const latitude = ref<any>(localStorage.getItem('lat'));
const longitude = ref<any>(localStorage.getItem('lon'));
const props = defineProps({
  lon: null,
  lat: null,
});

watch(
  () => props.lon,
  (newVal: any) => {
    longitude.value = newVal;
  }
);
watch(
  () => props.lat,
  (newVal: any) => {
    latitude.value = newVal;
  }
);
const lon = ref<any>('');
const lat = ref<any>('');
</script>

<style scoped src="./index.scss"></style>
