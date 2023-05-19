<script setup>
import { nextTick, ref, watch } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import {
  getUseDoricInput,
  getUseDoricOutput,
  getWorkspaceShape,
  setWorkspace,
  insertColumn,
  addWidget as addDoricWidget,
  removeWidget as removeDoricWidget,
  injectWorkspaceState,
  sharedParameters,
} from '@/store/doric'

const props = defineProps({
  widgets: {
    type: Object,
    required: true,
  },
  workspace: {
    type: Object,
    required: true,
  },
  initialState: {
    type: Object,
    required: false,
    default: () => ({}),
  },
})

const emit = defineEmits(['setSharedParameters'])

import DoricWidgetConfig from '@/components/DoricWidgetConfig.vue';
import DoricMissingWidget from '@/components/DoricMissingWidget.vue';

const loadingWorkspace = ref(false)
const configWidget = ref(false)
const showWidgetsToAddColumn = ref(-1)

watch(() => props.workspace, (newWorkspace) => {
  if (!newWorkspace) {
    return
  }
  loadingWorkspace.value = true
  configWidget.value = false
  showWidgetsToAddColumn.value = -1
  setWorkspace(newWorkspace).then(() => {
    loadingWorkspace.value = false
  })
})

watch(sharedParameters, (newSharedParameters, oldSharedParameters) => {
  emit("setSharedParameters", newSharedParameters, oldSharedParameters)
})

watch(() => props.initialState, (newInitialState) => {
  if (!newInitialState) {
    return
  }
  const waitForWorkspace = () => {
    if (loadingWorkspace.value) {
      nextTick(waitForWorkspace)
      return
    }
    injectWorkspaceState(newInitialState)
  }
  nextTick(waitForWorkspace)
})

const configureWidget = (widgetId) => {
  if (configWidget.value === widgetId) {
    configWidget.value = false
    return
  }
  showWidgetsToAddColumn.value = -1
  configWidget.value = widgetId
}

const removeWidget = (widgetId) => {
  configWidget.value = false
  removeDoricWidget(widgetId)
}

const setColumnToAddWidget = (column) => {
  if (showWidgetsToAddColumn.value === column) {
    showWidgetsToAddColumn.value = -1
    return
  }
  configWidget.value = false
  showWidgetsToAddColumn.value = column
}

const addWidget = (widgetType, column) => {
  addDoricWidget({
    id: widgetType.replace("-widget", "-0"),
    type: widgetType,
  }, column)
  showWidgetsToAddColumn.value = -1
}
</script>

<template>
  <div class="doric-widget-framework">
    <splitpanes>
      <pane min-size="20" v-for="(column, index) in getWorkspaceShape()" :key="index"
        :size="100 / getWorkspaceShape().length">
        <div v-for="(widget) in column" :key="widget.id" class="doric-widget-framework__widget"
          :class="{ 'config-mode': configWidget === widget.id }">
          <header>
            <span>
              {{ !configWidget ? widget.label : widget.id }}
            </span>
            <span class="config-button" v-show="!configWidget || configWidget === widget.id">
              <button v-if="widget?.type in widgets && 'widget' in widgets[widget.type]"
                @click="() => configureWidget(widget.id)">configure</button>
              <button @click="() => removeWidget(widget.id)">X</button>
            </span>
          </header>
          <div v-if="configWidget === widget.id">
            <DoricWidgetConfig :widgetId="widget.id" />
          </div>
          <div :class="{ 'hidden': configWidget === widget.id }">
            <component v-if="widget?.type in widgets && 'widget' in widgets[widget.type]"
              :is="widgets[widget.type].widget" :useDoricOutput="param => getUseDoricOutput(widget.id, param)"
              :useDoricInput="(param, options) => getUseDoricInput(widget.id, param, options)" />
            <DoricMissingWidget :type="widget?.type" v-else />
          </div>
        </div>
        <div class="add-widget">
          <div>
            <button v-if="showWidgetsToAddColumn === -1" @click="() => setColumnToAddWidget(index)">
              +
            </button>
            <button v-else-if="showWidgetsToAddColumn === index" @click="() => setColumnToAddWidget(-1)">
              x
            </button>
          </div>
          <div v-show="showWidgetsToAddColumn === index" class="add-widget-list">
            <button v-for="(widgetType) in Object.keys(widgets)" :key="widgetType"
              @click="() => addWidget(widgetType, index)">
              {{ widgets[widgetType].defaultLabel }}
            </button>
          </div>
        </div>
      </pane>
    </splitpanes>
    <div class="column-insert"><button @click="insertColumn(getWorkspaceShape().length)">+</button></div>
  </div>
</template>

<style lang="scss" scoped>
.doric-widget-framework {
  display: flex;
  flex-direction: row;
  margin: 0 0.1rem;

  .doric-widget-framework__widget {
    border: 1px solid #000;
    border-radius: 3px;
    margin: 0.2rem;

    &.config-mode {
      border-color: orange;
    }

    header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      background-color: #eee;
      padding: 0.5rem;
    }

    >div {
      padding: 0.5rem;
    }

    .hidden {
      display: none;
    }
  }

  .add-widget {
    display: flex;
    flex-direction: column;
    align-items: center;

    .add-widget-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #eee;
      padding: 0.5rem;
      margin: 0.2rem;
      border: 1px solid #000;
      border-radius: 3px;

      button {
        margin: 0.2rem;
      }
    }
  }
}

.config-button {
  button {
    cursor: pointer;
  }
}
</style>

<style lang="scss" global>
.splitpanes--vertical>.splitpanes__splitter {
  box-sizing: border-box;
  width: 12px;
  margin: 0 1px;
  border-left: 4px solid #fff;
  border-right: 4px solid #fff;
  background-color: #f8f8f8;

  &:hover {
    background-color: #ccc;
  }
}
</style>