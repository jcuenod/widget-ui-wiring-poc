/// <reference types="vite/client" />

type WidgetComponentMap = {
  [widgetKey: string]: {
    defaultLabel: string,
    widget: Function,
  }
}

type WidgetId = string

type MinimalInputs = {
  [key: string]: Input
}

type Inputs = {
  [key: string]: {
    value: string
    shared: boolean
    subscriptions: WidgetId[]
  }
}

type MinimalWidget = {
  type: string
  id?: WidgetId
  label?: string
  inputs?: { [key: string]: Input }
}

type Widget = {
  id: WidgetId
  type: string
  label: string
  inputs: Inputs
}

type Workspace = Widget[][]
