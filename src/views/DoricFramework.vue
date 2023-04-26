<script setup>
import { ref, onMounted } from 'vue'
import {
  getUseDoricInput,
  getUseDoricOutput,
  workspaceShape,
  setWorkspace,
  getWidget,
  getWidgetIds,
} from '@/store/doric'
import widgets from '@/components/widgets/Widgets';
import * as predefinedWorkspaces from "@/store/workspaces"

const configMode = ref(false)
const configWidget = ref(-1)

onMounted(() => {
  setWorkspace(predefinedWorkspaces["defaultWorkspace"])
})
const workspaceSelected = (event) => {
  setWorkspace(predefinedWorkspaces[event.target.value])
}
const configure = (widgetId) => {
  configMode.value = !configMode.value
  if (!configMode.value) return
  configWidget.value = widgetId
  // const newLabel = prompt('Give the widget a new label')
  // const widget = getWidget(widgetId)
  // widget.label = newLabel
  // console.log(widget)
}
</script>

<template>
  <div class="nav">
  <select @change="(e) => workspaceSelected(e)">
    <option :key="key" v-for="key in Object.keys(predefinedWorkspaces)">{{ key }}</option>
  </select>
</div>

<div class="doric-widget-framework">
  <div class="doric-widget-framework__column" v-for="(column, index) in workspaceShape()" :key="index">
    <div class="doric-widget-framework__widget" v-for="(widget) in column" :key="widget.id">
      <header>
          <span>
            {{ configMode ? widget.id : widget.label }}
          </span>
          <span class="config-button" v-show="!configMode || configWidget === widget.id">
            <button @click="() => configure(widget.id)">
              configure
            </button>
            <!-- <button>
                                                                                                  X
                                                                                                </button> -->
          </span>
        </header>
        <div v-if="(configMode && configWidget === widget.id)">
          <div>
            Label: <input v-model="widget.label" />
          </div>
          <div>
            Inputs
            <div>
              <pre>

                  {{ JSON.stringify(getWidget(widget.id), null, 2) }}
                </pre>
              <!-- <div v-for="(input, index) in widget.inputs" :key="index">
                        <div>
                          <span>{{ input.label }}</span>
                          <span>
                            <select v-model="input.type">
                              <option :key="key" v-for="key in Object.keys(widgets)">{{ key }}</option>
                            </select>
                          </span>
                        </div>
                      </div> -->
            </div>
          </div>
        </div>
        <div v-else>
          <component :is="widgets[widget.type].widget" :useDoricOutput="param => getUseDoricOutput(widget.id, param)"
            :useDoricInput="param => getUseDoricInput(widget.id, param)" />
        </div>
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

    >.doric-widget-framework__widget {
      border: 1px solid #000;
      border-radius: 3px;
      margin: 0.2rem;

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
  }
}

.nav {
  display: flex;
  flex-direction: row;
  justify-content: end;
}
</style>
