<script setup>
import { ref } from 'vue'
const osisRef = ref("")

// Declare outputs
const props = defineProps({
  useDoricOutput: Function,
})
const setOsisRef = props.useDoricOutput("osisRef")
</script>

<template>
  <div>
    <div style="font-weight: bold;">passage ref</div>
    <input type="text" v-model="osisRef" />
    <button @click="setOsisRef(osisRef)">Set osisRef</button>
  </div>
</template>
