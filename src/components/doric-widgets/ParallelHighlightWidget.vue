<script lang="ts" setup>
import { useDoricInput, useDoricOutput } from 'doric-framework'
const setHoverables = useDoricOutput("hoverables")
const hoverables = useDoricInput("hoverables")
const words = useDoricInput("words")
</script>

<template>
    <div>
        <template v-for="(word, index) in (words?.value || '').split(' ')" :key="index">
            <span :class="{ active: Number.isInteger(hoverables.value) ? index === +hoverables.value : false }" style="cursor: pointer;" @mouseover="setHoverables(index)"
                @mouseleave="setHoverables('')">{{ word }}</span>
            {{ " " }}
        </template>
    </div>
</template>

<style scoped>
span:hover {
    color: #646cff;
}

.active {
    background-color: #646cff;
    color: white;
}
</style>