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
</template>
<script setup>
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
</script>
