<template>
    <input v-model="osisRef.value" type="text" placeholder="osisRef" />
    <button @click="submitOsisRef(osisRef.value)">submit ref</button>
    <input v-model="selectedLemma.value" type="text" placeholder="lemma" />
    <button @click="submitSelectedLemma(selectedLemma.value)">submit lemma</button>
</template>
  
<script>
import { useDoricInput, useDoricOutput } from 'doric-framework'

export default {
    data() {
        return {
            osisRef: useDoricInput("osisRef"),
            selectedLemma: useDoricInput("selectedLemma")
        }
    },
    // /* Alternative to using `setup()` */
    // created() {
    //     this.submitOsisRef = useDoricOutput("osisRef")
    //     this.submitSelectedLemma = useDoricOutput("selectedLemma")
    // },
    setup() {
        return {
            submitOsisRef: useDoricOutput("osisRef"),
            submitSelectedLemma: useDoricOutput("selectedLemma")
        }
    },
}
</script>
  