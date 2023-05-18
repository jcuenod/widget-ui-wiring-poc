import TextDisplayWidget from '@/components/doric-widgets/TextDisplayWidget.vue'
import PassageRefWidget from '@/components/doric-widgets/PassageRefWidget.vue'
import DictionaryWidget from '@/components/doric-widgets/DictionaryWidget.vue'

export default {
  "text-display-widget": {
    defaultLabel: "Text Display",
    widget: TextDisplayWidget as Function
  },
  "passage-ref-widget": {
    defaultLabel: "Passage Reference",
    widget: PassageRefWidget as Function
  },
  "dictionary-widget": {
    defaultLabel: "Dictionary",
    widget: DictionaryWidget as Function
  },
} as WidgetComponentMap