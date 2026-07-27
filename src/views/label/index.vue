<template>
  <div id="app">
    <v-gantt-chart
      :currentTime="currentTime"
      :startTime="times[0]"
      :endTime="times[1]"
      :cellWidth="cellWidth"
      :cellHeight="cellHeight"
      :timeLines="timeLines"
      :titleHeight="titleHeight"
      :scale="scale"
      :titleWidth="titleWidth"
      showCurrentTime
      :hideHeader="hideHeader"
      :dataKey="dataKey"
      :datas="datas"
    >
    </v-gantt-chart>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import vGanttChart from '@/components/v-gantt/index';
import { Stencil } from '@antv/x6-plugin-stencil';

// import {mapMutations, mapState} from "vuex";
import { useCounterStore } from '@/pinia/index.ts';
import datum from './datum.json';
// import { mockDatas } from '@/axios/api/mock-data';

export default {
  name: 'App',

  data() {
    return {
      showRowList: useCounterStore().showRowList,
      showRowList: useCounterStore().showRowList,
      setShowRowList: useCounterStore(),
      setRawRowList: useCounterStore(),
      timeLines: [
        {
          time: dayjs().add(2, 'hour').toString(),
          text: '~~',
        },
        {
          time: dayjs().add(5, 'hour').toString(),
          text: 'try',
          color: '#747E80',
        },
      ],
      currentTime: dayjs(),
      cellWidth: 60,
      cellHeight: 50,
      titleHeight: 60,
      titleWidth: 250,
      scale: 60,
      times: [
        // '2024-01-01 00:00:00',
        // '2024-01-29 00:00:00',
        dayjs().set('hour', 0).set('minute', 0).toString(),
        dayjs().add(6, 'day').set('hour', 23).set('minute', 59).toString(),
        // dayjs(2024-01-01 00:00:00),
        // dayjs(2024-01-29 00:00:00)
      ],
      rowNum: 500,
      colNum: 25,
      datas: [[]],
      dataKey: 'id',
      scrollToTime: dayjs().add(1, 'day').toString(),
      hideHeader: false,
      positionB: {},
      positionA: {},
      ganttData: [],
      classifyDialogVisible: false,
      checkDialogVisible: false,
      rowTypes: ['🚅', '🚈', '🚄'],
      speedTypes: ['0~50', '50~100', '100'],
      selectRowTypes: [],
      selectSpeedTypes: [],
      classifyTypeList: [],
      rawData: [],
      findList: [],
      currentFindIndex: 0,
    };
  },
  watch: {
    showRowList() {
      this.classifyData();
    },
    // cellWidth() {
    //   setTimeout(() => {
    //     this.$bus.$emit('refresh');
    //   }, 500);
    // },
    // scale() {
    //   setTimeout(() => {
    //     this.$bus.$emit('refresh');
    //   }, 500);
    // },
  },

  created() {
    this.initData();
  },
  mounted() {
    // this.initData();
  },
  methods: {
    initData() {
      let list = mockDatas(this.rowNum, this.colNum, this.times);
      // let list = datum;
      console.log(list, this.times, 111);
      useCounterStore().setRawRowList(list);
      useCounterStore().setShowRowList(cloneDeep(list));
      this.classifyData();
    },
    /* 数据分组*/
    classifyData() {
      function combine(arr) {
        let result = [];
        (function f(t, a, n) {
          if (n === 0) return result.push(t);
          for (let i = 0; i < a[n - 1].length; i++) {
            f(t.concat(a[n - 1][i]), a, n - 1);
          }
        })([], arr, arr.length);
        return result;
      }

      let typeList = this.selectRowTypes.length ? this.selectRowTypes : [''];
      let speedList = this.selectSpeedTypes.length ? this.selectSpeedTypes : [''];
      let resultArr = combine([typeList, speedList]);
      let classifyList = [];
      resultArr.forEach((resultItem) => {
        //新建空对象，依次赋值, 建立最终类型数组
        let tempObj = {};
        if (resultItem[0]) {
          tempObj['speed'] = resultItem[0];
        }
        if (resultItem[1]) {
          tempObj['type'] = resultItem[1];
        }
        if (Object.getOwnPropertyNames(tempObj).length) {
          classifyList.push(tempObj);
        }
      });
      this.classifyTypeList = classifyList;
      if (!classifyList.length) {
        this.datas = [
          {
            groupType: {},
            children: cloneDeep(datum),
            isOpen: true,
          },
        ];
        return false;
      }
      let groupList = [];

      /* 遍历每一个类型对象，并筛选对应的行，添加到每一个甘特组的children里*/
      classifyList.forEach((classifyItem) => {
        let tempObj = Object.assign({}, classifyItem);
        tempObj['children'] = [];
        let blockRowList = cloneDeep(this.showRowList);
        for (let filterKey in classifyItem) {
          blockRowList = blockRowList.filter((bridgeItem) => {
            if (filterKey === 'speed') {
              let speedLimit = classifyItem[filterKey].split('~');
              if (speedLimit.length === 2) {
                return bridgeItem.speed >= speedLimit[0] && bridgeItem.speed < speedLimit[1];
              } else {
                return bridgeItem.speed >= speedLimit[0];
              }
            }
            return bridgeItem[filterKey] == classifyItem[filterKey];
          });
        }
        blockRowList.forEach((item, index) => {
          // 遍历每一行生成一个rawIndex属性，这个属性用来计算每一行的top值
          item.rawIndex = index;
        });
        tempObj['children'] = blockRowList;
        tempObj['groupType'] = classifyItem;
        tempObj['isOpen'] = true;
        groupList.push(tempObj);
      });
      this.datas = groupList;
      this.classifyDialogVisible = false;
    },
  },
};
</script>
<style scoped>
/* .bb { */
/* background-color: #747e80; */
/* } */
</style>
