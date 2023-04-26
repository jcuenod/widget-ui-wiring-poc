<script setup>
const props = defineProps({
  useDoricInput: Function,
  useDoricOutput: Function
})
const osisRef = props.useDoricInput("osisRef")
const setSelectedLemma = props.useDoricOutput("selectedLemma")

// Ignore this -----------------
// Get some random words to emit to a potential dictionary widget
const lemmas = "In the beginning God created the heavens and the earth Now the earth was without shape and empty, and darkness was over the surface of the watery deep but the Spirit of God was moving over the surface of the water".split(" ")
const randomLemma1 = lemmas.splice(Math.round(Math.random() * (lemmas.length - 1)), 1)[0]
const randomLemma2 = lemmas.splice(Math.round(Math.random() * (lemmas.length - 1)), 1)[0]
const randomLemma3 = lemmas.splice(Math.round(Math.random() * (lemmas.length - 1)), 1)[0]
// -----------------------------
</script>

<template>
  <div>{{ osisRef() || " no osisRef set yet" }}</div>
  <button @click="setSelectedLemma(randomLemma1)">{{ randomLemma1 }}</button>
  <button @click="setSelectedLemma(randomLemma2)">{{ randomLemma2 }}</button>
  <button @click="setSelectedLemma(randomLemma3)">{{ randomLemma3 }}</button>
</template>
