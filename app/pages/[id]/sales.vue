<template>
    <UContainer>
        <AdjustmentModal
          :ai="invoiceAi"
          v-model:open="isAdjustmentModalOpen"
          @updated="fetchInvoiceData()"
        />
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
                    :title="String(card.total)"
                    :description="card.mounth"
                >
                </UPageCard>
            </div>
        </div>

        <div class="py-2">
            <div class="grid grid-cols-12 gap-4">
                <UCard class="col-span-12 md:col-span-4">
                    <template #header>
                    <h2>Total Commission</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Total Yearly Commission
                    </p>
                    </template>
                    <DonutChart
                        :data="totalCommissionDonutData"
                        :height="280"
                        :categories="totalCommissionDonutChart"
                        :radius="80"
                        :pad-angle="0.1"
                        :arc-width="20"
                        :value-formatter="donutValueFormatter"
                    >
                        <div class="text-center">
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                Total
                            </div>
                            <div class="text-2xl font-bold text-gray-900 dark:text-white">
                                {{ formatCurrency(totalCommissionDonutData.reduce((a, b) => a + b, 0)) }}
                            </div>
                        </div>
                    </DonutChart>
                </UCard>

                <!-- 8 kolom -->
                <UCard class="col-span-12 md:col-span-8">
                    <template #header>
                    <div class="lg:flex items-center justify-between">
                        <div>
                        <h2>Monthly Commission</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Total monthly commission
                        </p>
                        </div>
                        <div>
                        <h1 class="font-bold text-2xl">
                            Total:
                            {{
                            new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                            }).format(totalCommissionData.reduce((total, item) => total + item.total, 0))
                            }}
                        </h1>
                        </div>
                    </div>
                    </template>

                    <LineChart
                    :data="totalCommissionData"
                    :height="280"
                    y-label="Total Commission"
                    :x-num-ticks="4"
                    :y-num-ticks="4"
                    :categories="totalCommissionChart"
                    :x-formatter="xFormatterTotalCommission"
                    :y-formatter="yFormatterCommission"
                    :y-grid-line="true"
                    :curve-type="CurveType.MonotoneX"
                    :legend-position="LegendPosition.TopRight"
                    :hide-legend="false"
                    />
                </UCard>
            </div>
        </div>

        <!-- Internal Charts -->
        <div class="py-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UCard>
            <template #header>
                <h2>Commission Internal</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                Internal Sales Commission
                </p>
            </template>
                <AreaChart
                    :key="colorMode.value + '-internal'"
                    :data="commissionInternalData"
                    :height="280"
                    :categories="commissionInternalChart"
                    :stacked="true"
                    :x-formatter="xFormatterCommissionInternal"
                    :y-formatter="yFormatterCommission"
                    :curve-type="CurveType.MonotoneX"
                    :legend-position="LegendPosition.TopRight"
                    :hide-legend="false"
                    :y-grid-line="true"
                    :x-grid-line="false"
                />
            </UCard>
            <UCard>
            <template #header>
                <h2>Customer Internal</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                Internal Customer Count
                </p>
            </template>
                <BarChart
                    :data="customerInternalData"
                    :height="300"
                    :categories="customerInternalChart"
                    :y-axis="['solo', 'booster', 'recurring']"
                    :group-padding="0"
                    :bar-padding="0.2"
                    :x-num-ticks="6"
                    :radius="4"
                    :x-formatter="xFormatterInternal"
                    :y-formatter="yFormatter"
                    :legend-position="LegendPosition.TopRight"
                    :hide-legend="false"
                    :y-grid-line="true"
                />
            </UCard>
        </div>
        </div>

        <!-- Resell Chart -->
        <div class="py-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UCard>
            <template #header>
                <h2>Commission Resell</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                Resell Sales Commission
                </p>
            </template>
                <AreaChart
                    :key="colorMode.value + '-resell'"
                    :data="commissionResellData"
                    :height="280"
                    :categories="commissionResellChart"
                    :stacked="true"
                    :x-formatter="xFormatterCommissionResell"
                    :y-formatter="yFormatterCommission"
                    :curve-type="CurveType.MonotoneX"
                    :legend-position="LegendPosition.TopRight"
                    :hide-legend="false"
                    :y-grid-line="true"
                    :x-grid-line="false"
                />
            </UCard>
            <UCard>
            <template #header>
                <h2>Customer Resell</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                Resell Customer Count
                </p>
            </template>
                <BarChart
                    :data="customerResellData"
                    :height="300"
                    :categories="customerResellChart"
                    :y-axis="['margin_high', 'margin_medium', 'margin_low', 'recurring']"
                    :group-padding="0"
                    :bar-padding="0.2"
                    :x-num-ticks="6"
                    :radius="4"
                    :x-formatter="xFormatterResell"
                    :y-formatter="yFormatter"
                    :legend-position="LegendPosition.TopRight"
                    :hide-legend="false"
                    :y-grid-line="true"
                />
            </UCard>
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
                        <h3 class="font-semibold text-lg mb-2">New Resell</h3>
                        <UTable sticky :data="responseData.newResellData" :columns="newResellColumns" class="flex-1 max-h-[800px] mb-2 [&_tr:has(.row-deleted)]:bg-red-50 dark:[&_tr:has(.row-deleted)]:bg-red-950/20 [&_tr:has(.row-no-margin)]:bg-yellow-50 dark:[&_tr:has(.row-no-margin)]:bg-yellow-900/20" />
                        <div v-if="noMarginCount > 0" class="alert alert-warning text-yellow-600 dark:text-yellow-500 text-sm mb-6">
                            {{ noMarginCount }} row(s) don't have a margin.
                        </div>
                        
                        <UDivider class="my-6" />

                        <h3 class="font-semibold text-lg mb-2">Other Invoices</h3>
                        <UTable sticky :data="responseData.otherData" :columns="otherColumns" class="flex-1 max-h-[800px] [&_tr:has(.row-deleted)]:bg-red-50 dark:[&_tr:has(.row-deleted)]:bg-red-950/20" />
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

