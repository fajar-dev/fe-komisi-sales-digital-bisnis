<template>
    <UContainer>
        <HeroBackground />
        <CommissionHeader
            :employee="employee"
            v-model:year="year"
            v-model:month="month"
            subtitle="Monthly sales commission heatmap 🔥"
        />

        <div class="py-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Commission Card -->
                <MetricCard
                    label="Total Commission"
                    icon="i-lucide-wallet"
                    icon-color="text-info dark:text-blue-400"
                    :data="commissionData?.commission?.total"
                    :is-currency="true"
                    :large="true"
                >
                    <div v-if="commissionData?.commission" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-500 dark:text-gray-400">New</span>
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatCurrency(commissionData.commission.new?.value || 0) }}</span>
                                <UBadge
                                    v-if="commissionData.commission.new"
                                    :color="trendColor(commissionData.commission.new.trend)"
                                    variant="soft"
                                    size="sm"
                                >
                                    {{ formatPercentage(commissionData.commission.new.percentage) }}
                                </UBadge>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-500 dark:text-gray-400">Recurring</span>
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatCurrency(commissionData.commission.recurring?.value || 0) }}</span>
                                <UBadge
                                    v-if="commissionData.commission.recurring"
                                    :color="trendColor(commissionData.commission.recurring.trend)"
                                    variant="soft"
                                    size="sm"
                                >
                                    {{ formatPercentage(commissionData.commission.recurring.percentage) }}
                                </UBadge>
                            </div>
                        </div>
                    </div>
                </MetricCard>

                <!-- New Customer & New User Stacked -->
                <div class="flex flex-col gap-4">
                    <MetricCard
                        label="New Customer"
                        icon="i-lucide-user-plus"
                        icon-color="text-amber-500 dark:text-amber-400"
                        :data="commissionData?.newCustomer"
                    />
                    <MetricCard
                        label="New User"
                        icon="i-lucide-users"
                        icon-color="text-cyan-500 dark:text-cyan-400"
                        :data="commissionData?.newUser"
                    />
                </div>

                <!-- MRC & Subscription Stacked -->
                <div class="flex flex-col gap-4">
                    <MetricCard
                        label="Total MRC"
                        icon="i-lucide-trending-up"
                        icon-color="text-emerald-500 dark:text-emerald-400"
                        :data="commissionData?.mrc"
                        :is-currency="true"
                    />
                    <MetricCard
                        label="Total Subscription"
                        icon="i-lucide-coins"
                        icon-color="text-purple-500 dark:text-purple-400"
                        :data="commissionData?.subscription"
                        :is-currency="true"
                    />
                </div>
            </div>
        </div>

        <div class="py-2 mt-4">
            <UTabs :items="tabItems" v-model="activeTab">
                <template #internal>
                    <div class="grid grid-cols-1 mt-4">
                        <UCard>
                            <UTable sticky :data="invoiceData" :columns="columns" class="flex-1 max-h-[800px]" />
                        </UCard>
                    </div>
                </template>
                <template #resell>
                    <div class="grid grid-cols-1 mt-4">
                        <UAlert
                            v-if="resellWarningCount > 0"
                            color="warning"
                            variant="soft"
                            icon="i-lucide-triangle-alert"
                            title="Perhatian"
                            :description="`${resellWarningCount} invoice tidak memiliki modal (Rp.0). Komisi dihitung dengan default margin 2.5%.`"
                            class="mb-4"
                        />
                        <UCard>
                            <div class="resell-table">
                                <UTable sticky :data="resellData" :columns="resellColumns" class="flex-1 max-h-[800px]" />
                            </div>
                        </UCard>
                    </div>
                </template>
            </UTabs>
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
import type { InvoiceSalesInternalData, InvoiceSalesResellData, SalesCommissionData } from '~/types/sales'

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')
const ClientOnly = resolveComponent('ClientOnly')

const invoiceData = ref<InvoiceSalesInternalData[]>([])
const resellData = ref<InvoiceSalesResellData[]>([])
const commissionData = ref<SalesCommissionData>()

const tabItems = [
    { label: 'Internal', slot: 'internal', value: 'internal' },
    { label: 'Resell', slot: 'resell', value: 'resell' }
]
const activeTab = ref('internal')

const resellWarningCount = computed(() => {
    return resellData.value.filter(row => row.status !== 'recurring' && !row.modal).length
})

const columns: TableColumn<InvoiceSalesInternalData>[] = [
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
        header: 'Implementator',
        cell: ({ row }) => {
            const implementator = row.original.implementator
            if (!implementator || !implementator.employeeId) {
                return '-'
            }
            return h('div', { class: 'flex items-center gap-3' }, [
                h(UAvatar, {
                    src: implementator.photoProfile || undefined,
                    size: 'lg'
                }),
                h('div', undefined, [
                    h('p', { class: 'font-medium text-highlighted' }, implementator.name),
                    h('p', { class: '' }, implementator.employeeId)
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

const resellColumns: TableColumn<InvoiceSalesResellData>[] = [
    {
        accessorKey: 'invoiceNumber',
        header: 'Invoice Number',
        cell: ({ row }) => {
            const invoiceNum = row.original.invoiceNumber
            const isWarning = row.original.status !== 'recurring' && !row.original.modal
            return h('div', { class: ['flex flex-col', isWarning ? 'resell-warning-marker' : ''] }, [
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
        accessorKey: 'modal',
        header: 'Modal',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => {
            if (row.original.status === 'recurring') return '-'
            return formatCurrency(Number(row.getValue('modal')))
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.modal) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        accessorKey: 'price',
        header: 'Price',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => {
            if (row.original.status === 'recurring') return '-'
            return formatCurrency(Number(row.getValue('price')))
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.price) || 0), 0)
            return h(ClientOnly, null, {
                default: () => h('div', { class: 'text-right font-bold' }, formatCurrency(total)),
                fallback: () => h('div', { class: 'text-right font-bold' }, formatCurrency(0))
            })
        }
    },
    {
        header: 'Margin',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => {
            if (row.original.status === 'recurring') return '-'
            return h('div', { class: 'flex flex-col' }, [
                h('span', { class: 'text-sm text-highlighted' }, Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 2 }).format(row.original.margin) + '%'),
                h('span', { class: 'text-sm' }, formatCurrency(row.original.markup))
            ])
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.markup) || 0), 0)
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
    const response = await invoiceService.getInvoiceInternal(route.params.id as string, {month: month.value, year: year.value})
    invoiceData.value = response.data

    const commissionService = new CommissionService()
    const commissionResponse = await commissionService.salesCommission(route.params.id as string, {month: month.value, year: year.value})
    if (commissionResponse?.data) {
        commissionData.value = commissionResponse.data
    }
}

const fetchResellData = async () => {
    if (!year.value || !month.value) return
    const invoiceService = new InvoiceService()
    const response = await invoiceService.getInvoiceResell(route.params.id as string, {month: month.value, year: year.value})
    resellData.value = response.data
}

watch([year, month], () => {
    fetchInvoiceData()
    if (activeTab.value === 'resell') {
        fetchResellData()
    }
})

watch(activeTab, (tab) => {
    if (tab === 'resell' && resellData.value.length === 0 && year.value && month.value) {
        fetchResellData()
    }
})

fetchData()
</script>

<style>
.resell-table tr:has(.resell-warning-marker) td {
    background-color: #fefce8 !important;
}

html.dark .resell-table tr:has(.resell-warning-marker) td {
    background-color: rgba(113, 63, 18, 0.2) !important;
}
</style>
