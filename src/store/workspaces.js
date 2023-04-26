const simplestWorkspace = [
  [{
    id: "passage-ref-0",
    type: "passage-ref-widget",
  }, {
    id: "dictionary-0",
    type: "dictionary-widget",
  }],
  [{
    id: "text-display-0",
    type: "text-display-widget",
  }]
]



const simpleWorkspace = [
  [{
    id: "passage-ref-0",
    type: "passage-ref-widget",
  }, {
    id: "passage-ref-1",
    type: "passage-ref-widget",
  }, {
    id: "dictionary-0",
    type: "dictionary-widget",
  }],
  [{
    id: "text-display-0",
    type: "text-display-widget",
  }]
]



const defaultWorkspace = [
  [{
    id: "passage-ref-0",
    type: "passage-ref-widget",
    subscriptions: [{
      inputName: "osisRef",
      widgetSubscriptions: ["text-display-0"],
    }],
  }, {
    id: "text-display-0",
    type: "text-display-widget",
    subscriptions: [{
      inputName: "osisRef",
      widgetSubscriptions: ["passage-ref-0"],
    }],
  }],
  [{
    id: "passage-ref-1",
    type: "passage-ref-widget",
    subscriptions: [{
      inputName: "osisRef",
      widgetSubscriptions: ["text-display-1", "dictionary-0"],
    }],
  }, {
    id: "text-display-1",
    type: "text-display-widget",
    subscriptions: [{
      inputName: "osisRef",
      widgetSubscriptions: ["passage-ref-1", "dictionary-0"],
    }],
  }],
  [{
    id: "dictionary-0",
    type: "dictionary-widget",
    subscriptions: [{
      inputName: "selectedLemma",
      widgetSubscriptions: ["text-display-0", "text-display-1"],
    }],
  }],
]



const workspaceWithoutDictionary = [
  [{
    id: "passage-ref-0",
    type: "passage-ref-widget",
    subscriptions: [{
      inputName: "osisRef",
      widgetSubscriptions: ["text-display-0"],
    }],
  }, {
    id: "text-display-0",
    type: "text-display-widget",
    subscriptions: [{
      inputName: "osisRef",
      widgetSubscriptions: ["passage-ref-0"],
    }],
  }],
  [{
    id: "passage-ref-1",
    type: "passage-ref-widget",
    subscriptions: [{
      inputName: "osisRef",
      widgetSubscriptions: ["passage-ref-1", "dictionary-0"],
    }],
  }, {
    id: "text-display-1",
    type: "text-display-widget",
    subscriptions: [{
      inputName: "osisRef",
      widgetSubscriptions: ["passage-ref-1"],
    }],
  }]
]


export {
  defaultWorkspace,
  workspaceWithoutDictionary,
  simpleWorkspace,
  simplestWorkspace
}
