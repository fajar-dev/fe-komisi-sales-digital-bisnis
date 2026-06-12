<template>
    <UContainer>
        <HeroBackground />
        <CommissionHeader
            :employee="employee"
            v-model:year="year"
            mode="yearly"
            subtitle="Yearly sales commission summary 📊"
        />

        <!-- Yearly Totals -->
        <div class="py-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                    label="Total Commission"
                    icon="i-lucide-wallet"
                    icon-color="text-info dark:text-blue-400"
                    :value="yearlyTotals.commission"
                    :is-currency="true"
                    :large="true"
                />
                <MetricCard
                    label="Total MRC"
                    icon="i-lucide-trending-up"
                    icon-color="text-emerald-500 dark:text-emerald-400"
                    :value="yearlyTotals.mrc"
                    :is-currency="true"
                />
                <MetricCard
                    label="Total Subscription"
                    icon="i-lucide-coins"
                    icon-color="text-purple-500 dark:text-purple-400"
                    :value="yearlyTotals.subscription"
                    :is-currency="true"
                />
                <MetricCard
                    label="New Customer"
                    icon="i-lucide-user-plus"
                    icon-color="text-amber-500 dark:text-amber-400"
                    :value="yearlyTotals.newCustomer"
                />
                <MetricCard
                    label="New Account"
                    icon="i-lucide-users"
                    icon-color="text-cyan-500 dark:text-cyan-400"
                    :value="yearlyTotals.newAccount"
                />
            </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
            <MetricCard
                v-for="(item, index) in tableData"
                :key="index"
                :label="item.month"
                icon="i-lucide-calendar"
                icon-color="text-info dark:text-blue-400"
                :value="item.commission"
                :is-currency="true"
            >
                <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500 dark:text-gray-400">MRC</span>
                        <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(item.mrc) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500 dark:text-gray-400">Subscription</span>
                        <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(item.subscription) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500 dark:text-gray-400">New Customer</span>
                        <span class="font-semibold text-gray-900 dark:text-white">{{ item.newCustomer }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500 dark:text-gray-400">New Account</span>
                        <span class="font-semibold text-gray-900 dark:text-white">{{ item.newAccount }}</span>
                    </div>
                </div>
            </MetricCard>
        </div>

        <!-- Charts Section -->
        <div v-if="yearlyData.length > 0" class="py-2 mt-2">
            <div class="grid grid-cols-1 gap-4">
                <!-- Commission Trend (Area Chart) -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-trending-up" class="w-5 h-5 text-info" />
                            <div>
                                <h3 class="text-lg font-semibold">Commission Trend</h3>
                                <p class="text-sm text-gray-500">Monthly commission over {{ year }}</p>
                            </div>
                        </div>
                    </template>
                    <ClientOnly>
                        <AreaChart
                            :data="chartData"
                            :categories="commissionCategories"
                            :height="280"
                            :xFormatter="xFormatter"
                            :yFormatter="formatCompactCurrency"
                        />
                    </ClientOnly>
                </UCard>

                <!-- MRC Trend (Bar Chart) -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 text-emerald-500" />
                            <div>
                                <h3 class="text-lg font-semibold">MRC Trend</h3>
                                <p class="text-sm text-gray-500">Monthly MRC revenue</p>
                            </div>
                        </div>
                    </template>
                    <ClientOnly>
                        <BarChart
                            :data="chartData"
                            :categories="mrcCategories"
                            :yAxis="['mrc']"
                            :height="280"
                            :xFormatter="xFormatter"
                            :yFormatter="formatCompactCurrency"
                        />
                    </ClientOnly>
                </UCard>

                <!-- Subscription Trend (Bar Chart) -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-coins" class="w-5 h-5 text-purple-500" />
                            <div>
                                <h3 class="text-lg font-semibold">Subscription Trend</h3>
                                <p class="text-sm text-gray-500">Monthly subscription revenue</p>
                            </div>
                        </div>
                    </template>
                    <ClientOnly>
                        <BarChart
                            :data="chartData"
                            :categories="subscriptionCategories"
                            :yAxis="['subscription']"
                            :height="280"
                            :xFormatter="xFormatter"
                            :yFormatter="formatCompactCurrency"
                        />
                    </ClientOnly>
                </UCard>

                <!-- Growth Metrics (Line Chart) -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-user-plus" class="w-5 h-5 text-amber-500" />
                            <div>
                                <h3 class="text-lg font-semibold">Growth Metrics</h3>
                                <p class="text-sm text-gray-500">New customers & accounts per month</p>
                            </div>
                        </div>
                    </template>
                    <ClientOnly>
                        <LineChart
                            :data="chartData"
                            :categories="growthCategories"
                            :height="280"
                            :xFormatter="xFormatter"
                        />
                    </ClientOnly>
                </UCard>
            </div>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { EmployeeService } from '~/services/employee-service'
import { CommissionService } from '~/services/commission-service'
import type { Employee } from '~/types/employee'
import type { SalesCommissionYearlyData } from '~/types/sales'
import { resolveComponent } from 'vue'

const ClientOnly = resolveComponent('ClientOnly')

const route = useRoute()
const employee = ref<Employee>()
const year = ref<number>()
const yearlyData = ref<SalesCommissionYearlyData[]>([])

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface YearlyTableRow {
    month: string
    commission: number
    mrc: number
    subscription: number
    newCustomer: number
    newAccount: number
}

const tableData = computed<YearlyTableRow[]>(() => {
    return yearlyData.value.map((item, index) => ({
        month: monthNames[index] ?? '',
        commission: item.commission,
        mrc: item.mrc,
        subscription: item.subscription,
        newCustomer: item.newCustomer,
        newAccount: item.newAccount
    }))
})

const yearlyTotals = computed(() => {
    return yearlyData.value.reduce((acc, item) => ({
        commission: acc.commission + item.commission,
        mrc: acc.mrc + item.mrc,
        subscription: acc.subscription + item.subscription,
        newCustomer: acc.newCustomer + item.newCustomer,
        newAccount: acc.newAccount + item.newAccount
    }), { commission: 0, mrc: 0, subscription: 0, newCustomer: 0, newAccount: 0 })
})

// Chart Data
const chartData = computed(() => {
    return yearlyData.value.map((item, index) => ({
        month: monthShort[index] ?? '',
        commission: item.commission,
        mrc: item.mrc,
        subscription: item.subscription,
        newCustomer: item.newCustomer,
        newAccount: item.newAccount
    }))
})

const xFormatter = (i: number) => chartData.value[i]?.month ?? ''

const commissionCategories = {
    commission: { name: 'Commission', color: '#3b82f6' }
}

const mrcCategories = {
    mrc: { name: 'MRC', color: '#10b981' }
}

const subscriptionCategories = {
    subscription: { name: 'Subscription', color: '#8b5cf6' }
}

const growthCategories = {
    newCustomer: { name: 'New Customer', color: '#f59e0b' },
    newAccount: { name: 'New Account', color: '#06b6d4' }
}

const formatCompactCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(value)
}



const fetchEmployee = async () => {
    const employeeService = new EmployeeService()
    const employeeData = await employeeService.getEmployee(route.params.id as string)
    employee.value = employeeData.data
}

const fetchYearlyData = async () => {
    if (!year.value) return
    const commissionService = new CommissionService()
    const response = await commissionService.salesCommissionYearly(route.params.id as string, { year: year.value })
    if (response?.data) {
        yearlyData.value = response.data
    }
}

watch(year, () => {
    fetchYearlyData()
})

fetchEmployee()
</script>
