<script setup>
import { useDoricInput, useDoricOutput } from 'doric-framework'
const selectedLemma = useDoricInput("selectedLemma")
const setOsisRef = useDoricOutput("osisRef")
</script>

<template>
  <div>{{ selectedLemma.value || "no lemma" }}</div>
  <button @click="setOsisRef('john 12')">john 12</button>
  <button @click="setOsisRef('john 13')">john 13</button>
  <button @click="setOsisRef('john 14')">john 14</button>
</template>
