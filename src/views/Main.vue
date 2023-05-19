<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import widgets from '@/components/doric-widgets/Widgets'
import workspaces, { defaultWorkspace } from "@/config/workspaces"
import DoricFramework from './DoricFramework.vue'

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
            <select v-model="activeWorkspace">
                <option :key="key" v-for="key in Object.keys(workspaces)">{{ key }}</option>
            </select>
        </div>
        <DoricFramework
            :widgets="widgets"
            :workspace="workspace"
            :initialState="initialWorkspaceState"
            @setSharedParameters="setSharedParameters"
            />
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
        justify-content: end;
        margin-bottom: 1rem;
        padding: 0.5rem;
    }
}
</style>