<script setup>

const props = defineProps({
  useDoricInput: Function,
  useDoricOutput: Function
})
const selectedLemma = props.useDoricInput("selectedLemma")
const setOsisRef = props.useDoricOutput("osisRef")


</script>

<template>
  <div style="font-weight: bold;">dictionary</div>
  <div>{{ selectedLemma() || "no lemma" }}</div>
  <button @click="setOsisRef('john 12')">john 12</button>
  <button @click="setOsisRef('john 13')">john 13</button>
  <button @click="setOsisRef('john 14')">john 14</button>
</template>
