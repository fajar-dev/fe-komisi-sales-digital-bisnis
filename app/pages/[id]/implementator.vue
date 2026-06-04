<template>
    <UContainer>
        <HeroBackground />
        <CommissionHeader
            :employee="employee"
            v-model:year="year"
            v-model:month="month"
            subtitle="Monthly implementator commission heatmap 🔥"
        />

        <!-- Metrics Summary Cards using Nuxt UI -->
        <div class="py-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Commission Card -->
                <UCard>
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            Total Commission
                        </span>
                        <UIcon name="i-lucide-wallet" class="w-6 h-6 text-info dark:text-blue-400" />
                    </div>
                    <div class="mt-2">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {{ formatCurrency(commissionData?.commission?.total || 0) }}
                        </div>
                    </div>
                </UCard>

                <!-- MRC Card -->
                <UCard>
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            Total MRC
                        </span>
                        <UIcon name="i-lucide-trending-up" class="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div class="mt-2">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {{ formatCurrency(commissionData?.mrc || 0) }}
                        </div>
                    </div>
                </UCard>

                <!-- Subscription Card -->
                <UCard>
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            Total Subscription
                        </span>
                        <UIcon name="i-lucide-coins" class="w-6 h-6 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div class="mt-2">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {{ formatCurrency(commissionData?.subscription || 0) }}
                        </div>
                    </div>
                </UCard>

                <!-- Churn Card -->
                <UCard>
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            Customer Churns
                        </span>
                        <UIcon name="i-lucide-user-x" class="w-6 h-6 text-red-500 dark:text-red-400" />
                    </div>
                    <div class="mt-2">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {{ commissionData?.churnCount || 0 }}
                        </div>
                    </div>
                </UCard>
            </div>
        </div>
        
        <div class="py-2">
            <div class="grid grid-cols-1">
                <UCard>
                    <UTable sticky :data="invoiceData" :columns="columns" class="flex-1 max-h-[800px]" />
                </UCard>
            </div>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { AdditionalService } from '~/services/additional-service'
import { EmployeeService } from '~/services/employee-service'
import { InvoiceService } from '~/services/invoice-service'
import { CommissionService } from '~/services/commission-service'
import type { Employee } from '~/types/employee'
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { InvoiceImplementatorData, ImplementatorCommissionData } from '~/types/implementator'

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')
const ClientOnly = resolveComponent('ClientOnly')

const invoiceData = ref<InvoiceImplementatorData[]>([])
const commissionData = ref<ImplementatorCommissionData>()

const columns: TableColumn<InvoiceImplementatorData>[] = [
    {
        accessorKey: 'invoiceNumber',
        header: 'Invoice Number',
        cell: ({ row }) => {
            const invoiceNum = row.original.invoiceNumber
            return h('div', { class: 'flex flex-col' }, [
                h('a', { 
                    href: `https://isx.nusa.net.id/customer.php?module=customer&pid=printNewCustomerInvoice&invoiceNum=${invoiceNum}&urut=${row.original.sequenceNumber}&new=1&proforma=0&signature=0`,
                    target: '_blank',
                    class: ['text-info hover:underline font-bold']
                }, row.original.invoiceNumber),
                h('span', { class: 'text-sm whitespace-normal break-words' }, row.original.ai)
            ])
        }
    },
    {
        accessorKey: 'paidDate',
        header: 'Paid Date',
        cell: ({ row }) => {
            return new Date(row.getValue('paidDate')).toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })
        }
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const badge = getStatusBadge(row.original.status)
            return h(UBadge, { color: badge.color, variant: badge.variant }, () => badge.label)
        }
    },
    {
        header: 'Service',
        meta: {
            class: {
                th: 'min-w-[250px]',
                td: 'min-w-[250px]'
            }
        },
        cell: ({ row }) => {
            return h('div', { class: 'flex flex-col' }, [
                h('a', { 
                    href: `https://isx.nusa.net.id/v2/customer/service/${row.original.customerServiceId}/detail`,
                    target: '_blank',
                    class: ['text-info hover:underline font-semibold']
                }, row.original.customerServiceId),
                h('span', { class: 'text-sm whitespace-normal break-words' }, row.original.serviceName)
            ])
        }
    },
    {
        header: 'Customer',
        meta: {
            class: {
                th: 'min-w-[250px]',
                td: 'min-w-[250px]'
            }
        },
        cell: ({ row }) => {
            return h('div', { class: 'flex flex-col' }, [
                h('a', { 
                    href: `https://isx.nusa.net.id/customer.php?custId=${row.original.customerId}&pid=profile`,
                    target: '_blank',
                    class: ['text-info hover:underline font-semibold']
                }, row.original.customerId),
                h('span', { class: 'text-sm whitespace-normal break-words' }, row.original.customerCompany)
            ])
        }
    },
    {
        header: 'Sales',
        cell: ({ row }) => {
            const sales = row.original.sales
            if (!sales || !sales.employeeId) {
                return '-'
            }
            return h('div', { class: 'flex items-center gap-3' }, [
                h(UAvatar, {
                    src: sales.photoProfile || undefined,
                    size: 'lg'
                }),
                h('div', undefined, [
                    h('p', { class: 'font-medium text-highlighted' }, sales.name),
                    h('p', { class: '' }, sales.employeeId)
                ])
            ])
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
        cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue('subscription'))
            return formatCurrency(amount)
        },
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
        accessorKey: 'mrc',
        header: 'MRC',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue('mrc'))
            return formatCurrency(amount)
        },
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
        header: 'Month Period',
        meta: {
            class: {
                th: 'text-center',
                td: 'text-center font-medium'
            }
        },
        cell: ({ row }) => {
            const period = parseFloat(row.original.monthPeriod)
            return isNaN(period) ? '-' : Math.round(period)
        }
    },
    {
        header: 'Total Account',
        meta: {
            class: {
                th: 'text-center',
                td: 'text-center font-medium'
            }
        },
        cell: ({ row }) => {
            return row.original.totalAccount
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
            return h('div', { class: 'flex flex-col' }, [
                h('span', { class: 'text-sm text-highlighted' }, Intl.NumberFormat('id-ID', { style: 'decimal' }).format(row.original.commissionPercentage) + '%'),
                h('span', { class: 'text-sm' }, formatCurrency(row.original.commission))
            ])
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.commission) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    }
]

const route = useRoute()
const employee = ref<Employee>()  

const year = ref<number>()
const month = ref<number>()

const fetchData = async () => {
    const additionalService = new AdditionalService()
    await additionalService.getCurrentPeriod()
    const employeeService = new EmployeeService()
    const employeeData = await employeeService.getEmployee(route.params.id as string)
    employee.value = employeeData.data
}

const fetchInvoiceData = async () => {
    if (!year.value || !month.value) return
    const invoiceService = new InvoiceService()
    const response = await invoiceService.getInvoiceImplementator(route.params.id as string, {month: month.value, year: year.value})
    invoiceData.value = response.data

    const commissionService = new CommissionService()
    const commissionResponse = await commissionService.implementatorCommission(route.params.id as string, {month: month.value, year: year.value})
    if (commissionResponse?.data) {
        commissionData.value = commissionResponse.data
    }
}

watch([year, month], () => {
    fetchInvoiceData()
})

fetchData()
</script>
