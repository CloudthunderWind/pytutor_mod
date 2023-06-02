<template>
  <div id="codeDisplayDiv" @resize="resizeCodeDisplay">
    <div id="leftBlock">
      <div id="langDisplayDiv">
        {{ lang }}
        <a class="edit" @click="switchEditMode">{{ editable ? '执行代码' : '编辑代码' }}</a>
      </div>
      <div id="pyCodeOutputDiv">
        <pre id="display-code" class="line-numbers linkable-line-numbers code-area" v-show="!editable"><code
            class="language-python">{{ code }}</code>
        </pre>
        <a-textarea class="code-area" v-show="editable" v-model:value="code" autoSize></a-textarea>
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
          <a :href="'#display-code.'+pastLine">第{{ pastLine }}行</a>
          <span class="break"></span>
          <svg id="curLegendArrowSVG" class="arrow-svg">
            <polygon :points="arrowLinesStyle.SVG_ARROW_POLYGON"
                     :fill="arrowLinesStyle.darkArrowColor"></polygon>
          </svg>
          当前执行的行
          <a :href="'#display-code.'+curLine">第{{ curLine }}行</a>
        </div>
        <div>当前断点列表: {{ breakpoints }}</div>
        <div id="executionSliderDocs">
          单击按钮以设置/取消断点。
          使用 [ &lt; 后退 ] 和 [ 前进 &gt; ] 以后退/前进；或使用 [ 前进 &gt; ] 到达下一个断点所在行。
        </div>
        <div id="executionSlider">
          <a-slider v-model:value="stepPointer" :min="1" :max="trace.length - 1"
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
                    :disabled="curStep === 1"
          >&lt; 后退
          </a-button>
          <a-button class="ctrlBtn" type="plain" size="small" danger @click="deleteBreakpoint">
            取消断点
          </a-button>
          <span id="curInstr">第 {{ curStep }} 步 / 共 {{ trace.length - 1 }} 步</span>
          <a-button class="ctrlBtn" type="primary" size="small" danger @click="addBreakpoint">
            设为断点
          </a-button>
          <a-button id="jmpStepFwd" class="ctrlBtn" type="plain" size="small"
                    @click="stepForward"
                    :disabled="curStep === trace.length - 1"
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
      <RelationGraph ref="relationGraphInstance"></RelationGraph>
      <div id="annotateLinkDiv" style="display: none">
        <button id="annotateBtn" type="button">Annotate this step</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ExecutionVisualizer"
};
</script>

<script setup>
import {onBeforeMount, onMounted, provide, reactive, ref} from "vue";
import Prism from "prismjs";
import RelationGraph from "@/components/RelationGraph";
import {getTraceAPI, runCodeAndGetTraceAPI} from "@/api/traceAPI";

const arrowLinesStyle = {
  SVG_ARROW_POLYGON: "0,3 12,3 12,0 18,5 12,10 12,7 0,7",
  lightArrowColor: "#c9e6ca",
  darkArrowColor: "#e93f34"
};
const relationGraphInstance = ref();

const code = ref("");
const trace = reactive([]);

const lang = ref("Python3");
const editable = ref(false);

const breakpoints = reactive([]);
const nextBreakpoint = ref(1);

const pastStep = ref(1);
const curStep = ref(1);
const stepPointer = ref(1);

const pastLine = ref(-1);
const curLine = ref(1);

provide("trace", trace);
provide("curStep", curStep);

function switchEditMode() {
  if (editable.value) {
    runCodeAndGetTraceAPI(code.value).then((value) => {
      trace.length = 0;
      trace.push(...value["trace"]);
      relationGraphInstance.value.renderCurStep();
      resetStep();
    }).then(() => {
      Prism.highlightAll();
    });
  }
  editable.value = !editable.value;
}

function resetStep() {
  pastStep.value = 1;
  curStep.value = 1;
  stepPointer.value = 1;

  pastLine.value = -1;
  curLine.value = trace[curStep.value - 1]["line"];
  nextBreakpoint.value = -1;
}

/**
 * 重设代码块大小
 */
function resizeCodeDisplay() {

}

/**
 * 渲染指定步的代码
 */
function renderStep() {
  if (curStep === stepPointer) {
    return;
  }
  pastStep.value = curStep.value;
  curStep.value = stepPointer.value;
  pastLine.value = curLine.value;
  curLine.value = trace[curStep.value - 1]["line"];
  window.location.assign("#display-code." + curLine.value);
  toNextBreakpoint();
  relationGraphInstance.value.renderCurStep();
}

function renderFirst() {
  stepPointer.value = 1;
  renderStep();
}

function renderLast() {
  stepPointer.value = trace.length - 1;
  renderStep();
}

function stepForward() {
  if (nextBreakpoint.value > -1) {
    if (stepPointer.value < trace.length - 1) {
      stepPointer.value++;
      while (stepPointer.value < trace.length - 1 && trace[stepPointer.value - 1]["line"] !== nextBreakpoint.value) {
        stepPointer.value++;
      }
    }
  } else {
    stepPointer.value++;
  }
  renderStep();
}

function stepBack() {
  stepPointer.value--;
  renderStep();
}

function addBreakpoint() {
  let loc = breakpoints.indexOf(curLine.value);
  if (loc === -1) {
    breakpoints.push(curLine.value);
    breakpoints.sort();
    toNextBreakpoint();
  }
}

function deleteBreakpoint() {
  let loc = breakpoints.indexOf(curLine.value);
  if (loc > -1) {
    breakpoints.splice(loc, 1);
    toNextBreakpoint();
  }
}

function toNextBreakpoint() {
  let i = breakpoints.indexOf(curLine.value);
  // 当前行不在断点列表
  if (i === -1) {
    for (i = 0; i < breakpoints.length; i++) {
      if (breakpoints[i] > curLine.value) {
        nextBreakpoint.value = breakpoints[i];
        break;
      }
    }
  } else {
    nextBreakpoint.value = breakpoints[(i + 1) % breakpoints.length];
  }

}


onBeforeMount(() => {
  getTraceAPI().then((value) => {
    code.value = value["code"]["main_code"];
    trace.length = 0;
    trace.push(...value["trace"]);
    relationGraphInstance.value.renderCurStep();
    resetStep();
  }).then(() => {
    Prism.highlightAll();
  });
});

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

.edit {
  margin: 0 12px;
  cursor: pointer;
  font-size: 13px;
}

/*code显示中样式*/
#pyCodeOutputDiv {
  width: auto;
  line-height: 18px;
}

#display-code {

}

.code-area {
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
  width: 75px;
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