import {
  defineStore
} from 'pinia'
import widgetComponents from '@/components/doric-widgets/Widgets'

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
    inputs: {},
    subscriptions: [],
  }, w)
  return newW
}

const widgetWithUniqueId = (w: Widget, widgetIds: string[]) => {
  if (widgetIds.includes(w.id)) {
    const newW = { ...w }
    // Get lowest available id
    const prefix = w.type.replace("-widget", "")
    const ids = widgetIds.filter(id => id.startsWith(prefix)).map(id => parseInt(id.replace(prefix + "-", "")))
    const newId = Math.max(...ids) + 1
    newW["id"] = `${prefix}-${newId}`
    return newW
  }
  return w
}

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
        w.subscriptions.forEach(s => {
          s.widgetSubscriptions = s.widgetSubscriptions.filter(ws => ws !== widgetId)
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
      return state.columns.flat() as Widget[]
    },
    getSubscribedWidgets: (state) => (widgetId: string, key: string) => {
      // All widgets that listen to the key on this widget
      return state.columns.flat().filter(w =>
        w?.subscriptions.find(s =>
          s.key === key &&
          (s.widgetSubscriptions.includes(widgetId) || s.widgetSubscriptions.length === 0)
        )
      )
    },
    getWidgetsSubscribedToWidgetAndKey: (state) => (widgetId: string, key: string) => {
      return state.columns.flat().filter(w =>
        w?.subscriptions.find(s =>
          s.key === key &&
          (s.widgetSubscriptions.includes(widgetId) || s.widgetSubscriptions.length === 0)
        )
      )
    },
  }
})

// WORKSPACE --------------------------------------------------------------------------------------

const getWorkspaceShape = () => {
  const store = useStore()
  return store.workspaceShape
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

const setWorkspace = (newColumns: Widget[][]) => {
  const store = useStore()

  // First check that every widget has "subscriptions" and "inputs" fields
  const validatedNewColumns = newColumns.map(c =>
    c.map(getValidatedWidget)
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

// INPUTS AND OUTPUTS -----------------------------------------------------------------------------

const getUseDoricOutput = (widgetId: string, key: string) => (value: any) => {
  const store = useStore()

  // Unwrap reactive objects
  if (value?.value) {
    value = value.value
  }

  // Get widgets that are subscribed to our output key on our widget
  const widgets = store.getWidgetsSubscribedToWidgetAndKey(widgetId, key)
  // Loop through this filtered list and update each widget's input value
  widgets.forEach(w => {
    if (!(key in (w?.inputs || {}))) {
      console.error(`Widget subscribes to "${key}" but has no listener. This may be a mistake in the workspace configuration or the widget is missing a 'useDoricInput' declaration.`)
      return
    }
    w.inputs[key] = value
  })
}

const getUseDoricInput = (widgetId: string, key: string) => {
  const store = useStore()

  const widget = store.widgets.find(w => w.id === widgetId)
  if (!widget) {
    throw new Error(`Widget with id "${widgetId}" not found`)
  }

  // Ensure that the input exists
  if (!widget.inputs?.[key]) {
    widget.inputs[key] = ""
  }
  // Ensure that the subscription exists for input
  if (!widget.subscriptions.find(s => s.key === key)) {
    widget.subscriptions = [
      ...widget.subscriptions,
      {
        key,
        widgetSubscriptions: [],
      }
    ]
  }

  // Return reactive object
  return {
    get value() { return widget.inputs[key] },
    set value(newValue) {
      widget.inputs[key] = newValue
    }
  }
}

const insertColumn = (columnIndex: number) => {
  const store = useStore()
  store.insertColumn(columnIndex)
}

const addWidget = (widget: Widget, column: number) => {
  const store = useStore()
  store.addWidget(widget, column)
}

const removeWidget = (widgetId: string) => {
  const store = useStore()
  store.removeWidget(widgetId)
}

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