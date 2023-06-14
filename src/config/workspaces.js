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
    }, {
      type: "missing-widget",
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
          shared: true,
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

  parallel_highlight: [[], [
    {
      type: "parallel-highlight-widget", inputs: {
        words: { value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Maecenas nec odio et ante tincidunt tempus." }
      }
    },
    {
      type: "parallel-highlight-widget", inputs: {
        words: { value: "Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh." }
      }
    }], [
    {
      type: "parallel-highlight-widget", inputs: {
        words: { value: "Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris." }
      }
    },
    {
      type: "parallel-highlight-widget", inputs: {
        words: { value: "Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus vitae erat rutrum." }
      }
    }], []
  ],
}

export const defaultWorkspace = "default"
export default workspaces
