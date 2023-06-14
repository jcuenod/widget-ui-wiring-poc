<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import widgets from '@/components/doric-widgets/Widgets'
import workspaces, { defaultWorkspace } from "@/config/workspaces"
import { DoricFramework, exportWorkspace } from 'doric-framework'
import "doric-framework/dist/style.css"

const isMounted = ref(false)
const locked = ref(true)
const initialWorkspaceState = ref<WidgetInputState[]>([])
const activeWorkspaceId = ref("")
const workspace: Ref<MinimalWorkspace> = ref([])

onMounted(() => {
    // We need the workspace to be set up before we can populate the widget inputs
    router.isReady().then(() => {
        let workspaceId = router.currentRoute.value.query?.workspace?.toString() || defaultWorkspace
        if (!workspaceId || !(workspaceId in workspaces)) {
            console.warn(`Invalid workspace ${workspaceId}`)
            workspaceId = Object.keys(workspaces)[0]
        }
        console.log(`Loading workspace: ${workspaceId}`)
        activeWorkspaceId.value = workspaceId
        initialWorkspaceState.value = Object.entries(router.currentRoute.value.query)
            .filter(([key]) => key.includes('.'))
            .map(([routerKey, value]) => {
                const [widgetId, key] = routerKey.split('.')
                return {
                    widgetId,
                    key,
                    value,
                }
            })
        isMounted.value = true
    })
})

watch(activeWorkspaceId, (newActiveWorkspaceId) => {
    if (!newActiveWorkspaceId || !(newActiveWorkspaceId in workspaces)) {
        console.error(`Invalid workspace: ${newActiveWorkspaceId}`)
        return
    }
    console.log(`Setting workspace: ${newActiveWorkspaceId}`)
    workspace.value = workspaces[newActiveWorkspaceId as keyof typeof workspaces]
    router.push({
        query: {
            workspace: newActiveWorkspaceId,
        },
    })
})

// This function is passed into DoricFramework and is called whenever a shared input changes (or is set on init)
const setSharedParameters = (sharedParameters: SharedParameters, oldSharedParameters: SharedParameters) => {
    if (!isMounted.value) {
        return
    }
    const routerFunction = router.currentRoute.value.query.workspace === activeWorkspaceId.value
        ? router.replace : router.push
    routerFunction({
        query: {
            workspace: activeWorkspaceId.value,
            ...sharedParameters,
        },
    })
}

const serializeWorkspace = () => {
    const serializedWorkspace = JSON.stringify(exportWorkspace())
    // copy to clipboard
    navigator.clipboard.writeText(serializedWorkspace)
        .then(() => {
            console.log('Copied workspace to clipboard')
            alert('Serialized workspace to clipboard')
        })
        .catch((err) => {
            console.error('Failed to copy workspace to clipboard', err)
        })
}

</script>

<template>
    <div class="App">
        <div class="nav">
            <button v-if="!locked" @click="serializeWorkspace" class="p-1 m-0 mr-1">
                <!-- `code-bracket-square` icon from https://heroicons.com/, MIT license -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd"
                        d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L6.56 10l1.72-1.72zm4.5-1.06a.75.75 0 10-1.06 1.06L13.44 10l-1.72 1.72a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 000-1.06l-2.25-2.25z"
                        clip-rule="evenodd" />
                </svg>
            </button>
            <select v-if="!locked" v-model="activeWorkspaceId">
                <option :key="key" v-for="key in Object.keys(workspaces)">{{ key }}</option>
            </select>
            <button @click="locked = !locked" class="p-1 m-0 ml-1">
                <!-- `lock-closed mini` icon from https://heroicons.com/, MIT license -->
                <svg v-if="locked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    class="w-5 h-5">
                    <path fill-rule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clip-rule="evenodd" />
                </svg>
                <!-- `lock-open mini` icon from https://heroicons.com/, MIT license -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd"
                        d="M14.5 1A4.5 4.5 0 0010 5.5V9H3a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1.5V5.5a3 3 0 116 0v2.75a.75.75 0 001.5 0V5.5A4.5 4.5 0 0014.5 1z"
                        clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <DoricFramework :widgets="widgets" :workspace="workspace" :locked="locked" :initialState="initialWorkspaceState"
            @setSharedParameters="setSharedParameters" />
    </div>
</template>

<style lang="scss" scoped>
.App {
    display: flex;
    flex-direction: column;
    width: 100vw;
    min-height: 100vh;

    .nav {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
        background-color: #fdfdfd;
        padding: 0.5rem;
    }
}
</style>