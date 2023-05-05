<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  getUseDoricInput,
  getUseDoricOutput,
  getWorkspaceShape,
  setWorkspace,
  insertColumn,
  getWidgetIds,
  getWidget,
  addWidget as addDoricWidget,
  removeWidget as removeDoricWidget,
} from '@/store/doric'
import { useRouter } from 'vue-router'
const router = useRouter()

import DoricWidgetConfig from '@/components/DoricWidgetConfig.vue';
import widgets from '@/components/doric-widgets/Widgets.ts';
import workspaces from "@/store/workspaces"

const activeWorkspace = ref(null)
const configWidget = ref(false)
const showWidgetsToAddColumn = ref(-1)

onMounted(() => {
  // We need the workspace to be set up before we can populate the widget inputs
  router.isReady().then(() => {
    const currentWorkspace = router.currentRoute.value.query.workspace || "default"
    activeWorkspace.value = currentWorkspace
  })
})

watch(activeWorkspace, (newActiveWorkspace) => {
  if (!newActiveWorkspace || !(newActiveWorkspace in workspaces)) {
    return
  }
  configWidget.value = false
  showWidgetsToAddColumn.value = -1
  setWorkspace(workspaces[newActiveWorkspace]).then(() => {
    const widgetIds = new Set(getWidgetIds())
    const workspaceState = Object.entries(router.currentRoute.value.query)
    workspaceState.forEach(([scopedKey, value]) => {
      const [widgetId, key] = scopedKey.split('.')
      if (!widgetIds.has(widgetId)) {
        return
      }
      const widget = getWidget(widgetId)
      if (!(key in widget.inputs)) {
        return
      }
      widget.inputs[key].value = value
    })
  })
  router.isReady().then(() => {
    router.push({
      query: {
        ...router.currentRoute.value.query,
        workspace: newActiveWorkspace,
      }
    })
  })
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
  <div class="nav">
    <select v-model="activeWorkspace">
      <option :key="key" v-for="key in Object.keys(workspaces)">{{ key }}</option>
    </select>
  </div>

  <div class="doric-widget-framework">
    <div class="doric-widget-framework__column" v-for="(column, index) in getWorkspaceShape()" :key="index">
      <div class="doric-widget-framework__widget" :class="{ 'config-mode': configWidget === widget.id }"
        v-for="(widget) in column" :key="widget.id">
        <header>
          <span>
            {{ !configWidget ? widget.label : widget.id }}
          </span>
          <span class="config-button" v-show="!configWidget || configWidget === widget.id">
            <button @click="() => configureWidget(widget.id)">configure</button>
            <button @click="() => removeWidget(widget.id)">X</button>
          </span>
        </header>
        <div v-if="configWidget === widget.id">
          <DoricWidgetConfig :widgetId="widget.id" />
        </div>
        <div :class="{ 'hidden': configWidget === widget.id }">
          <component :is="widgets[widget.type].widget" :useDoricOutput="param => getUseDoricOutput(widget.id, param)"
            :useDoricInput="(param, options) => getUseDoricInput(widget.id, param, options)" />
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
          <button v-for="(widgetType) in Object.keys(widgets)" :key="widgetType" @click="() => addWidget(widgetType, index)">
            {{ widgets[widgetType].defaultLabel }}
          </button>
        </div>
      </div>
    </div>
    <div class="column-insert"><button @click="insertColumn(getWorkspaceShape().length)">+</button></div>
  </div>
</template>

<style lang="scss" scoped>
.doric-widget-framework {
  display: flex;
  flex-direction: row;
  margin: 0 0.1rem;

  >.doric-widget-framework__column {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;

    >.doric-widget-framework__widget {
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
}

.nav {
  display: flex;
  flex-direction: row;
  justify-content: end;
  padding: 0.5rem;
}

.config-button {
  button {
    cursor: pointer;
  }
}
</style>
