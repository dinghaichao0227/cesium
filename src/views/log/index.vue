<template>
  <section class="home">
    <button @click="add">增加</button>
    <div class="scroll" v-scrollBottom>
      <div class="scroll-item" v-for="item in num" :key="item">{{ item }}</div>
    </div>
  </section>
  <div class="box">
    <div class="box-left">1</div>
    <div id="box-main">
      22222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
    </div>
    <div class="box-right">3</div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue';
const num = ref(5);
let objnum1 = ref(10);
function add() {
  num.value++;
  objnum1.value++;
  info();
}

const info = () => {
  const obj = document.getElementById('box-main');
  console.log(obj, '2020');
  // 一开始默认是100%
  let zoom = parseInt(obj.style.zoom, 10) || 100;
  // 设定范围
  if (zoom >= 10 && zoom <= 130) {
    obj.style.zoom = zoom - objnum1.value + '%';
  }
};

onMounted(() => {
  info();
});
</script>

<style scoped lang="scss">
.fileinput-button {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.fileinput-button input {
  position: absolute;
  right: 0px;
  top: 0px;
  opacity: 0;
  -ms-filter: 'alpha(opacity=0)';
}
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

.box {
  display: flex;
  width: 100%;
  height: 300px;
  background-color: #808080;

  &-left {
    width: 200px;
    height: 100%;
    background-color: green;
  }
  &-main {
    width: 300px;
    height: 100%;
    background-color: blue;
    display: flex;
    justify-content: flex-start;
    overflow-x: auto;
  }
  &-right {
    width: 200px;
    height: 100%;
    background-color: yellow;
  }
}
</style>
