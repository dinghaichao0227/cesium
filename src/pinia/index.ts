// store.js

import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
    state: () => ({
      filterBlockId: "", // 筛选的甘特块id
      currentBlock: {}, //当前点击的甘特块
      currentRow: {}, //当前点击的甘特行
      cutBlock: {}, //剪切的甘特块
      cutRow: {}, //剪切的甘特行
      targetBlock: {}, //目标甘特块
      targetRow: {}, //目标甘特行
      handleBlock: {}, //右键操作的甘特块
      handleRow: {}, //右键操作的甘特行
      showRowList: [], // 筛选后在界面显示的列数据
      rawRowList: [], // 列原始数据，用于恢复
      showMovedBlock: true, // 是否显示拖拽之前的甘特状态
      showDragConfirm: false // 调整任务时是否显示确认弹窗
    }),
    actions: {
      setFilterBlockId(str:any) {
        this.filterBlockId = str;
      },
      setCurrentBlock(object:any) {
        this.currentBlock = object;
      },
      setCurrentRow(object:any) {
        this.currentRow = object;
      },
      setCutBlock(object:any) {
        this.cutBlock = object;
      },
      setCutRow(object:any) {
        this.cutRow = object;
      },
      setTargetBlock(object:any) {
        this.targetBlock = object;
      },
      setTargetRow(object:any) {
        this.targetRow = object;
      },
      setHandleBlock(object:any) {
        this.handleBlock = object;
      },
      setHandleRow(object:any) {
        this.handleRow = object;
      },
      setShowRowList(object:any) {
        this.showRowList = object;
      },
      setRawRowList(object:any) {
        this.rawRowList = object;
      },
      setShowMovedBlock(bool: any) {
        this.showMovedBlock = bool;
      },
      setShowDragConfirm(bool:any) {
        this.showDragConfirm = bool;
      }
    }
})
