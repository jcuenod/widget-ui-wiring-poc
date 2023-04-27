<script setup>
import { ref, onMounted } from 'vue'
import {
  getUseDoricInput,
  getUseDoricOutput,
  getWorkspaceShape,
  setWorkspace,
  removeWidget as removeDoricWidget,
  addWidget as addDoricWidget,
} from '@/store/doric'

import DoricWidgetConfig from '@/components/DoricWidgetConfig.vue';
import widgets from '@/components/doric-widgets/Widgets.ts';
import * as predefinedWorkspaces from "@/store/workspaces"

const configWidget = ref(false)

onMounted(() => {
  setWorkspace(predefinedWorkspaces["defaultWorkspace"])
})
const workspaceSelected = (event) => {
  configWidget.value = false
  setWorkspace(predefinedWorkspaces[event.target.value])
}
const configure = (widgetId) => {
  if (configWidget.value === widgetId) {
    configWidget.value = false
    return
  }
  configWidget.value = widgetId
}
const removeWidget = (widgetId) => {
  configWidget.value = false
  removeDoricWidget(widgetId)
}
const addWidget = (column) => {
  console.log('add widget', column)
  addDoricWidget({
    id: "new-widget",
    type: "text-display-widget",
  }, column)
}
</script>

<template>
  <div class="nav">
    <select @change="(e) => workspaceSelected(e)">
      <option :key="key" v-for="key in Object.keys(predefinedWorkspaces)">{{ key }}</option>
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
            <button @click="() => configure(widget.id)">configure</button>
            <button @click="() => removeWidget(widget.id)">X</button>
          </span>
        </header>
        <div v-if="configWidget === widget.id">
          <DoricWidgetConfig :widgetId="widget.id" />
        </div>
        <div v-else>
          <component :is="widgets[widget.type].widget" :useDoricOutput="param => getUseDoricOutput(widget.id, param)"
            :useDoricInput="param => getUseDoricInput(widget.id, param)" />
        </div>
      </div>
      <div class="add-widget">
        <button @click="addWidget(index)">
          +
        </button>
      </div>
    </div>
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
    }

    .add-widget {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }
  }
}

.nav {
  display: flex;
  flex-direction: row;
  justify-content: end;
}

.config-button {
  button {
    cursor: pointer;
  }
}
</style>