const isAdjustmentModalOpen = ref(false)
const invoiceAi = ref<number>(0)

import { h, resolveComponent } from 'vue'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { AdditionalService } from '~/services/additional-service'
import type { InvoiceSalesData, InvoiceSalesResponseData } from '~/types/sales'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UAvatar = resolveComponent('UAvatar')
const UDropdownMenu = resolveComponent('UDropdownMenu')


    import { authService } from '~/services/auth-service'

    const route = useRoute()
    const responseData = ref<InvoiceSalesResponseData['data']>({ 
        newResellData: [], 
        newResellTotalCommission: 0, 
        newResellTotalDpp: 0, 
        otherData: [], 
        otherTotalCommission: 0, 
        otherTotalDpp: 0, 
        totalCommission: 0, 
        totalDpp: 0 
    })

    const noMarginCount = computed(() => {
        return responseData.value.newResellData.filter(item => !item.margin || Number(item.margin) === 0).length
    })

    const createColumns = (isNewResell: boolean) => {
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
            const hasNoMargin = isNewResell && (!row.original.margin || Number(row.original.margin) === 0)
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
                badges.push({ label: 'Termin', color: 'warning', variant: 'subtle' })
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

            if(row.original.isAdjustment) {
                badges.push({ label: 'Adjustment', color: 'warning', variant: 'solid' })
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

    if (isNewResell) {
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
                footer: () => {
                     const amount = isNewResell 
                        ? responseData.value.newResellData.reduce((sum, item) => sum + (Number(item.modal) || 0), 0)
                        : 0.00
        
                    return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                    }).format(amount ?? 0))
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
                footer: () => {
                     const amount = isNewResell 
                        ? responseData.value.newResellData.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
                        : 0.00
        
                    return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                    }).format(amount ?? 0))
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
                    h('span', { class: 'text-sm text-highlighted' }, Intl.NumberFormat('id-ID', { style: 'decimal' }).format(responseData.value.newResellData.reduce((sum, item) => sum + (Number(item.margin) || 0), 0)) + '%'),
                    h('span', { class: 'text-sm' }, new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                    }).format(responseData.value.newResellData.reduce((sum, item) => sum + (Number(item.markup) || 0), 0)))
                ])
                }
            }
        )
    }

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
        footer: () => {
             const amount = isNewResell 
                ? responseData.value.newResellTotalDpp 
                : responseData.value.otherTotalDpp

            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(amount ?? 0))
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
        return row.original.monthPeriod 
        }
    },
    {
        header: 'Invoice Number',
        meta: {
            class: {
                th: 'text-center',
                td: 'text-center font-medium'
            }
        },
        cell: ({ row }) => {
        return row.original.counter
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
        footer: () => {
            const amount = isNewResell 
                ? responseData.value.newResellTotalCommission 
                : responseData.value.otherTotalCommission
            
            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(amount ?? 0))
        }
    }
    )

    if (isNewResell && authService.user.value?.employee_id === route.params.id) {
        cols.push({
            id: 'actions',
            cell: ({ row }) => {
                return h(
                    'div',
                    { class: 'text-right' },
                    h(UButton, {
                        icon: 'i-lucide-edit',
                        color: 'neutral',
                        variant: 'ghost',
                        class: 'ml-auto',
                        onClick: () => {
                            invoiceAi.value = row.original.ai
                            isAdjustmentModalOpen.value = true
                        }
                    })
                )
            }
        })
    }

    return cols
}

