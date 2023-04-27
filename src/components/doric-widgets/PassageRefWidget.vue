<script setup>
const props = defineProps({
  useDoricOutput: Function,
  useDoricInput: Function
})
const setOsisRef = props.useDoricOutput("osisRef")
const osisRef = props.useDoricInput("osisRef")
</script>

<template>
  <div>
    <input type="text" v-model="osisRef.value" />
    <button @click="setOsisRef(osisRef)">Set osisRef</button>
  </div>
</template>
