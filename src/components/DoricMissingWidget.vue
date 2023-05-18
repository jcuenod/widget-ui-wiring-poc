<script setup>
const props = defineProps({
  type: String
})
</script>

<template>
  <div>
    Missing widget definition: <span class="component-name">{{ type }}</span>
  </div>
</template>

<style lang="scss" scoped>
.component-name {
  color: red;
  font-weight: bold;
}
</style>
