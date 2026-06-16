<template>
    <UContainer>
        <HeroBackground />
        <CommissionHeader
            :employee="employee"
            v-model:year="year"
            mode="yearly"
            route-prefix="manager"
            subtitle="Yearly manager commission summary 📊"
        />

        <!-- Yearly Summary Totals -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 py-4">
            <MetricCard
                label="Manager Commission"
                icon="i-lucide-wallet"
                icon-color="text-blue-500 dark:text-blue-400"
                :value="yearlyTotals.managerCommission"
                :is-currency="true"
            />
            <MetricCard
                label="Total Commission"
                icon="i-lucide-coins"
                icon-color="text-purple-500 dark:text-purple-400"
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
                icon="i-lucide-banknote"
                icon-color="text-amber-500 dark:text-amber-400"
                :value="yearlyTotals.subscription"
                :is-currency="true"
            />
            <MetricCard
                label="New Customer"
                icon="i-lucide-user-plus"
                icon-color="text-cyan-500 dark:text-cyan-400"
                :value="yearlyTotals.newCustomer"
            />
            <MetricCard
                label="New Account"
                icon="i-lucide-users"
                icon-color="text-teal-500 dark:text-teal-400"
                :value="yearlyTotals.newAccount"
            />
        </div>

        <!-- Monthly Breakdown Table -->
        <div class="pb-4">
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

        <!-- Team Yearly Performance -->
        <div v-if="teamData.length > 0" class="pb-4">
            <UCard>
                <template #header>
                    <div>
                        <h3 class="text-lg font-semibold">Team Yearly Performance</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Per-employee yearly summary for {{ year }}</p>
                    </div>
                </template>
                <UTable sticky :data="teamTableData" :columns="teamColumns" class="max-h-[800px]" @select="onSelectTeamMember" :ui="{ tr: 'cursor-pointer' }" />
            </UCard>
        </div>

        <!-- Charts Section -->
        <div class="space-y-4 pb-4">
            <!-- Commission Trend — full width hero chart -->
            <UCard>
                <template #header>
                    <div>
                        <h3 class="text-lg font-semibold">Commission Trend</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Manager & total commission over {{ year }}</p>
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

            <!-- Growth Metrics — full width -->
            <UCard>
                <template #header>
                    <div>
                        <h3 class="text-lg font-semibold">Growth Metrics</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">New customers & accounts per month</p>
                    </div>
                </template>
                <ClientOnly>
                    <LineChart
                        :data="chartData"
                        :categories="growthCategories"
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
import { TeamService } from '~/services/team-service'
import type { Employee } from '~/types/employee'
import type { ManagerCommissionYearlyData } from '~/types/manager'
import type { ManagerTeamYearlyMemberData } from '~/types/team'
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const ClientOnly = resolveComponent('ClientOnly')
const UAvatar = resolveComponent('UAvatar')

const route = useRoute()
const employee = ref<Employee>()
const year = ref<number>()
const yearlyData = ref<ManagerCommissionYearlyData[]>([])
const teamData = ref<ManagerTeamYearlyMemberData[]>([])

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface YearlyTableRow {
    month: string
    managerCommission: number
    commission: number
    mrc: number
    subscription: number
    newCustomer: number
    newAccount: number
}

interface TeamYearlyTableRow {
    employeeId: string
    name: string
    photoProfile: string
    commission: number
    mrc: number
    subscription: number
    newCustomer: number
    newAccount: number
    managerCommission: number
}

const tableData = computed<YearlyTableRow[]>(() => {
    return yearlyData.value.map((item, index) => ({
        month: monthNames[index] ?? '',
        managerCommission: item.managerCommission,
        commission: item.commission,
        mrc: item.mrc,
        subscription: item.subscription,
        newCustomer: item.newCustomer,
        newAccount: item.newAccount
    }))
})

const yearlyTotals = computed(() => {
    return yearlyData.value.reduce((acc, item) => ({
        managerCommission: acc.managerCommission + item.managerCommission,
        commission: acc.commission + item.commission,
        mrc: acc.mrc + item.mrc,
        subscription: acc.subscription + item.subscription,
        newCustomer: acc.newCustomer + item.newCustomer,
        newAccount: acc.newAccount + item.newAccount
    }), { managerCommission: 0, commission: 0, mrc: 0, subscription: 0, newCustomer: 0, newAccount: 0 })
})

