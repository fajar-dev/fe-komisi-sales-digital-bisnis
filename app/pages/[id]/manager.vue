<template>
    <UContainer>
        <HeroBackground />
        <div class="py-10">
            <div class="flex md:flex-row flex-col items-end justify-between gap-4">
                <div class="flex items-center gap-1">
                    <UUser
                        :avatar="{
                            src: employee?.photo_profile,
                            icon: 'i-lucide-image'
                        }"
                        :ui="{ avatar: 'h-10 w-10' }"
                    />
                    <div>
                        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                                {{ employee?.name }}'s Commission
                        </h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Monthly manager commission heatmap 🔥                    
                        </p>
                    </div>
                </div>
                <USelectMenu v-model="year" :items="items" />
            </div>
        </div>

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
                <div class="space-y-3">
                    <div>
                        <h2>Commission</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Sales Commission
                        </p>
                    </div>
                    <!-- Custom Legend -->
                    <div class="flex flex-wrap gap-x-4 gap-y-2">
                        <div 
                            v-for="(item, key) in commissionChart" 
                            :key="key"
                            class="flex items-center gap-1.5"
                        >
                            <div 
                                :style="`background-color: ${item.color}`"
                                class="w-3 h-3 rounded-sm flex-shrink-0"
                            />
                            <span class="text-xs text-gray-700 dark:text-gray-300">{{ item.name }}</span>
                        </div>
                    </div>
                </div>
            </template>
                <AreaChart
                    v-if="Object.keys(commissionChart).length > 0"
                    :key="colorMode.value"
                    :data="commissionData"
                    :height="280"
                    :categories="commissionChart"
                    :stacked="true"
                    :x-formatter="xFormatterCommission"
                    :y-formatter="yFormatterCommission"
                    :curve-type="CurveType.MonotoneX"
                    :hide-legend="true"
                    :y-grid-line="true"
                    :x-grid-line="false"
                />
            </UCard>
            
            <UCard>
            <template #header>
                <div class="space-y-3">
                    <div>
                        <h2>Customer</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Customer Count
                        </p>
                    </div>
                    <!-- Custom Legend -->
                    <div class="flex flex-wrap gap-x-4 gap-y-2">
                        <div 
                            v-for="(item, key) in customerChart" 
                            :key="key"
                            class="flex items-center gap-1.5"
                        >
                            <div 
                                :style="`background-color: ${item.color}`"
                                class="w-3 h-3 rounded-sm flex-shrink-0"
                            />
                            <span class="text-xs text-gray-700 dark:text-gray-300">{{ item.name }}</span>
                        </div>
                    </div>
                </div>
            </template>
                <BarChart
                    v-if="barChartYAxis.length > 0"
                    :data="customerData"
                    :height="300"
                    :categories="customerChart"
                    :y-axis="barChartYAxis"
                    :group-padding="0"
                    :bar-padding="0.2"
                    :x-num-ticks="6"
                    :radius="4"
                    :x-formatter="xFormatter"
                    :y-formatter="yFormatter"
                    :hide-legend="true"
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
                            <h2>Team</h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                            Team Commission
                            </p>
                        </div>
                    </div>
                </template>
                    <UTable :data="teamData" :columns="teamColumns" class="flex-1" @select="onSelectTeamMember" :ui="{ tr: 'cursor-pointer' }" />
                </UCard>
            </div>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { CommissionService } from '~/services/commission-service'
import { EmployeeService } from '~/services/employee-service'
import { TeamService } from '~/services/team'
import type { Employee } from '~/types/employee'
import type { ManagerTeamData } from '~/types/team'
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UAvatar = resolveComponent('UAvatar')

const route = useRoute()
const employee = ref<Employee>()  

// Year Select

const items = ref([2026, 2027, 2028, 2029, 2030])
const year = ref(new Date().getFullYear())

// Commission Chart (Area Chart)

const commissionData = ref<any[]>([])
const commissionChart = ref<Record<string, BulletLegendItemInterface>>({})

const colorMode = useColorMode()

