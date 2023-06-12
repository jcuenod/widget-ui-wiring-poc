<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import widgets from '@/components/doric-widgets/Widgets'
import workspaces, { defaultWorkspace } from "@/config/workspaces"
import { DoricFramework } from 'doric-framework'
import "doric-framework/dist/style.css"

const locked = ref(true)
const initialWorkspaceState = ref<WidgetInputState[]>([])
const activeWorkspace = ref("")
const workspace = ref({})

onMounted(() => {
    // We need the workspace to be set up before we can populate the widget inputs
    router.isReady().then(() => {
        let workspaceId = router.currentRoute.value.query?.workspace?.toString() || defaultWorkspace
        if (!workspaceId || !(workspaceId in workspaces)) {
            workspaceId = Object.keys(workspaces)[0]
            return
        }
        activeWorkspace.value = workspaceId
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
    })
})

watch(activeWorkspace, (newActiveWorkspace) => {
    if (!newActiveWorkspace || !(newActiveWorkspace in workspaces)) {
        console.error(`Invalid workspace: ${newActiveWorkspace}`)
        return
    }
    workspace.value = workspaces[newActiveWorkspace as keyof typeof workspaces]
    router.push({
        query: {
            workspace: newActiveWorkspace,
        },
    })
})

const setSharedParameters = (sharedParameters: SharedParameters, oldSharedParameters: SharedParameters) => {
    const routerFunction = router.currentRoute.value.query.workspace === activeWorkspace.value
        ? router.replace : router.push
    routerFunction({
        query: {
            workspace: activeWorkspace.value,
            ...sharedParameters,
        },
    })
}

</script>

<template>
    <div class="App">
        <div class="nav">
            <button @click="locked = !locked" class="p-1 m-0 mr-1">
                <!-- `lock-closed mini` icon from https://heroicons.com/, MIT license -->
                <svg v-if="locked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    class="w-4 h-4">
                    <path fill-rule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clip-rule="evenodd" />
                </svg>
                <!-- `lock-open mini` icon from https://heroicons.com/, MIT license -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path fill-rule="evenodd"
                        d="M14.5 1A4.5 4.5 0 0010 5.5V9H3a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1.5V5.5a3 3 0 116 0v2.75a.75.75 0 001.5 0V5.5A4.5 4.5 0 0014.5 1z"
                        clip-rule="evenodd" />
                </svg>
            </button>
            <select v-model="activeWorkspace">
                <option :key="key" v-for="key in Object.keys(workspaces)">{{ key }}</option>
            </select>
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
}</style>