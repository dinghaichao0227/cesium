import { defineStore } from "pinia";
const useState = defineStore('user', {
//@ts-ignore
state: () => {
  return {
    position: '',
    direction: ''
  }
},
  getter: {},
  action: {}
})
export default useState