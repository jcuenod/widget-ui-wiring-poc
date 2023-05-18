/// <reference types="vite/client" />

type WidgetComponentMap = {
  [widgetKey: string]: {
    defaultLabel: string,
    widget: Function,
  }
}

type WidgetId = string

type MinimalInput = {
  value?: string
  shared?: boolean
  subscriptions: WidgetId[]
}
type MinimalInputs = {
  [key: string]: MinimalInput
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
  inputs?: MinimalInputs
}

type WidgetWithInputs = {
  type: string
  inputs: MinimalInputs
}

type Widget = {
  id: WidgetId
  type: string
  label: string
  inputs: Inputs
}

type Workspace = Widget[][]

type MinimalWorkspace = MinimalWidget[][]

type SharedParameters = {
  widgetId: string
  key: string
  value: string
}