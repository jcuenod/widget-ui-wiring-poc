<script setup>
import { nextTick, ref, watch } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import draggable from "vuedraggable";
import {
  getUseDoricInput,
  getUseDoricOutput,
  getWorkspaceShape,
  setWorkspace,
  insertColumn,
  removeColumn,
  addWidget as addDoricWidget,
  removeWidget as removeDoricWidget,
  moveWidget as moveDoricWidget,
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

const handleRearrange = (colIndex, event) => {
  Object.entries(event).forEach(([method, details]) => {
    const widgetId = details.element.id
    const newIndex = details.newIndex
    if (method === "moved" || method === "added") {
      moveDoricWidget(widgetId, colIndex, newIndex)
    }
    // Technically there is also the `method === "removed"`
    // We are not handling it, because we know that when a 
    // widget is "added" by draggable, it is also "removed" 
    // from the previous column
  })
}

const createColumnForWidget = (first, event) => {
  const colIndex = first ? 0 : getWorkspaceShape().length
  insertColumn(colIndex)
  Object.entries(event).forEach(([method, details]) => {
    const widgetId = details.element.id
    if (method === "added") {
      moveDoricWidget(widgetId, colIndex, 0)
    }
  })
}
</script>

<template>
  <div class="doric-widget-framework">
    <draggable class="list-group" :list="[]" group="widgets" @change="createColumnForWidget(true, $event)" itemKey="id">
      <template #item="{ element, index }">
        <!-- This is just a placeholder to receive widgets and create columns on the fly -->
      </template>
    </draggable>
    <splitpanes>

      <pane min-size="20" v-for="(column, index) in getWorkspaceShape()" :key="index"
        :size="100 / getWorkspaceShape().length">
        <div class="column-buttons">
          <button v-if="column.length === 0" @click="() => removeColumn(index)">Remove Column</button>
        </div>

        <draggable class="list-group" :list="column" group="widgets" @change="handleRearrange(index, $event)" itemKey="id"
          handle=".drag-handle">
          <template #item="{ element, index }">
            <div class="doric-widget-framework__widget" :class="{ 'config-mode': configWidget === element.id }">
              <header class="drag-handle">
                <span>
                  {{ !configWidget ? element.label : element.id }}
                </span>
                <span class="config-button" v-show="!configWidget || configWidget === element.id">
                  <button v-if="element?.type in widgets && 'widget' in widgets[element.type]"
                    @click="() => configureWidget(element.id)">configure</button>
                  <button @click="() => removeWidget(element.id)">X</button>
                </span>
              </header>
              <div v-if="configWidget === element.id">
                <DoricWidgetConfig :widgetId="element.id" />
              </div>
              <div :class="{ 'hidden': configWidget === element.id }">
                <component v-if="element?.type in widgets && 'widget' in widgets[element.type]"
                  :is="widgets[element.type].widget" :useDoricOutput="param => getUseDoricOutput(element.id, param)"
                  :useDoricInput="(param, options) => getUseDoricInput(element.id, param, options)" />
                <DoricMissingWidget :type="element?.type" v-else />
              </div>
            </div>
          </template>
        </draggable>


        <div class="column-buttons">
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
    <draggable class="list-group" :list="[]" group="widgets" @change="createColumnForWidget(false, $event)" itemKey="id">
      <template #item="{ element, index }">
        <!-- This is just a placeholder to receive widgets and create columns on the fly -->
      </template>
    </draggable>
    <div class="column-insert"><button @click="insertColumn(getWorkspaceShape().length)">+</button></div>
  </div>
</template>

<style lang="scss" scoped>
.doric-widget-framework {
  display: flex;
  flex-direction: row;
  flex: 1;
  margin: 0 0.1rem;

  .doric-widget-framework__widget {
    border: 1px solid #000;
    border-radius: 3px;
    margin: 0.2rem;

    &.config-mode {
      border-color: orange;
    }

    &.sortable-chosen {
      border: 1px dashed #000;
    }

    header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      background-color: #eee;
      padding: 0.5rem;
      user-select: none;

      &.drag-handle {
        cursor: grab;
      }
    }

    >div {
      padding: 0.5rem;
    }

    .hidden {
      display: none;
    }
  }

  .column-buttons {
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
.splitpanes {
  height: auto;
}

.splitpanes--vertical>.splitpanes__splitter {
  box-sizing: border-box;
  width: 12px;
  margin: 0 1px;
  border-left: 4px solid #fff;
  border-right: 4px solid #fff;
  background-color: #f8f8f8;
  user-select: none;

  &:hover {
    background-color: #ccc;
  }
}
</style>