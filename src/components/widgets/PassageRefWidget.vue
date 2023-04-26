<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  useDoricOutput: Function,
  useDoricInput: Function
})
const setOsisRef = props.useDoricOutput("osisRef")
const getOsisRef = props.useDoricInput("osisRef")

const osisRef = ref(getOsisRef())
watch(() => getOsisRef(), (newVal) => {
  osisRef.value = newVal
})
</script>

<template>
  <div>
    <input type="text" v-model="osisRef" />
    <button @click="setOsisRef(osisRef)">Set osisRef</button>
  </div>
</template>
