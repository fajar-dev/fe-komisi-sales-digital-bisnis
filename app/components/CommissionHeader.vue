<template>
    <div class="md:py-8 py-2">
        <div class="flex sm:flex-row flex-col sm:items-end justify-between gap-4">
            <div class="flex items-center gap-2">
                <UButton icon="i-lucide-arrow-left" size="lg" color="neutral" variant="ghost" @click="goBack"/>
                <div class="flex items-center gap-1">
                    <UUser
                        :avatar="{
                            src: employee?.photo_profile,
                            icon: 'i-lucide-image'
                        }"
                        :ui="{ avatar: 'h-10 w-10' }"
                    />
                    <div>
                        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                                {{ employee?.name }}'s Commission
                        </h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ subtitle }}                  
                        </p>
                    </div>
                </div>
            </div>
            <div class="flex items-center  gap-3">
                <USelectMenu v-if="mode === 'monthly' && monthItems && monthItems.length" v-model="selectedMonthObject" :items="monthItems" option-attribute="label" class="w-44" />
                <USelectMenu v-if="props.yearItems && props.yearItems.length" v-model="selectedYear" :items="props.yearItems" class="w-32" />
                <div class="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <UTabs :items="viewTabItems" v-model="activeViewTab" size="md" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Employee } from '~/types/employee'
import { AdditionalService } from '~/services/additional-service'

const props = withDefaults(defineProps<{
    employee: Employee | undefined
    subtitle: string
    yearItems?: number[]
    mode?: 'monthly' | 'yearly'
    routePrefix?: string
}>(), {
    yearItems: () => [2026, 2027, 2028, 2029, 2030],
    mode: 'monthly',
    routePrefix: 'sales'
})

const selectedYear = defineModel<number>('year')
const selectedMonth = defineModel<number>('month')

const route = useRoute()
const router = useRouter()

const viewTabItems = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
]

const activeViewTab = ref(props.mode)

watch(activeViewTab, (tab) => {
    const id = route.params.id as string
    if (tab === 'yearly') {
        router.push(`/${id}/${props.routePrefix}/yearly`)
    } else {
        router.push(`/${id}/${props.routePrefix}`)
    }
})

const monthItems = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
]

const selectedMonthObject = computed({
    get() {
        return monthItems.find(item => item.value === selectedMonth.value)
    },
    set(val) {
        selectedMonth.value = val?.value
    }
})

const fetchDefaultPeriod = async () => {
    try {
        const additionalService = new AdditionalService()
        const response = await additionalService.getCurrentPeriod()
        if (response?.data) {
            if (!selectedYear.value) selectedYear.value = response.data.year
            if (!selectedMonth.value) selectedMonth.value = response.data.month
        }
    } catch (error) {
        console.error("Failed to fetch default period:", error)
    }
}

onMounted(() => {
    fetchDefaultPeriod()
})

const goBack = () => {
    if (window.history.length > 1 && window.history.state?.back) {
        router.back()
    } else {
        router.push('/')
    }
}
</script>
