<template>
  <div id="relationGraph"></div>
</template>

<script>
export default {
  name: "RelationGraph"
};
</script>

<script setup>
import * as echarts from "echarts/core";
import {TreeChart, GraphChart} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  TransformComponent
} from "echarts/components";
import {LabelLayout, UniversalTransition} from "echarts/features";
import {SVGRenderer} from "echarts/renderers";
import {inject, onMounted, reactive} from "vue";
//TODO 可以生成一个GraphId但没必要
echarts.use([
  TitleComponent,
  TooltipComponent,
  TransformComponent,
  TreeChart,
  GraphChart,
  LabelLayout,
  UniversalTransition,
  SVGRenderer
]);

let trace = inject("trace");
let curStep = inject("curStep");

let graphData = [];
let graphSeries = [];

// TODO 写一个防止森林中两棵树交叉重叠的方法
// TODO 写一个查找当前对引用某节点的变量的方法，如head= TreeNode(1)，找到名为head的变量

function renderRelationGraph() {
  let myCharts = echarts.getInstanceByDom(document.getElementById("relationGraph"));
  //TODO tooltip formatter要写，标注成<val:节点值, ref:[]引用该节点的变量名称>
  myCharts.clear();
  myCharts.setOption({
    title: {
      text: '数据结构图',
      left: "center"
    },
    tooltip: {
      alwaysShowContent: true
    },
    animation: false,
    series: graphSeries
  });
}

function renderCurStep() {
  // 原本的curStep参数被inject(info)取代，所以都替换成了curStep.value
  // 点号获取属性改成了用[]获取属性，便于直接添加未声明的属性
  // TODO 本来可以用ts interface来规范tempTreeNode，但没配好
  // TODO 现在每渲染一步就要重新构建一次树，是否可以考虑预先把所有的树都构建出来（？
  // TODO 前端使用递归的性能较差，将来可以转到后端或者优化算法
  let traceStepHeap = trace[curStep.value]["heap"];

  let tempTreeNodeList = [];
  for (let count = 1; count <= Object.keys(traceStepHeap).length; count++) {
    if (traceStepHeap[count][0] === 'INSTANCE'
        && traceStepHeap[count][1] === 'TreeNode'
        && traceStepHeap[count].length === 5) {
      // tempTreeNode::<id,val,left,right>
      let tempTreeNode = {};

      tempTreeNode["id"] = count;
      // tempTreeNode["id"] = traceStepHeap[count][4][1];
      tempTreeNode["val"] = traceStepHeap[count][4][1];

      if (traceStepHeap[count][2][1] == null) {
        tempTreeNode["left"] = traceStepHeap[count][2][1];
      } else {
        tempTreeNode["left"] = traceStepHeap[count][2][1][1];
      }

      if (traceStepHeap[count][3][1] == null) {
        tempTreeNode["right"] = traceStepHeap[count][3][1];
      } else {
        tempTreeNode["right"] = traceStepHeap[count][3][1][1];
      }

      tempTreeNodeList.push(tempTreeNode);
    }
  }
  let childList = [];
  for (let count = 0; count < tempTreeNodeList.length; count++) {
    if (tempTreeNodeList[count]["left"] != null)
      childList.push(tempTreeNodeList[count]["left"]);
    if (tempTreeNodeList[count]["right"] != null)
      childList.push(tempTreeNodeList[count]["right"]);
  }
  let rootTreeNodeList = [];
  for (let count = 0; count < tempTreeNodeList.length; count++) {
    if (childList.indexOf(tempTreeNodeList[count]["id"]) === -1)
      rootTreeNodeList.push(tempTreeNodeList[count]);
  }
  let tempGraphData = [];
  for (let count = 0; count < rootTreeNodeList.length; count++) {
    tempGraphData.push(buildTree(rootTreeNodeList[count], tempTreeNodeList));
  }
  graphData = [];
  for (let count = 0; count < tempGraphData.length; count++) {
    graphData.push(reshapeTree(tempGraphData[count]));
  }

  for (let count = 0; count < graphData.length; count++) {
    graphSeries.push(
        {
          type: 'tree',
          symbolSize: 40,
          label: {
            position: 'inside',
            verticalAlign: 'middle',
            align: 'middle',
            fontSize: 12
          },
          lineStyle: {
            curveness: 0
          },
          data: [graphData[count]],
          left: count * 200,
          right: "2%",
          top: "20%",
          orient: "TB",
          initialTreeDepth: "-1",
          tooltip: {}
        }
    );
  }

  renderRelationGraph();
  graphSeries = [];
}

function buildTree(root, list) {
  for (let count = 0; count < list.length; count++) {
    if (root["id"] === list[count]["id"]) {
      if (root["left"] != null) {
        for (let scount = 0; scount < list.length; scount++) {
          if (root["left"] === list[scount]["id"])
            root["left"] = buildTree(list[scount], list);
        }
      }
      if (root["right"] != null) {
        for (let scount = 0; scount < list.length; scount++) {
          if (root["right"] === list[scount]["id"])
            root["right"] = buildTree(list[scount], list);
        }
      }
    }
  }
  return root;
}

function reshapeTree(root) {
  let realRoot = {
    name: String.fromCharCode(root["id"] - 2 + 'A'.charCodeAt() - 1),
    value: root["val"]
  };
  if (root["left"] != null || root["right"] != null) {
    realRoot["children"] = [];
    if (root["left"] != null)
      realRoot["children"].push(reshapeTree(root["left"]));
    if (root["right"] != null)
      realRoot["children"].push(reshapeTree(root["right"]));
  }

  return realRoot;
}

onMounted(() => {
  echarts.init(document.getElementById("relationGraph"), null, {
    renderer: 'svg'
  });
});

defineExpose({renderCurStep});
</script>

<style scoped>
#relationGraph {
  width: 100%;
  height: 75%;
}
</style>