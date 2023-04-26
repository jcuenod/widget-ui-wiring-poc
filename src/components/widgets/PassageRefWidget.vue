<script setup>
import { ref } from 'vue'
const osisRef = ref("")

const props = defineProps({
  useDoricOutput: Function,
})
const setOsisRef = props.useDoricOutput("osisRef")
</script>

<template>
  <div>
    <input type="text" v-model="osisRef" />
    <button @click="setOsisRef(osisRef)">Set osisRef</button>
  </div>
</template>