const newResellColumns = computed(() => createColumns(true))
const otherColumns = computed(() => createColumns(false))


const employee = ref<Employee>()  

// Year Select
const items = ref([2026, 2027, 2028, 2029, 2030])
const year = ref(new Date().getFullYear())

const colorMode = useColorMode()

// Helper function untuk format currency
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    }).format(value)
}

// Total Commission Donut Chart Data
const totalCommissionDonutData = ref<number[]>([])

const donutLabels = [
    { name: 'Internal', color: '#3b82f6' },
    { name: 'Resell', color: '#f97316' }
]

const totalCommissionDonutChart: Record<string, BulletLegendItemInterface> = Object.fromEntries(
    donutLabels.map(i => [i.name, { name: i.name, color: i.color }])
)

const donutValueFormatter = (value: number): string => {
    return formatCurrency(value)
}

// Commission Chart Internal (Area Chart)
const commissionInternalData = ref<{
    date: string;
    solo: number;
    booster: number;
    recurring: number;
}[]>([])

const commissionInternalChart: Record<string, BulletLegendItemInterface> = {
    solo: { name: 'Solo', color: '#3b82f6' },
    booster: { name: 'Booster', color: '#22c55e' },
    recurring: { name: 'Recurring', color: '#f97316' },
}

const xFormatterCommissionInternal = (tick: number, _i?: number, _ticks?: number[]): string => {
    return commissionInternalData.value[tick]?.date ?? ''
}

// Commission Chart Resell (Area Chart)
const commissionResellData = ref<{
    date: string;
    margin_high: number;
    margin_medium: number;
    margin_low: number;
    recurring: number;
}[]>([])

const commissionResellChart: Record<string, BulletLegendItemInterface> = {
    margin_high: { name: 'Margin ≥15%', color: '#3b82f6' },
    margin_medium: { name: 'Margin 10-15%', color: '#22c55e' },
    margin_low: { name: 'Margin <10%', color: '#f97316' },
    recurring: { name: 'Recurring', color: '#8b5cf6' },
}

const xFormatterCommissionResell = (tick: number, _i?: number, _ticks?: number[]): string => {
    return commissionResellData.value[tick]?.date ?? ''
}

const yFormatterCommission = (value: number): string => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

// Total Commission Chart (Line Chart)
const totalCommissionData = ref<{
    date: string;
    total: number;
    totalInternal: number;
    totalResell: number;
}[]>([])

const totalCommissionChart: Record<string, BulletLegendItemInterface> = {
    total: { name: 'Total', color: '#10b981' },
    totalInternal: { name: 'Internal', color: '#3b82f6' },
    totalResell: { name: 'Resell', color: '#f97316' },
}

const xFormatterTotalCommission = (tick: number, _i?: number, _ticks?: number[]): string => {
    return totalCommissionData.value[tick]?.date ?? ''
}

// Customer Chart Internal (Bar Chart)
const customerInternalData = ref<{
    month: string;
    solo: number;
    booster: number;
    recurring: number;
}[]>([])

const customerInternalChart = {
    solo: { name: 'Solo', color: '#3b82f6' },
    booster: { name: 'Booster', color: '#22c55e' },
    recurring: { name: 'Recurring', color: '#f97316' },
}

