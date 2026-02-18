<template>
    <UContainer>
        <HeroBackground />
        <CommissionHeader
            :employee="employee"
            v-model:year="year"
            :year-items="items"
            subtitle="Monthly implementator commission heatmap 🔥"
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
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
            <UCard>
            <template #header>
                <div class="lg:flex items-center justify-between">
                    <div>
                        <h2>Monthly Commission</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Total monthly commission
                        </p>
                    </div>
                    <div>
                        <h1 class="font-bold text-2xl">Total: {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalCommissionData.reduce((total, item) => total + item.total, 0)) }}</h1>
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

        <div class="py-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UCard>
            <template #header>
                <h2>Commission</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                Sales Commission
                </p>
            </template>
                <AreaChart
                    :key="colorMode.value"
                    :data="commissionData"
                    :height="280"
                    :categories="commissionChart"
                    :stacked="true"
                    :x-formatter="xFormatterCommission"
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
                <h2>Customer</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                Customer Count
                </p>
            </template>
                <BarChart
                    :data="customerData"
                    :height="300"
                    :categories="customerChart"
                    :y-axis="['solo', 'booster', 'recurring']"
                    :group-padding="0"
                    :bar-padding="0.2"
                    :x-num-ticks="6"
                    :radius="4"
                    :x-formatter="xFormatter"
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
                    <UTable sticky :data="invoiceData" :columns="columns" class="flex-1 max-h-[800px]" />
                </UCard>
            </div>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { AdditionalService } from '~/services/additional-service'
import { CommissionService } from '~/services/commission-service'
import { EmployeeService } from '~/services/employee-service'
import { InvoiceService } from '~/services/invoice-service'
import type { Employee } from '~/types/employee'

import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const today = new Date()
const modelValue = shallowRef({
  start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1),
  end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
})

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
        meta: {
        class: {
            td: 'font-bold'
        }
        },
        cell: ({ row }) => {
            const invoiceNum = row.original.invoiceNumber
            return h('a', { 
                href: `https://isx.nusa.net.id/customer.php?module=customer&pid=printNewCustomerInvoice&invoiceNum=${invoiceNum}&urut=${row.original.position}&new=1&proforma=0&signature=0`,
                target: '_blank',
                class: 'text-blue-500 hover:underline'
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
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
        if (row.original.isNew) {
            return h(UBadge, { color: 'success', variant: 'subtle' }, () => 'New')
        }
        if (row.original.isUpgrade) {
            return h(UBadge, { color: 'warning', variant: 'subtle' }, () => 'Prorata')
        }
        if (row.original.isTermin) {
            return h(UBadge, { color: 'warning', variant: 'subtle' }, () => 'Termin')
        }
        return h(UBadge, { color: 'info', variant: 'subtle' }, () => 'Recurring')
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
        header: 'Sales',
        cell: ({ row }) => {
        if (!row.original.sales.id) {
            return '-'
        }
        return h('div', { class: 'flex items-center gap-3' }, [
            h(UAvatar, {
            src: row.original.sales.photo,
            size: 'lg'
            }),
            h('div', undefined, [
            h('p', { class: 'font-medium text-highlighted' }, row.original.sales.name),
            h('p', { class: '' }, row.original.sales.id)
            ])
        ])
        }
    },
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
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.dpp) || 0), 0)
            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(total))
        }
    },
    {
        header: 'Month Period',
        meta: {
            class: {
                th: 'text-right',
                td: 'text-right font-medium'
            }
        },
        cell: ({ row }) => {
        return row.original.monthPeriod
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
            h('span', { class: 'text-sm text-highlighted' }, Intl.NumberFormat('id-ID', { style: 'decimal' }).format(row.original.implementatorCommissionPercentage) + '%'),
            h('span', { class: 'text-sm' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(row.original.implementatorCommission))
        ])
        },
        footer: ({ table }) => {
            const rows = table.getFilteredRowModel().rows
            const total = rows.reduce((acc, row) => acc + (Number(row.original.implementatorCommission) || 0), 0)
            return h('div', { class: 'text-right font-bold' }, new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(total))
        }
    }
]

const route = useRoute()
const employee = ref<Employee>()  

// Year Select

const items = ref([2026, 2027, 2028, 2029, 2030])
const year = ref(new Date().getFullYear())

// Commission Chart (Area Chart)

const commissionData = ref<{
    date: string;
    solo: number;
    booster: number;
    recurring: number;
}[]>([])

const colorMode = useColorMode()

const commissionChart: Record<string, BulletLegendItemInterface> = {
    solo: { name: 'Base Commission', color: '#3b82f6' },
    booster: { name: 'Retention Booster', color: '#22c55e' },
    recurring: { name: 'Recurring', color: '#f97316' },
}

const xFormatterCommission = (tick: number, _i?: number, _ticks?: number[]): string => {
  return commissionData.value[tick]?.date ?? ''
}

const yFormatterCommission = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

// Total Commission Chart (Line Chart)

const totalCommissionData = ref<{
    date: string;
    total: number;
}[]>([])

const totalCommissionChart: Record<string, BulletLegendItemInterface> = {
    total: { name: 'Total Commission', color: '#10b981' },
}

const xFormatterTotalCommission = (tick: number, _i?: number, _ticks?: number[]): string => {
  return totalCommissionData.value[tick]?.date ?? ''
}

// Customer Chart (Bar Chart)

const customerData = ref<{
    month: string;
    solo: number;
    booster: number;
    recurring: number;
}[]>([])

const customerChart = {
    solo: { name: 'Base Commission', color: '#3b82f6' },
    booster: { name: 'Retention Booster', color: '#22c55e' },
    recurring: { name: 'Recurring', color: '#f97316' },
}

const xFormatter = (i: number): string => customerData.value[i]?.month ?? ''
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
    const data = await commissionService.implementatorCommission(route.params.id as string, { year: year.value })
    monthcard.value = data.data.data.map((item) => ({
        mounth: item.month,
        total: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total),
    }))
    commissionData.value = data.data.data.map((item) => {
        const solo = item.detail.find(d => d.name === 'Base Commission')
        const booster = item.detail.find(d => d.name === 'Retention Booster')
        const recurring = item.detail.find(d => d.name === 'Recurring')
        return {
            date: item.month,
            solo: solo?.total ?? 0,
            booster: booster?.total ?? 0,
            recurring: recurring?.total ?? 0,
        }
    }).filter(item => (item.solo + item.booster + item.recurring) > 0)
    totalCommissionData.value = data.data.data.map((item) => ({
        date: item.month,
        total: item.total
    })).filter(item => item.total > 0)
    customerData.value = data.data.data.map((item) => {
        const solo = item.detail.find(d => d.name === 'Base Commission')
        const booster = item.detail.find(d => d.name === 'Retention Booster')
        const recurring = item.detail.find(d => d.name === 'Recurring')
        return {
            month: item.month,
            solo: solo?.count ?? 0,
            booster: booster?.count ?? 0,
            recurring: recurring?.count ?? 0,
        }
    }).filter(item => (item.solo + item.booster + item.recurring) > 0)


}

const fetchInvoiceData = async () => {
    if (!modelValue.value.start || !modelValue.value.end) return

    const invoiceService = new InvoiceService()
    const response = await invoiceService.getInvoiceImplementator(route.params.id as string, {
        startDate: modelValue.value.start.toString(),
        endDate: modelValue.value.end.toString()
    })
    invoiceData.value = response.data.data
}

watch(modelValue, () => {
    fetchInvoiceData()
})

watch(year, () => {
    fetchData()
})

fetchData()
fetchInvoiceData()

</script>
