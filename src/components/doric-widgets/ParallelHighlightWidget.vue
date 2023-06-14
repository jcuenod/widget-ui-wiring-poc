<script lang="ts" setup>
const props = defineProps({
    useDoricOutput: {
        type: Function,
        required: true,
    },
    useDoricInput: {
        type: Function,
        required: true,
    },
})
const setHoverables = props.useDoricOutput("hoverables")
const hoverables = props.useDoricInput("hoverables")
const words = props.useDoricInput("words")
</script>

<template>
    <div>
        <template v-for="(word, index) in (words?.value || '').split(' ')" :key="index">
            <span :class="{ active: index === hoverables.value }" style="cursor: pointer;" @mouseover="setHoverables(index)"
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