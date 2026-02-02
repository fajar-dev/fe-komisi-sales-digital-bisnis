<template>
    <UContainer>
        <HeroBackground />
        <div class="space-y-8 py-8">
        <UPageHeader
            :title="`Hello, ${authState.user?.name ?? ''} 👋`"            
            :description="`${greeting}, Have a nice day 😃`"
        >
        </UPageHeader>
        </div>

        <div class="py-2">
        <div class="flex items-end justify-between">
            <div class="space-y-1">
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                    My Team
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Team member list
                </p>
            </div>
        </div>
        </div>

        <div class="py-2">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <UPageCard
                v-for="card in employeeCard"
                :key="card.employeeId"
                :to="card.to"
            >
                <template #body>
                    <UUser
                        :avatar="{ src: card.photoProfile, alt: card.name }"
                        class="w-full"
                        :ui="{ avatar: 'h-14 w-14' }"
                    >
                        <div class="min-w-0">
                        <h1 class="text-md font-medium text-gray-900 dark:text-white truncate">
                            {{ card.name }}
                        </h1>

                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                            {{ card.employeeId }} - {{ card.organizationName }}
                        </p>

                        <p class="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {{ card.position }} 
                        </p>
                        </div>
                    </UUser>
                    </template>

            </UPageCard>
        </div>
        </div>

    </UContainer>
</template>

<script setup lang="ts">
import { EmployeeService } from '~/services/employee-service';

const { state: authState } = useAuth()
const employeeCard = ref<{ employeeId: string; name: string; photoProfile: string; position: string; organizationName: string; jobLevel: string; to: string }[]>([])

const { getRoute } = useDashboardRoute()

const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
})

const fetchEmployeeCard = async () => {
    if (!authState.user?.employee_id) return
    const employeeService = new EmployeeService()
    const data = await employeeService.getEmployeeHierarchy(authState.user?.employee_id)
    employeeCard.value = data.data.map((item) => {
        return {
            photoProfile: item.photo_profile,
            name: item.name,
            employeeId: item.employee_id,
            position: item.job_position,
            organizationName: item.organization_name,
            jobLevel: item.job_level,
            to: getRoute(item),
        }
    })
}

watch(() => authState.user, (user) => {
    if (user?.employee_id) {
        fetchEmployeeCard()
    }
}, { immediate: true })

</script>
