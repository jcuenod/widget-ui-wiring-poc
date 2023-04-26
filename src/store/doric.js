import {
  defineStore
} from 'pinia';
import widgetComponents from '@/components/widgets/Widgets';

// WORKSPACE STORE / WIDGETS STATE -----------------------------------------------------------------

const useStore = defineStore('workspace', {
  state: () => {
    return {
      columns: [],
    }
  },
  getters: {
    workspaceShape: (state) => {
      return state.columns.map(column =>
        column.map(widget => ({
          id: widget.id,
          type: widget.type,
          label: widget.label,
        }))
      );
    },
    widgetIds: (state) => {
      return state.columns.flat().map(w => w.id);
    },
    widgets: (state) => {
      return state.columns.flat()
    },
    getWidgetsSubscribedToWidgetAndKey: (state) => (widgetId, key) => {
      return state.columns.flat().filter(w =>
        w?.subscriptions.find(s =>
          s.key === key &&
          (s.widgetSubscriptions.includes(widgetId) || s.widgetSubscriptions.length === 0)
        )
      );
    }
  }
});

// WORKSPACE --------------------------------------------------------------------------------------

const getWorkspaceShape = () => {
  const store = useStore();
  return store.workspaceShape;
}

const getWidget = (widgetId) => {
  const store = useStore();
  const widget = store.widgets.find(w => w.id === widgetId)
  if (!widget) {
    throw new Error(`Widget with id "${widgetId}" not found`);
  }
  return widget;
}
const getWidgetIds = () => {
  const store = useStore();
  return store.widgetIds;
}

const setWorkspace = (newColumns) => {
  const store = useStore();

  // First check that every widget has "subscriptions" and "inputs" fields
  const validatedNewColumns = newColumns.map(c =>
    c.map(w => {
      if (!("id" in w)) {
        throw new Error(`Widget ${w} is missing an id`)
      }
      if (!("type" in w)) {
        throw new Error(`Widget ${w} is missing a type`)
      }
      if (!(w.type in widgetComponents)) {
        throw new Error(`Widget ${w} has an invalid type: ${w.type}`)
      }
      const newW = { ...w }
      if (!("label" in newW)) {
        newW["label"] = widgetComponents[w.type].defaultLabel
      }
      if (!("subscriptions" in newW)) {
        newW["subscriptions"] = []
      }
      if (!("inputs" in newW)) {
        newW["inputs"] = {}
      }
      return newW
    })
  )

  // If we give a whole new workspace, we need
  // to clear the current widget Ids so that the
  // whole structure gets rebuilt.The `setTimeout`
  // here allows the refresh to happen.Incremental
  // workspace updates need to be handled differently.
  store.columns = []
  setTimeout(() => {
    store.columns = validatedNewColumns;
  }, 0)
}

// INPUTS AND OUTPUTS -----------------------------------------------------------------------------

const getUseDoricOutput = (widgetId, key) => (value) => {
  console.log("here!")
  const store = useStore();

  // Get widgets that are subscribed to our output key on our widget
  const widgets = store.getWidgetsSubscribedToWidgetAndKey(widgetId, key);
  // Loop through this filtered list and update each widget's input value
  widgets.forEach(w => {
    if (!(key in (w?.inputs || {}))) {
      console.error(`Widget subscribes to "${key}" but has no listener. This may be a mistake in the workspace configuration or the widget is missing a 'useDoricInput' declaration.`)
      return
    }
    w.inputs[key] = value;
  });
};

const getUseDoricInput = (widgetId, key) => {
  const store = useStore();
  console.log("registering input!")

  const widget = store.widgets.find(w => w.id === widgetId);
  if (!widget) {
    throw new Error(`Widget with id "${widgetId}" not found`);
  }

  // Ensure that the input exists
  if (!widget.inputs?.[key]) {
    widget.inputs[key] = "";
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
  return () => widget.inputs[key]
};

export {
  getWorkspaceShape,
  getWidget,
  getWidgetIds,
  setWorkspace,
  getUseDoricInput,
  getUseDoricOutput,
}
