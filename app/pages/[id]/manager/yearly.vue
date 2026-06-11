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

        <div class="py-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                    label="Manager Commission"
                    icon="i-lucide-wallet"
                    icon-color="text-info dark:text-blue-400"
                    :value="yearlyTotals.managerCommission"
                    :is-currency="true"
                    :large="true"
                />
                <div class="flex flex-col gap-4">
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
                </div>
                <div class="flex flex-col gap-4">
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
                </div>
            </div>
        </div>

        <div class="py-2 mt-4">
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">Yearly Summary</h3>
                    <p class="text-sm text-gray-500">Monthly breakdown for {{ year }}</p>
                </template>
                <UTable sticky :data="tableData" :columns="columns" class="flex-1 max-h-[800px]" />
            </UCard>
        </div>

        <div v-if="teamData.length > 0" class="py-2 mt-4">
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">Team Yearly Performance</h3>
                    <p class="text-sm text-gray-500">Per-employee yearly summary for {{ year }}</p>
                </template>
                <UTable sticky :data="teamTableData" :columns="teamColumns" class="flex-1 max-h-[800px]" @select="onSelectTeamMember" :ui="{ tr: 'cursor-pointer' }" />
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

const columns: TableColumn<YearlyTableRow>[] = [
    {
        accessorKey: 'month',
        header: 'Month',
        cell: ({ row }) => h('span', { class: 'font-semibold' }, row.original.month)
    },
    {
        accessorKey: 'managerCommission',
        header: 'Manager Commission',
        meta: { class: { th: 'text-right', td: 'text-right font-medium' } },
        cell: ({ row }) => formatCurrency(row.original.managerCommission),
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
        accessorKey: 'mrc',
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
        accessorKey: 'subscription',
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
        accessorKey: 'newCustomer',
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
        accessorKey: 'newAccount',
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
