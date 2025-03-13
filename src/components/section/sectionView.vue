<template>
  <section class="home">
    <button @click="add">增加</button>
    <div class="scroll" v-scrollBottom>
      <div class="scroll-item" v-for="item in num" :key="item">{{ item }}</div>
    </div>
  </section>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
const num = ref(5);

function add() {
  num.value++;
}
</script>

<style scoped lang="scss">
.home {
  .scroll {
    height: 600px;
    overflow: auto;
    .scroll-item {
      width: 300px;
      height: 200px;
      margin-bottom: 20px;
      background-color: skyblue;
    }
  }
}
</style>
