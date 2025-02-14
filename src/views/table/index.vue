<template>
  <a-table :columns="columns" :data-source="data">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'action'">
        <a-button v-model="btnMap[record.key]" @click="onBtn(record)">
          {{ btnMap[record.key] }}: {{ btnMap[record.key] ? 'edit' : 'update' }}
        </a-button>
        <a-button>del</a-button>
      </template>
    </template>
  </a-table>

  <!-- 上传按钮的div -->
  <span class="fileinput-button">
    <a-button>点击上传</a-button>
    <input type="file" @change="upload" />
  </span>
  <!-- 上传按钮的div -->

  <section class="home">
    <button @click="add">增加</button>
    <div class="scroll" v-scrollBottom>
      <div class="scroll-item" v-for="item in num">{{ item }}</div>
    </div>
  </section>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
const num = ref(5);
function add() {
  num.value++;
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'action',
    dataIndex: 'action',
    key: 'action',
    width: 150,
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
  },
  {
    key: '2',
    name: 'John',
    age: 32,
  },
  {
    key: '3',
    name: 'woen',
    age: 32,
  },
  {
    key: '4',
    name: 'rown',
    age: 32,
  },
  {
    key: '6',
    name: 'Brown',
    age: 32,
  },
];
let btnMap = {};
let btnText = 'edit';
const onBtn = (record) => {
  console.log(record, 2828);
  // btnMap[record.key] = btnMap[record.key] === undefined ? true : false;
  console.log(btnMap[record.key], '-----');

  // if (btnMap[record.key] === undefined) {
  //   btnMap[record.key] = true;
  // }
  btnMap[record.key] = btnMap[record.key] ? false : true;
  console.log(btnMap[record.key], '====');
};

const upload = (e) => {
  console.log(e, 2828);
};
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
</style>
