<template>
  <div id="codeDisplayDiv" @resize="resizeCodeDisplay">
    <div id="leftBlock">
      <div id="langDisplayDiv">{{ param.lang }}</div>
      <div id="pyCodeOutputDiv">
        <pre id="display-code" class="line-numbers linkable-line-numbers code-body"><code
            class="language-python">{{ data.code }}</code>
        </pre>
      </div>
      <div id="footer">
        <div id="rawUserInputDiv" class="input-wrapper">
          <span id="userInputPromptStr"/>
          <a-textarea id="raw_input_textbox" :cols="60" :rows="1"
                      placeholder=">> 标准输入流">
          </a-textarea>
        </div>
        <div id="errorOutput" class="input-wrapper">
          <a-textarea class="annotationText" id="stepAnnotationEditor" :cols="60" :rows="1"
                      placeholder="<< 错误输出流" readonly>

          </a-textarea>
        </div>
        <div id="stepAnnotationDiv" class="input-wrapper">
          <div class="annotationText" id="stepAnnotationViewer"></div>
        </div>
        <div id="progOutputs" class="input-wrapper">
          <a-textarea id="pyStdout" :cols="40" :rows="3"
                      placeholder="<< 标准输出流" readonly>
          </a-textarea>
        </div>


        <div id="editCodeLinkDiv" style="display: none"><a id="editBtn">编辑代码(待开发)</a>
          <span id="liveModeSpan" style="display: none;">| <a id="editLiveModeBtn" href="#">在线编程(待开发)</a></span>
        </div>
        <div id="legendDiv">
          <svg id="prevLegendArrowSVG" class="arrow-svg">
            <polygon :points="arrowLinesStyle.SVG_ARROW_POLYGON"
                     :fill="arrowLinesStyle.lightArrowColor"></polygon>
          </svg>
          上一次执行的行
          <span class="break"></span>
          <svg id="curLegendArrowSVG" class="arrow-svg">
            <polygon :points="arrowLinesStyle.SVG_ARROW_POLYGON"
                     :fill="arrowLinesStyle.darkArrowColor"></polygon>
          </svg>
          当前执行的行
        </div>
        <div id="executionSliderDocs">
          单击代码行以设置断点。
          使用 [ &lt; 后退 ] 和 [ 前进 &gt; ] 以到达断点所在行。
        </div>
        <div id="executionSlider">
          <a-slider v-model:value="info.step.stepPointer" :min="1" :max="info.step.totalStep"
                    @change="renderStep"/>
          <div id="executionSliderFooter"></div>
        </div>
        <div id="vcrControls">
          <a-button id="jmpFirstInstr" class="ctrlBtn" type="primary" size="small"
                    @click="renderFirst"
          >&lt;&lt; 首行
          </a-button>
          <a-button id="jmpStepBack" class="ctrlBtn" type="plain" size="small"
                    @click="stepBack"
                    :disabled="info.step.curStep === 1"
          >&lt; 后退
          </a-button>
          <span id="curInstr">第 {{ info.step.curStep }} 步 / 共 {{ info.step.totalStep }} 步</span>
          <a-button id="jmpStepFwd" class="ctrlBtn" type="plain" size="small"
                    @click="stepForward"
                    :disabled="info.step.curStep === info.step.totalStep"
          >前进 &gt;
          </a-button>
          <a-button id="jmpLastInstr" class="ctrlBtn" type="primary" size="small"
                    @click="renderLast"
          >末行 &gt;&gt;
          </a-button>
        </div>
        <div style="font-size: 8pt; margin-bottom: 20px;">可视化使用
          <a href="http://pythontutor.com" target="_blank"
             style="color: #3D58A2;">Online Python
            Tutor</a>
          by <a href="http://www.pgbovine.net/" target="_blank" style="color: #3D58A2;">Philip Guo</a>
        </div>
      </div>
    </div>
    <div id="rightBlock">
      <RelationGraph></RelationGraph>
      <div id="annotateLinkDiv" style="display: none">
        <button id="annotateBtn" type="button">Annotate this step</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ExecutionVisualizer"
}
</script>
<script setup>
import {onMounted, reactive} from "vue";
import Prism from "prismjs"
import RelationGraph from "@/components/RelationGraph";


// eslint-disable-next-line no-unused-vars
let data = {
  code: "class TreeNode:\n" +
      "\n" +
      "    def __init__(self, val, left=None, right=None):\n" +
      "        self.val = val\n" +
      "        self.left = left\n" +
      "        self.right = right\n" +
      "\n" +
      "\n" +
      "node1 = TreeNode(0, TreeNode(1), TreeNode(2))",
  trace: []
};
const arrowLinesStyle = {
  SVG_ARROW_POLYGON: "0,3 12,3 12,0 18,5 12,10 12,7 0,7",
  lightArrowColor: "#c9e6ca",
  darkArrowColor: "#e93f34"
}
let param = {
  lang: "Python3",
  highlightLines: false
}
let info = reactive({
  step: {
    pastStep: 1,
    curStep: 1,
    totalStep: 17,
    stepPointer: 1
  }
});

/**
 * 重设代码块大小
 */
function resizeCodeDisplay() {

}

/**
 * 渲染指定步的代码
 */
function renderStep() {
  if (info.step.curStep === info.step.stepPointer) {
    return;
  }
  info.step.pastStep = info.step.curStep;
  info.step.curStep = info.step.stepPointer;
  // TODO 渲染步
}

function renderFirst() {
  info.step.stepPointer = 1;
  renderStep();
}

function renderLast() {
  info.step.stepPointer = info.step.totalStep;
  renderStep();
}

function stepForward() {
  info.step.stepPointer++;
  renderStep();
}

function stepBack() {
  info.step.stepPointer--;
  renderStep();
}

onMounted(() => {
  Prism.highlightAll();
})
</script>

<style scoped>
#codeDisplayDiv {
  display: flex;
  margin: 2px;
  padding: 6px 2px;
  border: solid #b3d4fc 5px;
  border-radius: 15px;
  height: auto;
  min-height: 100%;
}

#leftBlock {
  width: 50%;
  padding: 6px;

  display: flex;
  flex-flow: column;

  font-size: 14px;
}

/*左块下样式*/
#langDisplayDiv {
  width: auto;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-size: 16px;
}

/*code显示中样式*/
#pyCodeOutputDiv {
  width: auto;
  line-height: 18px;
}

#display-code {
  background-color: white;
  border-radius: 5px;
  border: solid rgba(0, 0, 0, 0.15) 2px;
}


/*脚注样式*/
#footer {
  width: 100%;
  margin: 0 auto;
}

.input-wrapper {
  margin: 5px 0;
}

#editCodeLinkDiv {
  line-height: 18px;
  height: 18px;
  width: 100%;
}

#legendDiv {
  line-height: 18px;
  height: 18px;
  width: 100%;

  margin: 5px
}

.arrow-svg {
  width: 18px;
  height: 10px;
  margin: 0 3px;
}

.break {
  margin: 0 15px;
}

#executionSlider {

}

.ctrlBtn {
  width: 65px;
  margin: 0 2px;
}

#curInstr {
  margin: 0 25px;
}

#rightBlock {
  width: 50%;

  display: flex;
  flex-flow: column;
}


</style>