<template>
  <div class="box">
    <div class="box-header">
      <div>{{ startTime }}</div>
      <div>{{ endTime }}</div>
    </div>
    <div class="seder">
      <div class="seder-left">
        <div v-for="(item, index) in siderList" :key="index">
          <div class="seder-left-item">{{ item }}</div>
        </div>
      </div>
      <div id="container"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { Graph, Shape } from '@antv/x6';
import { Stencil } from '@antv/x6-plugin-stencil';
import { Transform } from '@antv/x6-plugin-transform';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { History } from '@antv/x6-plugin-history';
import insertCss from 'insert-css';

const startTime = ref('2012-02-21 12:12:12'); // 开始时间
const endTime = ref('2012-02-28 12:12:12'); // 结束时间

const siderList = ref(['卫星1', '卫星2', '卫星3', '卫星4', '卫星5', '卫星6', '卫星7']);

// 使用 CDN 引入时暴露了 X6 全局变量
// const { Graph } = X6
const data = reactive({
  // 节点
  nodes: [
    {
      id: 'node1', // String，可选，节点的唯一标识
      x: 80, // Number，必选，节点位置的 x 值
      y: 20, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'hello', // String，节点标签
    },
    {
      id: 'node2', // String，节点的唯一标识
      x: 200, // Number，必选，节点位置的 x 值
      y: 20, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'world', // String，节点标签
    },
    {
      id: 'node3', // String，节点的唯一标识
      x: 300, // Number，必选，节点位置的 x 值
      y: 20, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node4', // String，节点的唯一标识
      x: 400, // Number，必选，节点位置的 x 值
      y: 20, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node5', // String，节点的唯一标识
      x: 500, // Number，必选，节点位置的 x 值
      y: 20, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node6', // String，节点的唯一标识
      x: 80, // Number，必选，节点位置的 x 值
      y: 80, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node7', // String，节点的唯一标识
      x: 200, // Number，必选，节点位置的 x 值
      y: 80, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },

    {
      id: 'node8', // String，节点的唯一标识
      x: 300, // Number，必选，节点位置的 x 值
      y: 80, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node9', // String，节点的唯一标识
      x: 400, // Number，必选，节点位置的 x 值
      y: 80, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node10', // String，节点的唯一标识
      x: 500, // Number，必选，节点位置的 x 值
      y: 80, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node11', // String，节点的唯一标识
      x: 600, // Number，必选，节点位置的 x 值
      y: 80, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node12', // String，节点的唯一标识
      x: 80, // Number，必选，节点位置的 x 值
      y: 140, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node13', // String，节点的唯一标识
      x: 200, // Number，必选，节点位置的 x 值
      y: 140, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },

    {
      id: 'node14', // String，节点的唯一标识
      x: 300, // Number，必选，节点位置的 x 值
      y: 140, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node15', // String，节点的唯一标识
      x: 400, // Number，必选，节点位置的 x 值
      y: 140, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node16', // String，节点的唯一标识
      x: 500, // Number，必选，节点位置的 x 值
      y: 140, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node17', // String，节点的唯一标识
      x: 600, // Number，必选，节点位置的 x 值
      y: 200, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node8', // String，节点的唯一标识
      x: 80, // Number，必选，节点位置的 x 值
      y: 200, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node19', // String，节点的唯一标识
      x: 200, // Number，必选，节点位置的 x 值
      y: 200, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },

    {
      id: 'node20', // String，节点的唯一标识
      x: 300, // Number，必选，节点位置的 x 值
      y: 200, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node21', // String，节点的唯一标识
      x: 400, // Number，必选，节点位置的 x 值
      y: 200, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node22', // String，节点的唯一标识
      x: 500, // Number，必选，节点位置的 x 值
      y: 200, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node23', // String，节点的唯一标识
      x: 600, // Number，必选，节点位置的 x 值
      y: 200, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node24', // String，节点的唯一标识
      x: 80, // Number，必选，节点位置的 x 值
      y: 260, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node25', // String，节点的唯一标识
      x: 200, // Number，必选，节点位置的 x 值
      y: 260, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },

    {
      id: 'node26', // String，节点的唯一标识
      x: 300, // Number，必选，节点位置的 x 值
      y: 260, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node27', // String，节点的唯一标识
      x: 400, // Number，必选，节点位置的 x 值
      y: 260, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node28', // String，节点的唯一标识
      x: 500, // Number，必选，节点位置的 x 值
      y: 260, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node29', // String，节点的唯一标识
      x: 600, // Number，必选，节点位置的 x 值
      y: 260, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node30', // String，节点的唯一标识
      x: 80, // Number，必选，节点位置的 x 值
      y: 320, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node31', // String，节点的唯一标识
      x: 200, // Number，必选，节点位置的 x 值
      y: 320, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },

    {
      id: 'node32', // String，节点的唯一标识
      x: 300, // Number，必选，节点位置的 x 值
      y: 320, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node33', // String，节点的唯一标识
      x: 400, // Number，必选，节点位置的 x 值
      y: 320, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node34', // String，节点的唯一标识
      x: 500, // Number，必选，节点位置的 x 值
      y: 320, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
    {
      id: 'node35', // String，节点的唯一标识
      x: 600, // Number，必选，节点位置的 x 值
      y: 320, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'what are you', // String，节点标签
    },
  ],
  // 边
  edges: [
    {
      source: 'node1', // String，必须，起始节点 id
      target: 'node2', // String，必须，目标节点 id
      label: '关系1',
    },
    {
      source: 'node2',
      target: 'node11',
      label: '关系2',
    },
  ],
});

const graph = ref();
const stencil = ref();
const info = () => {
  graph.value = new Graph({
    container: document.getElementById('container'),
    width: 800,
    height: 300,

    background: {
      color: '#fffbe6', // 设置画布背景颜色
    },
    grid: {
      size: 10, // 网格大小 10px
      visible: true, // 渲染网格背景
    },
  });
  graph.value.fromJSON(data);
  graph.value.on('cell:mousemove', (evt) => {
    // 一些操作
    console.log(evt, 88);
    if (evt.x >= 850) {
      graph.value.removeCells([evt.cell]);
    }
  });
  stencil.value = new Stencil({
    title: '流程图',
    target: graph,
    stencilGraphWidth: 200,
    stencilGraphHeight: 180,
    collapsable: true,
    groups: [
      {
        title: '基础流程图',
        name: 'group1',
      },
      {
        title: '系统设计图',
        name: 'group2',
        graphHeight: 250,
        layoutOptions: {
          rowHeight: 70,
        },
      },
    ],
    layoutOptions: {
      columns: 2,
      columnWidth: 80,
      rowHeight: 55,
    },
  });
  document.getElementById('left').appendChild(stencil.value.container);
};

setTimeout(() => {
  graph.value
    .use(
      new Transform({
        resizing: true,
        rotating: true,
      })
    )
    .use(
      new Selection({
        rubberband: true,
        showNodeSelectionBox: true,
      })
    )
    .use(new Snapline())
    .use(new Keyboard())
    .use(new Clipboard())
    .use(new History());
  const ports = {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      right: {
        position: 'right',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      bottom: {
        position: 'bottom',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      left: {
        position: 'left',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
    },
    items: [
      {
        group: 'top',
      },
      {
        group: 'right',
      },
      {
        group: 'bottom',
      },
      {
        group: 'left',
      },
    ],
  };

  Graph.registerNode(
    'custom-rect',
    {
      inherit: 'rect',
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
        },
      },
      ports: { ...ports },
    },
    true
  );

  const modelArrG3 = ['目标1', '目标2', '目标3', '目标4'];
  const nodeArrG3 = [];

  modelArrG3.forEach((m) => {
    nodeArrG3.push(
      graph.value.createNode({
        shape: 'custom-rect',
        label: m,
        // attrs: { rx: 20, ry: 26 }
      })
    );
  });

  stencil.value.load(nodeArrG3, 'group1');
  const dList = nodeArrG3;
  const dListDel = [];

  graph.value.on('node:added', (e) => {
    // console.log('node:added, e', e.node.attrs.text)//, 'd1.node', d1, d1.id, d1, d2.id)
    // console.log('node:added, d1', d1.attrs.text)
    dList.forEach((d) => {
      if (d.attrs.text.text === e.node.attrs.text.text) {
        stencil2.unload([d], 'group1');
        dListDel.push(d.attrs.text.text);
      }
    });
  });

  graph.value.on('node:added', (e) => {});
  graph.value.on('cell:mousemove', (e) => {
    if (this.isPress) {
      try {
        console.log(
          'moving:',
          'gow:',
          graph.value.options.width,
          'gow2:',
          graph.value.options.width * this.gscale,
          'gs:',
          this.gscale,
          'ex:',
          e.x,
          'ew:',
          e.node.store.data.size.width
        );
        const n = graph.value.getNodesFromPoint(e.x, e.y);
        console.log('n:', n);
        // if (e.x + e.node.store.data.size.width > graph.value.options.width / this.gscale) {
        console.log(
          'ffff:',
          e.x + e.node.store.data.size.width,
          (e.x + e.node.store.data.size.width) / this.gscale,
          graph.value.options.width / this.gscale
        );
        if (e.x + e.node.store.data.size.width * this.gscale > 950) {
          console.log('yyyyyyyyyyyyy');
          const t = e.node.attrs.text.text;
          const isInDel = dListDel.indexOf(t);
          if (isInDel !== -1) {
            delete dListDel[isInDel];
          }

          const leftList = dList.filter((el) => {
            // console.log('ido', dListDel.indexOf(el.attrs.text.text), dListDel, el.attrs.text.text)
            const notDel = dListDel.indexOf(el.attrs.text.text) === -1;
            return notDel;
          });
          // console.log('leftList:', leftList)
          stencil2.load(leftList, 'group1');
          graph.value.removeCells([e.cell]);
        }
      } catch (err) {
        console.log(err);
      }
    }
  });
}, 1000);

const preWork = () => {
  // 这里协助演示的代码，在实际项目中根据实际情况进行调整
  const container = document.getElementById('container');
  const stencilContainer = document.createElement('div');
  stencilContainer.id = 'stencil';
  const graphContainer = document.createElement('div');
  graphContainer.id = 'graph-container';
  container.appendChild(stencilContainer);
  container.appendChild(graphContainer);

  insertCss(`
    #container {
      display: flex;
      border: 1px solid #dfe3e8;
    }
    #stencil {
      width: 180px;
      position: relative;
      border-right: 1px solid #dfe3e8;
    }
    #graph-container {
      width: calc(100% - 180px);
    }
    .x6-widget-stencil  {
      background-color: #fff;
    }
    .x6-widget-stencil-title {
      background-color: #fff;
    }
    .x6-widget-stencil-group-title {
      background-color: #fff !important;
    }
    .x6-widget-transform {
      margin: -1px 0 0 -1px;
      padding: 0px;
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div {
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div:hover {
      background-color: #3dafe4;
    }
    .x6-widget-transform-active-handle {
      background-color: #3dafe4;
    }
    .x6-widget-transform-resize {
      border-radius: 0;
    }
    .x6-widget-selection-inner {
      border: 1px solid #239edd;
    }
    .x6-widget-selection-box {
      opacity: 0;
    }
  `);
};

onMounted(() => {
  info();
  preWork();
});
// #region 初始化 stencil
</script>

<style lang="scss" scoped>
.box {
  display: flex;
  // margin: 20px 10px 30px 30px;
  height: 335px;
  padding: 10px;
  flex-direction: column;
  overflow: hidden;

  .box-header {
    width: 800px;
    display: flex;
    justify-content: space-between;
    margin-left: 50px;
    margin-bottom: 10px;
  }
}
.seder {
  display: flex;
  overflow-y: auto;

  .seder-left {
    display: flex;
    flex-direction: column;
    margin-right: 10px;
    margin-top: 30px;

    .seder-left-item {
      margin-bottom: 40px;
    }
  }
}
</style>
