<template>
    <UContainer>
        <HeroBackground />
        <CommissionHeader
            :employee="employee"
            v-model:year="year"
            mode="yearly"
            route-prefix="implementator"
            subtitle="Yearly implementator commission summary 📊"
        />

        <!-- Yearly Summary Totals -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 py-4">
            <MetricCard
                label="Total Commission"
                icon="i-lucide-wallet"
                icon-color="text-blue-500 dark:text-blue-400"
                :value="yearlyTotals.commission"
                :is-currency="true"
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
                label="Customer Churns"
                icon="i-lucide-user-x"
                icon-color="text-red-500 dark:text-red-400"
                :value="yearlyTotals.churnCount"
            />
            <MetricCard
                label="New Accounts"
                icon="i-lucide-users"
                icon-color="text-cyan-500 dark:text-cyan-400"
                :value="yearlyTotals.newAccount"
            />
        </div>

        <!-- Monthly Breakdown Table -->
        <div class="pb-6">
            <UCard>
                <template #header>
                    <div>
                        <h3 class="text-lg font-semibold">Monthly Breakdown</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Detailed monthly performance for {{ year }}</p>
                    </div>
                </template>
                <UTable sticky :data="tableData" :columns="monthlyColumns" class="max-h-[600px]" />
            </UCard>
        </div>

        <!-- Charts Section -->
        <div class="space-y-4 pb-4">
            <!-- Commission Trend — full width hero chart -->
            <UCard>
                <template #header>
                    <div>
                        <h3 class="text-lg font-semibold">Commission Trend</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Monthly commission over {{ year }}</p>
                    </div>
                </template>
                <ClientOnly>
                    <AreaChart
                        :data="chartData"
                        :categories="commissionCategories"
                        :height="300"
                        :xFormatter="xFormatter"
                        :yFormatter="formatCompactCurrency"
                    />
                </ClientOnly>
            </UCard>

            <!-- Two-column chart row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <UCard>
                    <template #header>
                        <div>
                            <h3 class="text-lg font-semibold">MRC Trend</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Monthly MRC revenue</p>
                        </div>
                    </template>
                    <ClientOnly>
                        <BarChart
                            :data="chartData"
                            :categories="mrcCategories"
                            :yAxis="['mrc']"
                            :height="260"
                            :xFormatter="xFormatter"
                            :yFormatter="formatCompactCurrency"
                        />
                    </ClientOnly>
                </UCard>

                <UCard>
                    <template #header>
                        <div>
                            <h3 class="text-lg font-semibold">Subscription Trend</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Monthly subscription revenue</p>
                        </div>
                    </template>
                    <ClientOnly>
                        <BarChart
                            :data="chartData"
                            :categories="subscriptionCategories"
                            :yAxis="['subscription']"
                            :height="260"
                            :xFormatter="xFormatter"
                            :yFormatter="formatCompactCurrency"
                        />
                    </ClientOnly>
                </UCard>
            </div>

            <!-- Churn & New Account — full width -->
            <UCard>
                <template #header>
                    <div>
                        <h3 class="text-lg font-semibold">Churn & Growth</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Customer churns & new accounts per month</p>
                    </div>
                </template>
                <ClientOnly>
                    <LineChart
                        :data="chartData"
                        :categories="churnGrowthCategories"
                        :height="260"
                        :xFormatter="xFormatter"
                    />
                </ClientOnly>
            </UCard>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { EmployeeService } from '~/services/employee-service'
import { CommissionService } from '~/services/commission-service'
import type { Employee } from '~/types/employee'
import type { ImplementatorCommissionYearlyData } from '~/types/implementator'
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const ClientOnly = resolveComponent('ClientOnly')

const route = useRoute()
const employee = ref<Employee>()
const year = ref<number>()
const yearlyData = ref<ImplementatorCommissionYearlyData[]>([])

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
    churnCount: number
    newAccount: number
}

const tableData = computed<YearlyTableRow[]>(() => {
    return yearlyData.value.map((item, index) => ({
        month: monthNames[index] ?? '',
        commission: item.commission,
        mrc: item.mrc,
        subscription: item.subscription,
        churnCount: item.churnCount,
        newAccount: item.newAccount
    }))
})

const monthlyColumns: TableColumn<YearlyTableRow>[] = [
    {
        accessorKey: 'month',
        header: 'Month',
        cell: ({ row }) => {
            return h('span', { class: 'font-semibold text-gray-900 dark:text-white' }, row.getValue('month'))
        }
    },
    {
        accessorKey: 'commission',
        header: 'Commission',
        meta: { class: { th: 'text-right', td: 'text-right' } },
        cell: ({ row }) => {
            return h('span', { class: 'font-semibold text-blue-600 dark:text-blue-400' }, formatCurrency(Number(row.getValue('commission'))))
        },
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.commission) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        accessorKey: 'mrc',
        header: 'MRC',
        meta: { class: { th: 'text-right', td: 'text-right' } },
        cell: ({ row }) => {
            return h('span', { class: 'font-medium' }, formatCurrency(Number(row.getValue('mrc'))))
        },
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.mrc) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        accessorKey: 'subscription',
        header: 'Subscription',
        meta: { class: { th: 'text-right', td: 'text-right' } },
        cell: ({ row }) => {
            return h('span', { class: 'font-medium' }, formatCurrency(Number(row.getValue('subscription'))))
        },
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.subscription) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        accessorKey: 'churnCount',
        header: 'Churn Count',
        meta: { class: { th: 'text-center', td: 'text-center font-medium' } },
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.churnCount) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-center font-bold' }, total),
                fallback: () => h('div', { class: 'text-center font-bold' }, 0)
            })
        }
    },
    {
        accessorKey: 'newAccount',
        header: 'New Account',
        meta: { class: { th: 'text-center', td: 'text-center font-medium' } },
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.newAccount) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-center font-bold' }, total),
                fallback: () => h('div', { class: 'text-center font-bold' }, 0)
            })
        }
    }
]

const yearlyTotals = computed(() => {
    return yearlyData.value.reduce((acc, item) => ({
        commission: acc.commission + item.commission,
        mrc: acc.mrc + item.mrc,
        subscription: acc.subscription + item.subscription,
        churnCount: acc.churnCount + item.churnCount,
        newAccount: acc.newAccount + item.newAccount
    }), { commission: 0, mrc: 0, subscription: 0, churnCount: 0, newAccount: 0 })
})

// Chart Data
const chartData = computed(() => {
    return yearlyData.value.map((item, index) => ({
        month: monthShort[index] ?? '',
        commission: item.commission,
        mrc: item.mrc,
        subscription: item.subscription,
        churnCount: item.churnCount,
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

const churnGrowthCategories = {
    churnCount: { name: 'Customer Churns', color: '#ef4444' },
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
    const response = await commissionService.implementatorCommissionYearly(route.params.id as string, { year: year.value })
    if (response?.data) {
        yearlyData.value = response.data
    }
}

watch(year, () => {
    fetchYearlyData()
})

fetchEmployee()
</script>
