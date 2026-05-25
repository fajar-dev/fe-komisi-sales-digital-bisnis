<template>
    <UContainer>
        <HeroBackground />
        <CommissionHeader
            :employee="employee"
            v-model:year="year"
            :year-items="items"
            subtitle="Monthly sales commission heatmap 🔥"
        />

        <div class="py-2">
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <UPageCard
                    v-for="card in monthcard"
                    :key="card.mounth"
                    :title="card.total"
                    :description="card.mounth"
                >
                    <div class="mt-2 space-y-1">
                        <div class="flex items-center justify-between text-[10px] leading-none">
                            <span class="text-gray-500 dark:text-gray-400 uppercase font-semibold">MRC</span>
                            <span class="font-bold text-highlighted text-blue-500 dark:text-blue-400">{{ card.mrc }}</span>
                        </div>
                        <div class="flex items-center justify-between text-[10px] leading-none">
                            <span class="text-gray-500 dark:text-gray-400 uppercase font-semibold">Sub</span>
                            <span class="font-bold text-highlighted text-green-500 dark:text-green-400">{{ card.subscription }}</span>
                        </div>
                    </div>
                </UPageCard>
            </div>
        </div>



        <div class="py-2">
            <div class="grid grid-cols-1">
                <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <div>
                            <h2>Invoice</h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                            Customer Invoice
                            </p>
                        </div>
                        <UPopover>
                            <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
                            <template v-if="modelValue.start">
                                <template v-if="modelValue.end">
                                {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }} - {{ df.format(modelValue.end.toDate(getLocalTimeZone())) }}
                                </template>

                                <template v-else>
                                {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
                                </template>
                            </template>
                            <template v-else>
                                Pick a date
                            </template>
                            </UButton>

                            <template #content>
                            <UCalendar v-model="modelValue" class="p-2" :number-of-months="2" range />
                            </template>
                        </UPopover>
                    </div>
                </template>
                    <div class="px-4 pb-4">
                        <UTable sticky :data="responseData.data" :columns="columns" class="flex-1 max-h-[800px] mb-2 [&_tr:has(.row-deleted)]:bg-red-50 dark:[&_tr:has(.row-deleted)]:bg-red-950/20 [&_tr:has(.row-no-margin)]:bg-yellow-50 dark:[&_tr:has(.row-no-margin)]:bg-yellow-900/20" />
                        <div v-if="noMarginCount > 0" class="alert alert-warning text-yellow-600 dark:text-yellow-500 text-sm mb-6">
                            {{ noMarginCount }} row(s) don't have a margin.
                        </div>
                    </div>

                </UCard>
            </div>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { CommissionService } from '~/services/commission-service'
import { EmployeeService } from '~/services/employee-service'
import { InvoiceService } from '~/services/invoice-service'
import type { Employee } from '~/types/employee'

import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const modelValue = shallowRef({
    start: new CalendarDate(2026, 1, 1),
    end: new CalendarDate(2026, 1, 31)
})

import { h, resolveComponent } from 'vue'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { AdditionalService } from '~/services/additional-service'
import type { InvoiceSalesData, InvoiceSalesResponseData } from '~/types/sales'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UAvatar = resolveComponent('UAvatar')

    const route = useRoute()
    const responseData = ref<InvoiceSalesResponseData['data']>({ 
        data: [], 
        totalCommission: 0, 
        totalDpp: 0 
    })

    const noMarginCount = computed(() => {
        return responseData.value.data?.filter(item => item.isNew && item.type === 'resell' && (!item.margin || Number(item.margin) === 0)).length || 0
    })

    const createColumns = () => {
        const cols: TableColumn<InvoiceSalesData>[] = [
    {
        accessorKey: 'invoiceNumber',
        header: 'Invoice Number',
        meta: {
        class: {
            td: 'font-bold'
        }
        },
        cell: ({ row }) => {
            const invoiceNum = row.original.invoiceNumber
            const hasNoMargin = row.original.isNew && row.original.type === 'resell' && (!row.original.margin || Number(row.original.margin) === 0)
            return h('a', { 
                href: `https://isx.nusa.net.id/customer.php?module=customer&pid=printNewCustomerInvoice&invoiceNum=${invoiceNum}&urut=${row.original.position}&new=1&proforma=0&signature=0`,
                target: '_blank',
                class: [
                    'text-blue-500 hover:underline', 
                    hasNoMargin ? 'row-no-margin' : ''
                ]
            }, `#${invoiceNum}`)
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
        id: 'label',
        header: 'Label',
        cell: ({ row }) => {
            const badges = []
            
            if (row.original.isNew) {
                badges.push({ label: 'New', color: 'success', variant: 'subtle' })
            }
            if (row.original.isUpgrade) {
                badges.push({ label: 'Prorata', color: 'warning', variant: 'subtle' })
            }
            if (row.original.isTermin) {
                badges.push({ label: 'Termin', color: 'success', variant: 'subtle' })
            }

            if(!row.original.isNew && !row.original.isUpgrade && !row.original.isTermin) {
                badges.push({ label: 'Recurring', color: 'info', variant: 'subtle' })
            }
            
            if(row.original.type === 'internal') {
                badges.push({ label: 'Internal', color: 'primary', variant: 'outline' })
            }

            if(row.original.type === 'resell') {
                badges.push({ label: 'Resell', color: 'info', variant: 'outline' })
            }

            return h('div', { class: 'flex gap-1 flex-wrap' }, badges.map(badge => 
                h(UBadge, { color: badge.color, variant: badge.variant, size: 'md' }, () => badge.label)
            ))
        }
    },
    {
        header: 'Service',
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
        header: 'Implementator',
        cell: ({ row }) => {
        if (!row.original.implementator.id) {
            return '-'
        }
        return h('div', { class: 'flex items-center gap-3' }, [
            h(UAvatar, {
            src: row.original.implementator.photo,
            size: 'lg'
            }),
            h('div', undefined, [
            h('p', { class: 'font-medium text-highlighted' }, row.original.implementator.name),
            h('p', { class: '' }, row.original.implementator.id)
            ])
        ])
        }
    }
]

    cols.push(
        {
            accessorKey: 'modal',
            header: 'Modal (1 License)',
            cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue('modal')) || 0
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(amount)
            },
            footer: ({ table }) => {
                const amount = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.modal) || 0), 0)
    
                return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                }).format(amount))
            }
        },
        {
            accessorKey: 'price',
            header: 'Resell Price (1 License)',
            cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue('price')) || 0
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(amount)
            },
            footer: ({ table }) => {
                const amount = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.price) || 0), 0)
    
                return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                }).format(amount))
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
            return h('div', { class: 'flex flex-col' }, [
                h('span', { class: 'text-sm text-highlighted' }, Intl.NumberFormat('id-ID', { style: 'decimal' }).format(Number(row.original.margin) || 0) + '%'),
                h('span', { class: 'text-sm' }, new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                }).format(Number(row.original.markup) || 0))
            ])
            }
        }
    )

    cols.push(
    {
        accessorKey: 'dpp',
        header: 'DPP',
        meta: {
        class: {
            th: 'text-right',
            td: 'text-right font-medium'
        }
        },
        cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue('dpp'))
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount)
        },
        footer: ({ table }) => {
            const amount = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.dpp) || 0), 0)

            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(amount))
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
            currency: 'IDR'
        }).format(amount)
        },
        footer: ({ table }) => {
            const amount = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.mrc) || 0), 0)

            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(amount))
        }
    },
    {
        header: 'Period (Month)',
        meta: {
            class: {
                th: 'text-center',
                td: 'text-center font-medium'
            }
        },
        cell: ({ row }) => {
            return Number(row.original.monthPeriod)
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
            h('span', { class: 'text-sm text-highlighted' }, Intl.NumberFormat('id-ID', { style: 'decimal' }).format(row.original.salesCommissionPercentage) + '%'),
            h('span', { class: 'text-sm' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(row.original.salesCommission))
        ])
        },
        footer: ({ table }) => {
            const amount = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.salesCommission) || 0), 0)
            
            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(amount))
        }
    }
    )

    return cols
}

