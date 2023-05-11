<template>
  <div id="relationGraph"></div>
</template>

<script>
export default {
  name: "RelationGraph"
}
</script>

<script setup>
import * as echarts from "echarts/core";
import {TreeChart} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  TransformComponent
} from "echarts/components";
import {LabelLayout, UniversalTransition} from "echarts/features";
import {SVGRenderer} from "echarts/renderers";
import {onMounted} from "vue";
//TODO 可以生成一个GraphId但没必要
echarts.use([
  TitleComponent,
  TooltipComponent,
  TransformComponent,
  TreeChart,
  LabelLayout,
  UniversalTransition,
  SVGRenderer
]);

function initRelationGraph() {
  let myCharts = echarts.init(document.getElementById("relationGraph"), null, {
    renderer: 'svg'
  });
  //TODO tooltip formatter要写
  myCharts.setOption({
    title: {
      text: '数据结构图',
      left: "center"
    },
    tooltip: {
      alwaysShowContent: true
    },
    series: [
      {
        type: 'tree',
        symbolSize: 40,
        label: {
          position: 'inside',
          verticalAlign: 'middle',
          align: 'middle',
          fontSize: 12
        },
        data: [{
          name: "0",
          children: [
            {
              name: "1",
              value: 1
            },
            {
              name: "2",
              value: 2
            }
          ]
        }],
        left: "2%",
        right: "2%",
        top: "20%",
        orient: "TB",
        initialTreeDepth: "-1",
        tooltip: {}
      }
    ]
  })
}

onMounted(() => {
  initRelationGraph();
})
</script>

<style scoped>
#relationGraph {
  width: 100%;
  height: 75%;
}
</style>