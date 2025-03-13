<style scoped>
/* body {
  display: flex;
  padding: 100px;
  flex-direction: column;
}
div {
  width: 100px;
  height: 100px;
  text-align: center;
} */
.container {
  width: 200px;
  height: 400px;
  background-color: gray;
}
.xiaomi,
.huawei {
  width: 100%;
  height: 150px;
  background-color: rgb(240, 177, 177);
}

.xiaomi > div {
  width: 100%;
  height: 30px;
  background-color: #fff;
  margin-top: 10px;
}
.huawei > div {
  width: 100%;
  height: 30px;
  background-color: #fff;
  margin-top: 10px;
}

.context {
  display: flex;
}
#main {
  margin-left: 30px;
  height: 400px;
}

.main-header {
  height: 30px;
  background-color: blue;
  color: red;
}
.main-context {
  display: flex;
  width: 30px;
  margin-top: 10px;
}
.context-main {
  margin-top: 20px;
}
</style>

<template>
  <div class="context">
    <div class="container">
      <div draggable="true" class="xiaomi">
        小米
        <div>2</div>
        <div>3</div>
        <div>4</div>
      </div>
      <div draggable="true" class="huawei">
        华为
        <div>5</div>
        <div>6</div>
        <div>7</div>
      </div>
      <!-- <div style="background-color: blue" draggable="true">蓝色</div>  -->
    </div>
    <div id="main">
      <div>
        <div class="main-header">111111111111111111111111111111</div>
        <div class="main-context">
          <div>11111</div>
          <div>222222</div>
          <div>33333</div>
        </div>
        <div class="main-context">
          <div>11111</div>
          <div>222222</div>
          <div>33333</div>
        </div>
        <div class="main-context">
          <div>11111</div>
          <div>222222</div>
          <div>33333</div>
        </div>
      </div>

      <div class="context-main">
        <div class="main-header">111111111111111111111111111111</div>
        <div class="main-context">
          <div>11111</div>
          <div>222222</div>
          <div>33333</div>
        </div>
        <div class="main-context">
          <div>11111</div>
          <div>222222</div>
          <div>33333</div>
        </div>
        <div class="main-context">
          <div>11111</div>
          <div>222222</div>
          <div>33333</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

onMounted(() => {
  let container = document.getElementById('container');
  let main = document.getElementById('main');
  let draggingElement = null;

  const handleDragStart = (event) => {
    draggingElement = event.target;
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event, container, siblingContainer) => {
    event.preventDefault();
    if (draggingElement && draggingElement !== event.target && event.target.draggable) {
      let allDivs = Array.from(container.children);
      let siblingDivs = Array.from(siblingContainer.children);
      let draggingIndex = allDivs.indexOf(draggingElement);
      let targetIndex = allDivs.indexOf(event.target);

      if (draggingIndex > targetIndex) {
        container.insertBefore(draggingElement, event.target);
        siblingContainer.insertBefore(siblingDivs[draggingIndex], siblingDivs[targetIndex]);
      } else {
        container.insertBefore(draggingElement, event.target.nextSibling);
        siblingContainer.insertBefore(siblingDivs[draggingIndex], siblingDivs[targetIndex].nextSibling);
      }
    }
  };

  container.addEventListener('dragstart', handleDragStart);
  main.addEventListener('dragstart', handleDragStart);

  container.addEventListener('dragover', handleDragOver);
  main.addEventListener('dragover', handleDragOver);

  container.addEventListener('drop', (event) => handleDrop(event, container, main));
  main.addEventListener('drop', (event) => handleDrop(event, main, container));
});
</script>