const xFormatterInternal = (i: number): string => customerInternalData.value[i]?.month ?? ''

// Customer Chart Resell (Bar Chart)
const customerResellData = ref<{
    month: string;
    margin_high: number;
    margin_medium: number;
    margin_low: number;
    recurring: number;
}[]>([])

const customerResellChart = {
    margin_high: { name: 'Margin ≥15%', color: '#3b82f6' },
    margin_medium: { name: 'Margin 10-15%', color: '#22c55e' },
    margin_low: { name: 'Margin <10%', color: '#f97316' },
    recurring: { name: 'Recurring', color: '#8b5cf6' },
}

const xFormatterResell = (i: number): string => customerResellData.value[i]?.month ?? ''

const yFormatter = (tick: number) => tick.toString()

// Month Card
const monthcard = ref<{ mounth: string; total: string }[]>([])

const fetchData = async () => {
    const additionalService = new AdditionalService()
    const currentPeriod = await additionalService.getCurrentPeriod()

    if (currentPeriod?.start && currentPeriod?.end) {
        const [startYear, startMonth, startDay] = currentPeriod.start.split('-').map(Number) as [number, number, number]
        const [endYear, endMonth, endDay] = currentPeriod.end.split('-').map(Number) as [number, number, number]
        
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
    
    // Donut Chart Data - Internal vs Resell (array of numbers)
    totalCommissionDonutData.value = [
        data.data.totalInternal ?? 0,
        data.data.totalResell ?? 0
    ]
    
    // Month Card
    monthcard.value = data.data.data.map((item) => ({
        mounth: item.month,
        total: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total),
    }))
    
    // Commission Data Internal
    commissionInternalData.value = data.data.data.map((item) => {
        const detail = item.detail?.[0]
        const solo = detail?.internal?.find(d => d.name === 'Solo')
        const booster = detail?.internal?.find(d => d.name === 'Booster')
        const recurring = detail?.internal?.find(d => d.name === 'Recurring')
        return {
            date: item.month,
            solo: solo?.total ?? 0,
            booster: booster?.total ?? 0,
            recurring: recurring?.total ?? 0,
        }
    }).filter(item => (item.solo + item.booster + item.recurring) > 0)
    
    // Commission Data Resell
    commissionResellData.value = data.data.data.map((item) => {
        const detail = item.detail?.[0]
        return {
            date: item.month,
            margin_high: detail?.resell?.[0]?.total ?? 0,
            margin_medium: detail?.resell?.[1]?.total ?? 0,
            margin_low: detail?.resell?.[2]?.total ?? 0,
            recurring: detail?.resell?.[3]?.total ?? 0,
        }
    }).filter(item => (item.margin_high + item.margin_medium + item.margin_low + item.recurring) > 0)
    
    // Total Commission Data (Updated untuk include totalInternal & totalResell)
    totalCommissionData.value = data.data.data.map((item) => {
        const detail = item.detail?.[0]
        return {
            date: item.month,
            total: detail?.total ?? 0,
            totalInternal: detail?.totalInternal ?? 0,
            totalResell: detail?.totalResell ?? 0
        }
    }).filter(item => item.total > 0)
    
    // Customer Data Internal
    customerInternalData.value = data.data.data.map((item) => {
        const detail = item.detail?.[0]
        const solo = detail?.internal?.find(d => d.name === 'Solo')
        const booster = detail?.internal?.find(d => d.name === 'Booster')
        const recurring = detail?.internal?.find(d => d.name === 'Recurring')
        return {
            month: item.month,
            solo: solo?.count ?? 0,
            booster: booster?.count ?? 0,
            recurring: recurring?.count ?? 0,
        }
    }).filter(item => (item.solo + item.booster + item.recurring) > 0)
    
    // Customer Data Resell
    customerResellData.value = data.data.data.map((item) => {
        const detail = item.detail?.[0]
        return {
            month: item.month,
            margin_high: detail?.resell?.[0]?.count ?? 0,
            margin_medium: detail?.resell?.[1]?.count ?? 0,
            margin_low: detail?.resell?.[2]?.count ?? 0,
            recurring: detail?.resell?.[3]?.count ?? 0,
        }
    }).filter(item => (item.margin_high + item.margin_medium + item.margin_low + item.recurring) > 0)
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