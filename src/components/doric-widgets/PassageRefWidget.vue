<script setup>
import { useDoricInput, useDoricOutput } from 'doric-framework'
const setOsisRef = useDoricOutput("osisRef")
const osisRef = useDoricInput("osisRef")
</script>

<template>
  <div>
    <input type="text" v-model="osisRef.value" />
    <button @click="setOsisRef(osisRef)">Set osisRef</button>
  </div>
</template>
