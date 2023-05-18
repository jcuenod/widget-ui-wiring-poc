const workspaces = {
  simplest: [
    [{
      type: "passage-ref-widget",
    }, {
      type: "dictionary-widget",
    }],
    [{
      type: "text-display-widget",
    }]
  ],

  simple: [
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
  ],

  default: [
    [{
      id: "passage-ref-0",
      type: "passage-ref-widget",
      inputs: {
        "osisRef": {
          value: "Ps.110.1",
          subscriptions: ["text-display-0"],
        },
      },
    }, {
      id: "text-display-0",
      type: "text-display-widget",
      inputs: {
        "osisRef": {
          subscriptions: ["passage-ref-0"],
        },
      },
    }],
    [{
      id: "passage-ref-1",
      type: "passage-ref-widget",
      inputs: {
        "osisRef": {
          value: "Heb.1.1",
          subscriptions: ["text-display-1", "dictionary-0"],
        },
      },
    }, {
      id: "text-display-1",
      type: "text-display-widget",
      inputs: {
        "osisRef": {
          subscriptions: ["passage-ref-1", "dictionary-0"],
        },
      },
    }],
    [{
      id: "dictionary-0",
      type: "dictionary-widget",
      inputs: {
        "selectedLemma": {
          subscriptions: ["text-display-0", "text-display-1"],
        },
      },
    }],
  ],
}

export const defaultWorkspace = "default"
export default workspaces
