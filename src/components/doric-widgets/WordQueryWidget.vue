<template>
    <input v-model="osisRef.value" type="text" placeholder="osisRef" />
    <button @click="submitOsisRef">submit ref</button>
    <input v-model="selectedLemma.value" type="text" placeholder="lemma" />
    <button @click="submitSelectedLemma">submit lemma</button>
</template>
  
<script>
export default {
    data() {
        return {
            osisRef: this.useDoricInput("osisRef"),
            selectedLemma: this.useDoricInput("selectedLemma")
        }
    },
    props: ['useDoricOutput', 'useDoricInput'],
    methods: {
        submitOsisRef() {
            this.useDoricOutput("osisRef", this.osisRef.value);
        },
        submitSelectedLemma() {
            this.useDoricOutput("selectedLemma", this.selectedLemma.value);
        }
    }
}
</script>
  