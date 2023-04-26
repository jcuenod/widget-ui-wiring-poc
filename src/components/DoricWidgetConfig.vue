<script setup>
import { defineProps } from 'vue'
import {
  getWidget,
  getWidgetIds,
} from '@/store/doric'

const props = defineProps({
  widgetId: String
})

const widget = getWidget(props.widgetId)
const widgetIds = getWidgetIds()

const updateSubscriptions = (event, key) => {
  const subscriptions = [...widget.subscriptions]
  const sIndex = subscriptions.findIndex(subscription => subscription.key === key)
  const selectedWidgetIds = Array.from(event.target.selectedOptions).map(option => option.value)
  subscriptions[sIndex].widgetSubscriptions = selectedWidgetIds
  widget.subscriptions = subscriptions
}

const updateInput = (event, key) => {
  widget.inputs[key] = event.target.value
}

</script>

<template>
  <div>
    <span class="title">
      Label:
    </span>
    <input v-model="widget.label" />
  </div>
  <div v-if="Object.keys(widget.inputs).length === 0">This widget does not declare any inputs.</div>
  <div v-else>
    <span class="title">
      Configure Inputs:
    </span>
    <div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Subscriptions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="([key, value]) in Object.entries(widget.inputs)" :key="key">
              <td>{{ key }}</td>
              <td>
                <input :placeholder="value" @blur="(event) => updateInput(event, key)" />
              </td>
              <td>
                <select @change="(event) => updateSubscriptions(event, key)" multiple>
                  <option v-for="widgetId in widgetIds"
                    :selected="widget.subscriptions.find(s => s.key === key)?.widgetSubscriptions.includes(widgetId)"
                    :key="widgetId">{{ widgetId }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title {
  font-weight: bold;
  margin-right: 1rem;
}

table {
  width: 100%;

  >thead {
    background-color: #eee;
  }

  select {
    width: 100%;
  }
}
</style>
