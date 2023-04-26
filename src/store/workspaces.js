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
    label: "PRef 0",
  }, {
    id: "passage-ref-1",
    type: "passage-ref-widget",
    label: "My Passage Reference",
  }, {
    id: "dictionary-0",
    type: "dictionary-widget",
    label: "Dictionary",
  }],
  [{
    id: "text-display-0",
    type: "text-display-widget",
    label: "Passage Display",
  }]
]



const defaultWorkspace = [
  [{
    id: "passage-ref-0",
    type: "passage-ref-widget",
    subscriptions: [{
      key: "osisRef",
      widgetSubscriptions: ["text-display-0"],
    }],
  }, {
    id: "text-display-0",
    type: "text-display-widget",
    subscriptions: [{
      key: "osisRef",
      widgetSubscriptions: ["passage-ref-0"],
    }],
  }],
  [{
    id: "passage-ref-1",
    type: "passage-ref-widget",
    subscriptions: [{
      key: "osisRef",
      widgetSubscriptions: ["text-display-1", "dictionary-0"],
    }],
  }, {
    id: "text-display-1",
    type: "text-display-widget",
    subscriptions: [{
      key: "osisRef",
      widgetSubscriptions: ["passage-ref-1", "dictionary-0"],
    }],
  }],
  [{
    id: "dictionary-0",
    type: "dictionary-widget",
    subscriptions: [{
      key: "selectedLemma",
      widgetSubscriptions: ["text-display-0", "text-display-1"],
    }],
  }],
]



const workspaceWithoutDictionary = [
  [{
    id: "passage-ref-0",
    type: "passage-ref-widget",
    subscriptions: [{
      key: "osisRef",
      widgetSubscriptions: ["text-display-0"],
    }],
  }, {
    id: "text-display-0",
    type: "text-display-widget",
    subscriptions: [{
      key: "osisRef",
      widgetSubscriptions: ["passage-ref-0"],
    }],
  }],
  [{
    id: "passage-ref-1",
    type: "passage-ref-widget",
    subscriptions: [{
      key: "osisRef",
      widgetSubscriptions: ["passage-ref-1", "dictionary-0"],
    }],
  }, {
    id: "text-display-1",
    type: "text-display-widget",
    subscriptions: [{
      key: "osisRef",
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
