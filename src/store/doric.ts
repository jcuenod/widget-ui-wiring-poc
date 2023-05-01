import { watch } from 'vue'
import {
  defineStore
} from 'pinia'
import widgetComponents from '@/components/doric-widgets/Widgets'


// WORKSPACE STORE / WIDGETS STATE -----------------------------------------------------------------

const useStore = defineStore('workspace', {
  state: () => {
    return {
      columns: [] as Workspace,
    }
  },
  actions: {
    insertColumn(columnIndex: number) {
      this.columns = [...this.columns.slice(0, columnIndex), [], ...this.columns.slice(columnIndex)]
    },
    addWidget(widget: MinimalWidget, column: number) {
      // Add widget to workspace
      const validatedWidget = getValidatedWidget(widget)
      const validatedUniqueWidget = widgetWithUniqueId(validatedWidget, this.widgetIds)
      this.columns[column] = [...this.columns[column], validatedUniqueWidget]
    },
    removeWidget(widgetId: string) {
      const widget = this.widgets.find(w => w.id === widgetId)
      if (!widget) {
        throw new Error(`Widget with id "${widgetId}" not found`)
      }
      // Remove widget from all subscriptions
      this.widgets.forEach(w => {
        const inputs = Object.keys(w.inputs)
        inputs.forEach(key => {
          inputs[key].subscriptions = inputs[key].subscriptions.filter(ws => ws !== widgetId)
        })
      })
      // Remove widget from workspace and filter out potentially empty columns
      this.columns = this.columns.map(c => c.filter(w => w.id !== widgetId)).filter(c => c.length > 0)
      if (this.columns.length === 0) {
        this.columns = [[]]
      }
    },
  },
  getters: {
    workspaceShape: (state) => {
      return state.columns.map(column =>
        column.map(widget => ({
          id: widget.id,
          type: widget.type,
          label: widget.label,
        }))
      )
    },
    widgetIds: (state) => {
      return state.columns.flat().map(w => w.id)
    },
    widgets: (state) => {
      return state.columns.flat()
    },
    getSubscribers: (state) => (widgetId: string, key: string) => {
      // All widgets with an input key subscribed to widgetId
      return state.columns.flat().filter(w =>
        key in w.inputs && (
          w.inputs[key].subscriptions.includes(widgetId)
          || w.inputs[key].subscriptions.length === 0 // Implicit subscription
        )
      )
    },
  }
})


// VALIDATION -------------------------------------------------------------------------------------

const getValidatedInputs: (i: MinimalInputs) => Inputs = (i) => {
  if (!i) {
    return {}
  }

  const validatedInputs: Inputs = {}
  // Ensure that inputs have a value, shared, and subscriptions field, create them if not
  Object.keys(i).forEach(key => {
    const input = i[key]
    if (!("value" in input)) {
      input["value"] = ""
    }
    if (!("shared" in input)) {
      input["shared"] = false
    }
    if (!("subscriptions" in input)) {
      input["subscriptions"] = []
    }
    validatedInputs[key] = input
  })
  return validatedInputs
}

const getValidatedWidget: (w: MinimalWidget) => Widget = (w) => {
  if (!("type" in w)) {
    throw new Error(`Widget ${w} is missing a type`)
  }
  if (!(w.type in widgetComponents)) {
    throw new Error(`Widget ${w} has an invalid type: ${w.type}`)
  }
  const newW: Widget = Object.assign({
    type: "",
    id: "",
    label: widgetComponents[w.type].defaultLabel,
  }, w)
  newW.inputs = getValidatedInputs(newW.inputs)
  return newW
}

const widgetWithUniqueId = (w: Widget, widgetIds: string[]) => {
  if (!w.id || widgetIds.includes(w.id)) {
    const newW = { ...w }
    // Get lowest available id
    const prefix = w.type.replace("-widget", "")
    const ids = widgetIds.filter(id => id.startsWith(prefix)).map(id => parseInt(id.replace(prefix + "-", "")))
    const newId = Math.max(-1, ...ids) + 1
    newW["id"] = `${prefix}-${newId}`
    return newW
  }
  return w
}


