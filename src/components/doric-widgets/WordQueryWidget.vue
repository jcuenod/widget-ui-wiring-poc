<template>
    <input v-model="osisRef.value" type="text" placeholder="osisRef" />
    <button @click="submitOsisRef(osisRef.value)">submit ref</button>
    <input v-model="selectedLemma.value" type="text" placeholder="lemma" />
    <button @click="submitSelectedLemma(selectedLemma.value)">submit lemma</button>
</template>
  
<script>
export default {
    data() {
        return {
            osisRef: this.useDoricInput("osisRef"),
            selectedLemma: this.useDoricInput("selectedLemma")
        }
    },
    created() {
        // Define input methods
        this.submitOsisRef = this.useDoricOutput("osisRef")
        this.submitSelectedLemma = this.useDoricOutput("selectedLemma")
    },
    props: ['useDoricOutput', 'useDoricInput'],
}
</script>
  