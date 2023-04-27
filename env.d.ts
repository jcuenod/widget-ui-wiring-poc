/// <reference types="vite/client" />

type WidgetComponentMap = {
  [widgetKey: string]: {
    defaultLabel: string,
    widget: Function,
  }
}

type Subscription = {
  key: string
  widgetSubscriptions: string[]
}

type MinimalWidget = {
  type: string
  id?: string
  label?: string
  inputs?: { [key: string]: string }
  subscriptions?: Subscription[]
}

type Widget = {
  id: string
  type: string
  label: string
  inputs: { [key: string]: string }
  subscriptions: Subscription[]
}

type Workspace = Widget[][]
