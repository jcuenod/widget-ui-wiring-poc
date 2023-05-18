import {
  defineStore
} from 'pinia'
import widgetComponents from '@/components/doric-widgets/Widgets'


// WORKSPACE STORE / WIDGETS STATE -----------------------------------------------------------------

const useDoricStore = defineStore('doric-workspace', {
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
        Object.keys(w.inputs).forEach(key => {
          w.inputs[key].subscriptions = w.inputs[key].subscriptions.filter(ws => ws !== widgetId)
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
    sharedParameters: (state) => {
      const allWidgets = state.columns.flat()
      const allInputs = allWidgets.map(w => Object.keys(w.inputs).map(key => ({ widgetId: w.id, key, input: w.inputs[key] }))).flat()
      const sharedInputs: { widgetId: string, key: string, value: string }[] = allInputs
        .filter(i => i.input.shared)
        .map(i => ({ widgetId: i.widgetId, key: i.key, value: i.input.value }))
      return Object.fromEntries(sharedInputs.map(i => [`${i.widgetId}.${i.key}`, i.value]))
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
    validatedInputs[key] = Object.assign({
      value: "",
      shared: false,
      subscriptions: [],
    }, i[key])
  })
  return validatedInputs as Inputs
}

const getValidatedWidget: (w: MinimalWidget) => Widget = (w) => {
  if (!w.type || typeof w.type !== "string") {
    throw new Error(`Widget ${w} is missing a type or the type is invalid: ${w.type}`)
  }
  if (!(w.type in widgetComponents)) {
    throw new Error(`Widget ${w} has an invalid type: ${w.type}`)
  }

  return {
    type: w.type,
    id: w.id || "",
    label: w.label || widgetComponents[w.type].defaultLabel,
    inputs: getValidatedInputs(w.inputs || {}),
  } as Widget
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
  const store = useDoricStore()
  return store.workspaceShape
}

const setWorkspace = (newColumns: Workspace) => new Promise<void>((resolve) => {
  const store = useDoricStore()

  // First check that every widget has "subscriptions" and "inputs" fields
  const validatedWidgetIds: string[] = []
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
    resolve()
  }, 0)
})

const insertColumn = (columnIndex: number) => {
  const store = useDoricStore()
  store.insertColumn(columnIndex)
}

const getWidget = (widgetId: string) => {
  const store = useDoricStore()
  const widget = store.widgets.find(w => w.id === widgetId)
  if (!widget) {
    throw new Error(`Widget with id "${widgetId}" not found`)
  }
  return widget
}
const getWidgetIds = () => {
  const store = useDoricStore()
  return store.widgetIds
}

const addWidget = (widget: Widget, column: number) => {
  const store = useDoricStore()
  store.addWidget(widget, column)
}

const removeWidget = (widgetId: string) => {
  const store = useDoricStore()
  store.removeWidget(widgetId)
}

const injectWorkspaceState = (state: { widgetId: string, key: string, value: string }[]) => {
  const store = useDoricStore()
  state.forEach(({ widgetId, key, value }) => {
    const widget = store.widgets.find(w => w.id === widgetId)
    if (!widget) {
      console.error(`Widget with id "${widgetId}" not found`)
      return
    }
    widget.inputs[key].value = value
  })
}

const sharedParameters = () => {
  const store = useDoricStore()
  return store.sharedParameters
}


// INPUTS AND OUTPUTS -----------------------------------------------------------------------------

const primitiveTypes = new Set(["string", "number", "boolean"])
const getUseDoricOutput = (widgetId: string, key: string) => (value: any) => {
  const store = useDoricStore()

  // Unwrap reactive objects
  if (value instanceof Object && "value" in value) {
    const inspection = Object.getOwnPropertyDescriptor(value, "value") || {}
    if ("get" in inspection && "set" in inspection) {
      value = value.value
    }
  }

  // Ensure that only primitives are passed
  if (!(primitiveTypes.has(typeof value))) {
    console.error(`Widget "${widgetId}" tried to emit a non-primitive value to "${key}". Only strings, numbers, and booleans are supported.`)
    return
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
  const store = useDoricStore()

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

  // Return reactive object
  return {
    get value() {
      return widget.inputs[key].value
    },
    set value(newValue) {
      // Ensure that only primitives are passed
      if (!(primitiveTypes.has(typeof newValue))) {
        console.error(`Widget "${widgetId}" tried to give input "${key}" a non-primitive value. Only strings, numbers, and booleans are supported.`)
        return
      }
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
  injectWorkspaceState,
  sharedParameters,
}