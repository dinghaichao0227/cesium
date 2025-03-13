<style type="text/css">
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

.context {
  display: flex;
}
#main {
  margin-left: 200px;
}
</style>

<template>
  <div class="context">
    <div id="container">
      <div style="background-color: red; width: 200px; height: 200px" draggable="true">红色</div>
      <div style="background-color: green; width: 100px" draggable="true">绿色</div>
      <div style="background-color: blue" draggable="true">蓝色</div>
    </div>
    <div id="main">
      <div style="background-color: red; width: 200px; height: 200px" draggable="true">红色</div>
      <div style="background-color: green; width: 100px" draggable="true">绿色</div>
      <div style="background-color: blue" draggable="true">蓝色</div>
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