const xFormatterCommission = (tick: number, _i?: number, _ticks?: number[]): string => {
    return String(commissionData.value[tick]?.date ?? '')
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
  return String(totalCommissionData.value[tick]?.date ?? '')
}

// Customer Chart (Bar Chart)

const customerData = ref<any[]>([])
const customerChart = ref<Record<string, BulletLegendItemInterface>>({})
const barChartYAxis = ref<string[]>([])

const xFormatter = (i: number): string => `${customerData.value[i]?.month}`
const yFormatter = (tick: number) => tick.toString()

// Month Card

const monthcard = ref<{ mounth: string; total: string }[]>([])

// Team Table
const teamData = ref<ManagerTeamData[]>([])

const teamColumns: TableColumn<ManagerTeamData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
       return h('div', { class: 'flex items-center gap-3' }, [
           h(UAvatar, { src: row.original.photo_profile, alt: row.original.name }),
           h('div', { class: 'flex flex-col' }, [
               h('span', { class: 'text-sm font-medium text-gray-900 dark:text-white' }, row.original.name),
               h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, row.original.employee_id)
           ])
       ])
    }
  },
  {
    accessorKey: 'job_position',
    header: 'Position',
    cell: ({ row }) => {
        return h('div', { class: 'flex flex-col' }, [
            h('span', { class: 'text-sm font-medium' }, row.original.job_position),
            h('span', { class: 'text-xs text-gray-500' }, row.original.organization_name)
        ])
    }
  },
   {
    accessorKey: 'branch',
    header: 'Branch'
  },
  {
    accessorKey: 'totalCommission',
    header: 'Total Commission',
     meta: {
        class: {
            th: 'text-right',
            td: 'text-right font-bold'
        }
    },
    cell: ({ row }) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(row.getValue('totalCommission'))
    }
  }
]

const onSelectTeamMember = (event: any, row: any) => {
    const data = row?.original || row
    if (data?.employee_id) {
        navigateTo(`/${data.employee_id}/sales`)
    }
}

const fetchData = async () => {
    const employeeService = new EmployeeService()
    const employeeData = await employeeService.getEmployee(route.params.id as string)
    employee.value = employeeData.data

    const commissionService = new CommissionService()
    const data = await commissionService.managerCommission(route.params.id as string, { year: year.value })
    
    monthcard.value = data.data.data.map((item) => ({
        mounth: item.month,
        total: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total),
    }))

    // Dynamic Chart Configuration
    const uniqueNames = new Set<string>()
    data.data.data.forEach(m => m.detail.forEach(d => uniqueNames.add(d.name)))

    const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#ef4444', '#14b8a6', '#f59e0b', '#6366f1', '#84cc16']
    let colorIndex = 0
    
    const newChartConfig: Record<string, BulletLegendItemInterface> = {}
    const yAxisKeys: string[] = []

    uniqueNames.forEach(name => {
        const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        yAxisKeys.push(key)
        newChartConfig[key] = {
            name: name,
            color: colors[colorIndex % colors.length]
        }
        colorIndex++
    })

    commissionChart.value = newChartConfig
    customerChart.value = newChartConfig
    barChartYAxis.value = yAxisKeys

    commissionData.value = data.data.data.map(item => {
        const row: any = { date: item.month }
        yAxisKeys.forEach(key => row[key] = 0)
        
        item.detail.forEach(d => {
            const key = d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
            if (yAxisKeys.includes(key)) {
                row[key] = d.total
            }
        })
        return row
    })

    totalCommissionData.value = data.data.data.map((item) => ({
        date: item.month,
        total: item.total
    }))

    customerData.value = data.data.data.map(item => {
        const row: any = { month: item.month }
        yAxisKeys.forEach(key => row[key] = 0)
        
        item.detail.forEach(d => {
            const key = d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
            if (yAxisKeys.includes(key)) {
                row[key] = d.count
            }
        })
        return row
    })

    const teamService = new TeamService()
    const teamResponse = await teamService.getTeamCommission(route.params.id as string, { year: year.value })
    teamData.value = teamResponse.data.data
}

watch(year, () => {
    fetchData()
})

fetchData()

</script>