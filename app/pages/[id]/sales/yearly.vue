<template>
    <UContainer>
        <HeroBackground />
        <CommissionHeader
            :employee="employee"
            v-model:year="year"
            mode="yearly"
            subtitle="Yearly sales commission summary 📊"
        />

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

        <div class="py-2 mt-4">
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">Yearly Summary</h3>
                    <p class="text-sm text-gray-500">Monthly breakdown for {{ year }}</p>
                </template>
                <UTable sticky :data="tableData" :columns="columns" class="flex-1 max-h-[800px]" />
            </UCard>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { EmployeeService } from '~/services/employee-service'
import { CommissionService } from '~/services/commission-service'
import type { Employee } from '~/types/employee'
import type { SalesCommissionYearlyData } from '~/types/sales'
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const ClientOnly = resolveComponent('ClientOnly')

const route = useRoute()
const employee = ref<Employee>()
const year = ref<number>()
const yearlyData = ref<SalesCommissionYearlyData[]>([])

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

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

const columns: TableColumn<YearlyTableRow>[] = [
    {
        accessorKey: 'month',
        header: 'Month',
        cell: ({ row }) => {
            return h('span', { class: 'font-semibold' }, row.original.month)
        }
    },
    {
        accessorKey: 'commission',
        header: 'Commission',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => formatCurrency(row.original.commission),
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.commission) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        accessorKey: 'mrc',
        header: 'MRC',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => formatCurrency(row.original.mrc),
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.mrc) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        accessorKey: 'subscription',
        header: 'Subscription',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => formatCurrency(row.original.subscription),
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.subscription) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        accessorKey: 'newCustomer',
        header: 'New Customer',
        meta: {
            class: {
                th: 'text-center',
                td: 'text-center font-medium'
            }
        },
        cell: ({ row }) => row.original.newCustomer,
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.newCustomer) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-center font-bold' }, total),
                fallback: () => h('div', { class: 'text-center font-bold' }, 0)
            })
        }
    },
    {
        accessorKey: 'newAccount',
        header: 'New Account',
        meta: {
            class: {
                th: 'text-center',
                td: 'text-center font-medium'
            }
        },
        cell: ({ row }) => row.original.newAccount,
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.newAccount) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-center font-bold' }, total),
                fallback: () => h('div', { class: 'text-center font-bold' }, 0)
            })
        }
    }
]

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
