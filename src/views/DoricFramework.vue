<script setup>
import { onMounted } from 'vue'
import {
  getUseDoricInput,
  getUseDoricOutput,
  workspace,
  setWorkspace,
} from '@/store/doric'
import * as predefinedWorkspaces from "@/store/workspaces"

import TextDisplayWidget from '@/components/widgets/TextDisplayWidget.vue'
import PassageRefWidget from '@/components/widgets/PassageRefWidget.vue'
import DictionaryWidget from '@/components/widgets/DictionaryWidget.vue'

const widgetMap = {
  "text-display-widget": TextDisplayWidget,
  "passage-ref-widget": PassageRefWidget,
  "dictionary-widget": DictionaryWidget,
}

onMounted(() => {
  setWorkspace(predefinedWorkspaces["defaultWorkspace"])
})

const workspaceSelected = (event) => {
  setWorkspace(predefinedWorkspaces[event.target.value])
}
</script>

<template>
  <div class="nav">
    <select @change="(e) => workspaceSelected(e)">
      <option :key="key" v-for="key in Object.keys(predefinedWorkspaces)">{{ key }}</option>
    </select>
  </div>

  <div class="doric-widget-framework">
    <div class="doric-widget-framework__column" v-for="(column, index) in workspace()" :key="index">
      <div v-for="(widget) in column" :key="widget.id">
        <component :is="widgetMap[widget.type]" :useDoricOutput="param => getUseDoricOutput(widget.id, param)"
          :useDoricInput="param => getUseDoricInput(widget.id, param)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.doric-widget-framework {
  display: flex;
  flex-direction: row;

  >.doric-widget-framework__column {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    >div {
      border: 1px solid #000;
      margin: 5px;
      padding: 5px;
    }
  }
}

.nav {
  display: flex;
  flex-direction: row;
  justify-content: end;
}
</style>