// WORKSPACE --------------------------------------------------------------------------------------

const getWorkspaceShape = () => {
  const store = useStore()
  return store.workspaceShape
}

const setWorkspace = (newColumns: Widget[][]) => {
  const store = useStore()

  // First check that every widget has "subscriptions" and "inputs" fields
  const validatedWidgetIds = []
  const validatedNewColumns = newColumns.map(c =>
    c.map(widget => {
      const validatedWidget = getValidatedWidget(widget)
      const validatedUniqueWidget = widgetWithUniqueId(validatedWidget, validatedWidgetIds)
      validatedWidgetIds.push(validatedUniqueWidget.id)
      return validatedUniqueWidget
    })
  )

  // If we give a whole new workspace, we need
  // to clear the current widget Ids so that the
  // whole structure gets rebuilt.The `setTimeout`
  // here allows the refresh to happen.Incremental
  // workspace updates need to be handled differently.
  store.columns = []
  setTimeout(() => {
    store.columns = validatedNewColumns
  }, 0)
}

const insertColumn = (columnIndex: number) => {
  const store = useStore()
  store.insertColumn(columnIndex)
}

const getWidget = (widgetId: string) => {
  const store = useStore()
  const widget = store.widgets.find(w => w.id === widgetId)
  if (!widget) {
    throw new Error(`Widget with id "${widgetId}" not found`)
  }
  return widget
}
const getWidgetIds = () => {
  const store = useStore()
  return store.widgetIds
}

const addWidget = (widget: Widget, column: number) => {
  const store = useStore()
  store.addWidget(widget, column)
}

const removeWidget = (widgetId: string) => {
  const store = useStore()
  store.removeWidget(widgetId)
}


// INPUTS AND OUTPUTS -----------------------------------------------------------------------------

const getUseDoricOutput = (widgetId: string, key: string) => (value: any) => {
  const store = useStore()

  // Unwrap reactive objects
  if (value instanceof Object && "value" in value) {
    const inspection = Object.getOwnPropertyDescriptor(value, "value") || {}
    if ("get" in inspection && "set" in inspection) {
      value = value.value
    }
  }

  // Get widgets that are subscribed to our output key on our widget
  const widgets = store.getSubscribers(widgetId, key)
  // Loop through this filtered list and update each widget's input value
  widgets.forEach(w => {
    if (!(key in (w?.inputs || {}))) {
      console.error(`Widget subscribes to "${key}" but has no listener. This may be a mistake in the workspace configuration or the widget is missing a 'useDoricInput' declaration.`)
      return
    }
    w.inputs[key].value = value
  })
}

type UseDoricInputOptions = {
  shared?: boolean
}
const getUseDoricInput = (widgetId: string, key: string, options: UseDoricInputOptions) => {
  const store = useStore()

  const widget = store.widgets.find(w => w.id === widgetId)
  if (!widget) {
    throw new Error(`Widget with id "${widgetId}" not found`)
  }

  // Ensure that the input exists
  if (!widget.inputs?.[key]) {
    widget.inputs[key] = {
      value: "",
      shared: options?.shared || false,
      subscriptions: [],
    }
  }

  // Every input includes a watcher that might share the input (to the url)
  watch(() => widget.inputs[key].value, (newValue) => {
    if (widget.inputs[key].shared) {
      console.log(`Widget "${widgetId}"'s shared input "${key}" changed to "${newValue}"`)
    }
  })

  // Return reactive object
  return {
    get value() {
      return widget.inputs[key].value
    },
    set value(newValue) {
      widget.inputs[key].value = newValue
    }
  }
}


// EXPORTS ---------------------------------------------------------------------------------------

export {
  getWorkspaceShape,
  getWidget,
  getWidgetIds,
  setWorkspace,
  getUseDoricInput,
  getUseDoricOutput,
  insertColumn,
  addWidget,
  removeWidget,
}