<template>
    <UContainer>
        <HeroBackground />
        <CommissionHeader
            :employee="employee"
            v-model:year="year"
            v-model:month="month"
            subtitle="Monthly manager commission heatmap 🔥"
        />

        <div class="py-2 mt-4">
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Team</h3>
                </template>
                <UTable sticky :data="teamData" :columns="teamColumns" class="flex-1 max-h-[800px]" @select="onSelectTeamMember" :ui="{ tr: 'cursor-pointer' }" />
            </UCard>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { AdditionalService } from '~/services/additional-service'
import { EmployeeService } from '~/services/employee-service'
import { TeamService } from '~/services/team-service'
import type { Employee } from '~/types/employee'
import type { ManagerTeamMemberData } from '~/types/team'
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UAvatar = resolveComponent('UAvatar')
const ClientOnly = resolveComponent('ClientOnly')

const route = useRoute()
const employee = ref<Employee>()  

const year = ref<number>()
const month = ref<number>()

const teamData = ref<ManagerTeamMemberData[]>([])

const teamColumns: TableColumn<ManagerTeamMemberData>[] = [
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
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => {
            return formatCurrency(row.original.detail.commission)
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.detail.commission) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        header: 'MRC',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => {
            return formatCurrency(row.original.detail.mrc)
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.detail.mrc) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        header: 'Subscription',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => {
            return formatCurrency(row.original.detail.subscription)
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.detail.subscription) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        header: 'New Customer',
        meta: {
            class: {
                th: 'text-center',
                td: 'text-center font-medium'
            }
        },
        cell: ({ row }) => {
            return row.original.detail.newCustomer
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.detail.newCustomer) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-center font-bold' }, total),
                fallback: () => h('div', { class: 'text-center font-bold' }, 0)
            })
        }
    },
    {
        header: 'New Account',
        meta: {
            class: {
                th: 'text-center',
                td: 'text-center font-medium'
            }
        },
        cell: ({ row }) => {
            return row.original.detail.newAccount
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.detail.newAccount) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-center font-bold' }, total),
                fallback: () => h('div', { class: 'text-center font-bold' }, 0)
            })
        }
    },
    {
        header: 'Manager Commission',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right'
            }
        },
        cell: ({ row }) => {
            return h('div', { class: 'flex flex-col' }, [
                h('span', { class: 'text-sm font-bold text-highlighted' }, '25%'),
                h('span', { class: 'text-sm font-medium text-highlighted' }, formatCurrency(row.original.managerCommission))
            ])
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.managerCommission) || 0), 0)
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

const fetchData = async () => {
    const additionalService = new AdditionalService()
    await additionalService.getCurrentPeriod()
    const employeeService = new EmployeeService()
    const employeeData = await employeeService.getEmployee(route.params.id as string)
    employee.value = employeeData.data
}

const fetchTeamData = async () => {
    if (!year.value || !month.value) return
    const teamService = new TeamService()
    const response = await teamService.getManagerTeam(route.params.id as string, { month: month.value, year: year.value })
    teamData.value = response.data
}

watch([year, month], () => {
    fetchTeamData()
})

fetchData()
</script>