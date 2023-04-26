import {
  defineStore
} from 'pinia';

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
        }))
      );
    },
    widgetIds: (_, getters) => {
      return getters.widgets.map(w => w.id);
    },
    widgets: (state) => {
      return state.columns.flat()
    },
    getWidgetsSubscribedToWidgetAndKey: (state) => (widgetId, inputName) => {
      return state.columns.flat().filter(w =>
        w?.subscriptions.find(s =>
          s.inputName === inputName &&
          (s.widgetSubscriptions.includes(widgetId) || s.widgetSubscriptions.length === 0)
        )
      );
    },
  }
});


const getUseDoricInput = (widgetId, inputName) => {
  const store = useStore();

  const widget = store.widgets.find(w => w.id === widgetId);
  if (!widget) {
    throw new Error(`Widget with id "${widgetId}" not found`);
  }

  // Ensure that the input exists
  if (!("inputs" in widget)) {
    widget["inputs"] = {}
  }
  if (!widget.inputs?.[inputName]) {
    // const newInputs = {
    //   ...widget.inputs,
    //   [inputName]: "",
    // };
    // widget.inputs = newInputs
    widget.inputs[inputName] = "";
  }
  // Ensure that the subscription exists for input
  if (!("subscriptions" in widget)) {
    widget["subscriptions"] = []
  }
  if (!widget.subscriptions.find(s => s.inputName === inputName)) {
    widget.subscriptions = [
      ...widget.subscriptions,
      {
        inputName,
        widgetSubscriptions: [],
      }
    ]
  }
  return () => widget.inputs[inputName]
};

const getUseDoricOutput = (widgetId, outputKey) => (outputValue) => {
  const store = useStore();

  const widgets = store.getWidgetsSubscribedToWidgetAndKey(widgetId, outputKey);
  widgets.forEach(w => {
    if (!(outputKey in (w?.inputs || {}))) {
      console.error(`Widget subscribes to "${outputKey}" but has no listener. This may be a mistake in the workspace configuration or the widget is missing a 'useDoricInput' declaration.`)
      return
    }
    w.inputs[outputKey] = outputValue;
  });
};

// Export reactive workspace from store.workspaceShape
const workspace = () => {
  const store = useStore();
  return store.workspaceShape;
}

const setWorkspace = (newColumns) => {
  const store = useStore();

  // First check that every widget has "subscriptions" and "inputs" fields
  const validatedNewColumns = newColumns.map(c =>
    c.map(w => {
      const newW = { ...w }
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

export {
  getUseDoricInput,
  getUseDoricOutput,
  workspace,
  setWorkspace,
}
