<template>
  <el-table :data="tableData" :span-method="spanMethod" style="width: 100%">
    <el-table-column prop="StoAlias" label="节点名称" />
    <el-table-column prop="Name" label="存储池名称" />
    <el-table-column prop="Type" label="存储池类型" />
    <el-table-column prop="Capacity" label="总容量" />
    <el-table-column prop="Available" label="可用容量" />
    <el-table-column prop="Used" label="已使用容量" />
    <el-table-column prop="Status" label="状态" />
  </el-table>
</template>

<script setup lang="ts">
const tableData = [
  { Available: 0, Capacity: 1, Name: 'test05', Status: 0, StoAlias: 'test', Type: 0, Used: 0 },
  { Available: 0, Capacity: 0, Name: 'test01', Status: 0, StoAlias: '169.254.218', Type: 0, Used: 0 },
  { Available: 0, Capacity: 1, Name: 'tset03', Status: 0, StoAlias: 'test', Type: 1, Used: 0 },
  { Available: 0, Capacity: 2, Name: 'test02', Status: 0, StoAlias: 'test03', Type: 0, Used: 0 },
  { Available: 0, Capacity: 2, Name: 'test06', Status: 0, StoAlias: '169.254.218', Type: 0, Used: 0 },
  { Available: 0, Capacity: 0, Name: 'test04', Status: 0, StoAlias: '169.254.218', Type: 0, Used: 0 },
  { Available: 0, Capacity: 0, Name: 'test07', Status: 0, StoAlias: '169.254.218', Type: 1, Used: 0 },
];

let cellList: any[] = []; // 单元格数组
let count: number = 0; // 计数

const computeCell = (tableList: any[]) => {
  cellList = [];
  count = 0;
  for (let i = 0; i < tableList.length; i++) {
    if (i === 0) {
      // 先设置第一项
      cellList.push(1); // 初为1，若下一项和此项相同，就往cellList数组中追加0
      count = 0; // 初始计数为0
    } else {
      if (tableList[i].StoAlias == tableList[i - 1].StoAlias) {
        cellList[count] += 1; // 增加计数
        cellList.push(0); // 相等就往cellList数组中追加0
      } else {
        cellList.push(1); // 不等就往cellList数组中追加1
        count = i; // 将索引赋值为计数
      }
    }
  }
};

const sortArray = (x: any, y: any) => {
  if (x.StoAlias < y.StoAlias) {
    return -1;
  } else if (x.StoAlias > y.StoAlias) {
    return 1;
  } else {
    return 0;
  }
};

interface SpanMethodProps {
  row: StoragePoolItem;
  column: any;
  rowIndex: number;
  columnIndex: number;
}

const spanMethod = ({ rowIndex, columnIndex }: SpanMethodProps) => {
  computeCell(tableData.sort(sortArray));
  if (columnIndex === 4) {
    console.log(columnIndex, '===0000000===');

    const fRow = cellList[rowIndex];
    const fCol = fRow > 0 ? 1 : 0;

    console.log(fRow, fCol, '========');

    return {
      rowspan: fRow, // 合并的行数
      colspan: fCol, // 合并的列数，为0表示不显示
    };
  } else if (columnIndex === 6) {
    console.log(columnIndex, '===0000000===');

    const fRow = cellList[rowIndex];
    const fCol = fRow > 0 ? 1 : 0;

    console.log(fRow, fCol, '========');

    return {
      rowspan: fRow, // 合并的行数
      colspan: fCol, // 合并的列数，为0表示不显示
    };
  }
};
</script>