const columns = computed(() => createColumns())


const employee = ref<Employee>()  

// Year Select
const items = ref([2026, 2027, 2028, 2029, 2030])
const year = ref(new Date().getFullYear())

// Helper function untuk format currency
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    }).format(value)
}

// Month Card
const monthcard = ref<{ mounth: string; total: string; mrc: string; subscription: string }[]>([])

const fetchData = async () => {
    const additionalService = new AdditionalService()
    const currentPeriod = await additionalService.getCurrentPeriod()

    if (currentPeriod?.data?.startDate && currentPeriod?.data?.endDate) {
        const [startYear, startMonth, startDay] = currentPeriod.data.startDate.split('-').map(Number) as [number, number, number]
        const [endYear, endMonth, endDay] = currentPeriod.data.endDate.split('-').map(Number) as [number, number, number]
        
        modelValue.value = {
            start: new CalendarDate(startYear, startMonth, startDay),
            end: new CalendarDate(endYear, endMonth, endDay)
        }
    }
    
    const employeeService = new EmployeeService()
    const employeeData = await employeeService.getEmployee(route.params.id as string)
    employee.value = employeeData.data
    
    const commissionService = new CommissionService()
    const data = await commissionService.salesCommission(route.params.id as string, { year: year.value })
    
    // Month Card
    monthcard.value = data.data.data.map((item) => {
        const detail = item.detail?.[0]
        return {
            mounth: item.month,
            total: formatCurrency(item.total),
            mrc: formatCurrency(detail?.mrc ?? 0),
            subscription: formatCurrency(detail?.subscription ?? 0),
        }
    })
}

const fetchInvoiceData = async () => {
    if (!modelValue.value.start || !modelValue.value.end) return

    const invoiceService = new InvoiceService()
    const response = await invoiceService.getInvoiceSales(route.params.id as string, {
        startDate: modelValue.value.start.toString(),
        endDate: modelValue.value.end.toString()
    })
    responseData.value = response.data
}

watch(year, () => {
    fetchData()
})

watch(modelValue, () => {
    fetchInvoiceData()
})

fetchData()
fetchInvoiceData()

</script>