const teamTableData = computed<TeamYearlyTableRow[]>(() => {
    return teamData.value.map(member => {
        const totals = member.monthly.reduce((acc, m) => ({
            commission: acc.commission + m.commission,
            mrc: acc.mrc + m.mrc,
            subscription: acc.subscription + m.subscription,
            newCustomer: acc.newCustomer + m.newCustomer,
            newAccount: acc.newAccount + m.newAccount,
            managerCommission: acc.managerCommission + m.managerCommission
        }), { commission: 0, mrc: 0, subscription: 0, newCustomer: 0, newAccount: 0, managerCommission: 0 })

        return {
            employeeId: member.employeeId,
            name: member.name,
            photoProfile: member.photoProfile,
            ...totals
        }
    })
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
        accessorKey: 'managerCommission',
        header: 'Manager Commission',
        meta: { class: { th: 'text-right', td: 'text-right' } },
        cell: ({ row }) => {
            return h('span', { class: 'font-semibold text-blue-600 dark:text-blue-400' }, formatCurrency(Number(row.getValue('managerCommission'))))
        },
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.managerCommission) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        accessorKey: 'commission',
        header: 'Total Commission',
        meta: { class: { th: 'text-right', td: 'text-right' } },
        cell: ({ row }) => {
            return h('span', { class: 'font-medium' }, formatCurrency(Number(row.getValue('commission'))))
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
        accessorKey: 'newCustomer',
        header: 'New Customer',
        meta: { class: { th: 'text-center', td: 'text-center font-medium' } },
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.newCustomer) || 0), 0)
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

const teamColumns: TableColumn<TeamYearlyTableRow>[] = [
    {
        accessorKey: 'name',
        header: 'Sales',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h(UAvatar, {
                    src: row.original.photoProfile || undefined,
                    size: 'lg'
                }),
                h('div', { class: 'flex flex-col' }, [
                    h('span', { class: 'font-medium text-highlighted' }, row.original.name),
                    h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, row.original.employeeId)
                ])
            ])
        }
    },
    {
        header: 'Commission',
        meta: { class: { th: 'text-right', td: 'text-right font-medium' } },
        cell: ({ row }) => formatCurrency(row.original.commission),
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.commission) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        header: 'MRC',
        meta: { class: { th: 'text-right', td: 'text-right font-medium' } },
        cell: ({ row }) => formatCurrency(row.original.mrc),
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.mrc) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        header: 'Subscription',
        meta: { class: { th: 'text-right', td: 'text-right font-medium' } },
        cell: ({ row }) => formatCurrency(row.original.subscription),
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.subscription) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        header: 'New Customer',
        meta: { class: { th: 'text-center', td: 'text-center font-medium' } },
        cell: ({ row }) => row.original.newCustomer,
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.newCustomer) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-center font-bold' }, total),
                fallback: () => h('div', { class: 'text-center font-bold' }, 0)
            })
        }
    },
    {
        header: 'New Account',
        meta: { class: { th: 'text-center', td: 'text-center font-medium' } },
        cell: ({ row }) => row.original.newAccount,
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.newAccount) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-center font-bold' }, total),
                fallback: () => h('div', { class: 'text-center font-bold' }, 0)
            })
        }
    },
    {
        header: 'Manager Commission',
        meta: { class: { th: 'text-right', td: 'text-right' } },
        cell: ({ row }) => {
            return h('div', { class: 'flex flex-col' }, [
                h('span', { class: 'text-sm font-bold text-highlighted' }, '25%'),
                h('span', { class: 'text-sm font-medium text-highlighted' }, formatCurrency(row.original.managerCommission))
            ])
        },
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows.reduce((acc, row) => acc + (Number(row.original.managerCommission) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    }
]

// Chart Data
const chartData = computed(() => {
    return yearlyData.value.map((item, index) => ({
        month: monthShort[index] ?? '',
        managerCommission: item.managerCommission,
        commission: item.commission,
        mrc: item.mrc,
        subscription: item.subscription,
        newCustomer: item.newCustomer,
        newAccount: item.newAccount
    }))
})

const xFormatter = (i: number) => chartData.value[i]?.month ?? ''

const commissionCategories = {
    managerCommission: { name: 'Manager Commission', color: '#3b82f6' },
    commission: { name: 'Total Commission', color: '#8b5cf6' }
}

const mrcCategories = {
    mrc: { name: 'MRC', color: '#10b981' }
}

const subscriptionCategories = {
    subscription: { name: 'Subscription', color: '#f59e0b' }
}

const growthCategories = {
    newCustomer: { name: 'New Customer', color: '#06b6d4' },
    newAccount: { name: 'New Account', color: '#14b8a6' }
}

const formatCompactCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(value)
}

const onSelectTeamMember = (event: any, row: any) => {
    const data = row?.original || row
    if (data?.employeeId) {
        navigateTo(`/${data.employeeId}/sales`)
    }
}

const fetchEmployee = async () => {
    const employeeService = new EmployeeService()
    const employeeData = await employeeService.getEmployee(route.params.id as string)
    employee.value = employeeData.data
}

const fetchYearlyData = async () => {
    if (!year.value) return
    const commissionService = new CommissionService()
    const response = await commissionService.managerCommissionYearly(route.params.id as string, { year: year.value })
    if (response?.data) {
        yearlyData.value = response.data
    }

    const teamService = new TeamService()
    const teamResponse = await teamService.getManagerTeamYearly(route.params.id as string, { year: year.value })
    if (teamResponse?.data) {
        teamData.value = teamResponse.data
    }
}

watch(year, () => {
    fetchYearlyData()
})

fetchEmployee()
</script>
