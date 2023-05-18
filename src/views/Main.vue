<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import widgets from '@/components/doric-widgets/Widgets.ts'
import workspaces, { defaultWorkspace } from "@/config/workspaces"
import DoricFramework from './DoricFramework.vue'

const initialLoad = ref(true)
const activeWorkspace = ref(null)
const workspace = ref({})

onMounted(() => {
    // We need the workspace to be set up before we can populate the widget inputs
    router.isReady().then(() => {
        let workspaceId = router.currentRoute.value.query?.workspace || defaultWorkspace
        if (!workspaceId || !(workspaceId in workspaces)) {
            workspaceId = Object.keys(workspaces)[0]
            return
        }
        activeWorkspace.value = workspaceId
        const stateFromRouter = Object.entries(router.currentRoute.value.query)
            .filter(([key]) => key.includes('.'))
            .map(([routerKey, value]) => {
                const [widgetId, key] = routerKey.split('.')
                return {
                    widgetId,
                    key,
                    value,
                }
            })
        const newWorkspace = structuredClone(workspaces[workspaceId])
        newWorkspace.forEach((_, column) => {
            newWorkspace[column].forEach((_, row) => {
                const widget = newWorkspace[column][row]
                const stateForWidget = stateFromRouter.filter(({ widgetId }) => widgetId === widget.id)
                stateForWidget.forEach(({ key, value }) => {
                    if (!(key in widget.inputs)) {
                        console.warn(`Ignoring invalid input key: ${key}`)
                        return
                    }
                    newWorkspace[column][row].inputs[key].value = value
                })
            })
        })
        workspace.value = newWorkspace
        nextTick(() => {
            initialLoad.value = false
        })
    })
})
watch(activeWorkspace, (newActiveWorkspace) => {
    if (initialLoad.value) {
        return
    }
    if (!newActiveWorkspace || !(newActiveWorkspace in workspaces)) {
        console.error(`Invalid workspace: ${newActiveWorkspace}`)
        return
    }
    workspace.value = workspaces[newActiveWorkspace]
})

const setSharedParameters = (sharedParameters) => {
    console.log("shared", sharedParameters)
    // updating shared params
    // router.push({
    //   query: {
    //     ...router.currentRoute.value.query,
    //     ...sharedParameters,
    //   },
    // })
}

</script>

<template>
    <div class="nav">
        <select v-model="activeWorkspace">
            <option :key="key" v-for="key in Object.keys(workspaces)">{{ key }}</option>
        </select>
    </div>
    <DoricFramework
        :widgets="widgets"
        :workspace="workspace"
        @setSharedParameters="setSharedParameters"
        />
</template>

<style scoped>
.nav {
    display: flex;
    flex-direction: row;
    justify-content: end;
    margin-bottom: 1rem;
    padding: 0.5rem;
}
</style>