<script setup>
import {
  getWidget,
  getWidgetIds,
} from '@/store/doric'

const props = defineProps({
  widgetId: String
})

const widget = getWidget(props.widgetId)
const widgetIds = getWidgetIds()

const toggleSubscription = (event, key) => {
  // Get target checkbox and whether it is checked
  const checkbox = event.target
  const checked = checkbox.checked

  // Get subscriptions and find the subscription for this key
  const subscriptions = [...widget.subscriptions]
  const sIndex = subscriptions.findIndex(subscription => subscription.key === key)

  // Update the subscription's widgetSubscriptions
  const newKeySubscriptions = [...subscriptions[sIndex].widgetSubscriptions]
  if (checked) {
    newKeySubscriptions.push(checkbox.id)
  } else {
    const index = newKeySubscriptions.indexOf(checkbox.id)
    if (index > -1) {
      newKeySubscriptions.splice(index, 1)
    }
  }
  subscriptions[sIndex].widgetSubscriptions = newKeySubscriptions
}
const subscribeToAll = (key) => {
  // Get subscriptions and find the subscription for this key
  const subscriptions = [...widget.subscriptions]
  const sIndex = subscriptions.findIndex(subscription => subscription.key === key)

  // List of all widgets
  const newKeySubscriptions = [...widgetIds]
  subscriptions[sIndex].widgetSubscriptions = newKeySubscriptions
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
                <!-- use checkboxes instead of multi-select -->
                <span v-for="widgetId in widgetIds" :key="widgetId">
                  <input type="checkbox" :id="widgetId"
                    :checked="widget.subscriptions.find(s => s.key === key)?.widgetSubscriptions.includes(widgetId)"
                    @change="(event) => toggleSubscription(event, key)" />
                  <label :for="widgetId">
                    {{ widgetId }}
                  </label>
                </span>
                <button class="wildcard-subscription"
                  v-show="widget.subscriptions.find(s => s.key === key)?.widgetSubscriptions.length === 0"
                  title="Implicit subscription to all widgets" @click="subscribeToAll(key)">✱</button>
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

input[type=checkbox] {
  display: none;

  &+label {
    font-size: x-small;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 2px;
    padding: 0 5px;
    display: inline-block;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: #eee;
    }
  }

  &:checked+label {
    background-color: #c0e0ff;
  }
}

.wildcard-subscription {
  background: transparent;
  border: none;
  font-size: x-small;
  font-weight: bold;
  padding: 0 2px;
  cursor: pointer;

  &:hover {
    color: #eee;
  }
}
</style>
