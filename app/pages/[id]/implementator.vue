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
                        <UIcon name="i-lucide-wallet" class="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div class="mt-2">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {{ formatCurrency(totalCommission) }}
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
                            {{ formatCurrency(totalMrc) }}
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
                            {{ formatCurrency(totalSubscription) }}
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
                            {{ churnCount }}
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
</template><script setup lang="ts">
import { AdditionalService } from '~/services/additional-service'
import { EmployeeService } from '~/services/employee-service'
import { InvoiceService } from '~/services/invoice-service'
import type { Employee } from '~/types/employee'
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { InvoiceImplementatorData } from '~/types/implementator'

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

const invoiceData = ref<InvoiceImplementatorData[]>([])

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
                    class: ['text-blue-500 hover:underline font-bold']
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
            const status = row.original.status
            if (status === 'new') {
                return h(UBadge, { color: 'success', variant: 'subtle' }, () => 'New')
            }
            if (status === 'upgrade') {
                return h(UBadge, { color: 'warning', variant: 'subtle' }, () => 'Prorata')
            }
            if (status === 'termin') {
                return h(UBadge, { color: 'warning', variant: 'subtle' }, () => 'Termin')
            }
            return h(UBadge, { color: 'info', variant: 'subtle' }, () => 'Recurring')
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
                    class: ['text-blue-500 hover:underline font-semibold']
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
                    class: ['text-blue-500 hover:underline font-semibold']
                }, row.original.customerId),
                h('span', { class: 'text-sm whitespace-normal break-words' }, row.original.customerCompany)
            ])
        }
    },
    {
        header: 'Sales',
        cell: ({ row }) => {
            const sales = row.original.salesId
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
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount)
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.subscription) || 0), 0)
            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(total))
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
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount)
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.mrc) || 0), 0)
            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(total))
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
                h('span', { class: 'text-sm' }, new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(row.original.commission))
            ])
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.commission) || 0), 0)
            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(total))
        }
    }
]

const route = useRoute()
const employee = ref<Employee>()  

const year = ref<number>()
const month = ref<number>()

const totalCommission = ref(0)
const totalMrc = ref(0)
const totalSubscription = ref(0)
const churnCount = ref(0)

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    }).format(value)
}

const fetchData = async () => {
    const additionalService = new AdditionalService()
    const currentPeriod = await additionalService.getCurrentPeriod(year.value, month.value)

    if (currentPeriod?.data) {
        if (!year.value) year.value = currentPeriod.data.year
        if (!month.value) month.value = currentPeriod.data.month
    }

    const employeeService = new EmployeeService()
    const employeeData = await employeeService.getEmployee(route.params.id as string)
    employee.value = employeeData.data
}

const fetchInvoiceData = async () => {
    if (!year.value || !month.value) return

    const invoiceService = new InvoiceService()
    
    // Fetch current period data
    const response = await invoiceService.getInvoiceImplementator(route.params.id as string, {
        month: month.value,
        year: year.value
    })
    invoiceData.value = response.data.invoice || []
    totalCommission.value = response.data.totalCommission || 0
    totalMrc.value = response.data.totalMrc || 0
    totalSubscription.value = response.data.totalSubscription || 0
    churnCount.value = response.data.churnCount || 0
}

watch([year, month], () => {
    fetchInvoiceData()
})

fetchData()
</script>
