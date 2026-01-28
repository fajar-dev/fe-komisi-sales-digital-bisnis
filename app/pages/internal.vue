<template>
    <UContainer>
        <HeroBackground />
        <div class="space-y-8 py-8">
        <UPageHeader
            title="Hello, John Doe👋"
            description="Good Morning, Have a nice day 😃"
        />
        </div>

        <div class="py-2">
        <div class="flex items-end justify-between">
            <div class="space-y-1">
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                    Mounthly Commission
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                        Mounthly Commission Heatmap 2026
                </p>
            </div>
        </div>
        </div>

        <div class="py-2">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <UPageCard
                v-for="card in monthcard"
                :key="card.mounth"
                :title="String(card.total)"
                :description="card.mounth"
                spotlight
                spotlight-color="primary"
            >
            </UPageCard>
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
                <LineChart
                    :data="commissionData"
                    :height="280"
                    y-label="Sales"
                    :x-num-ticks="4"
                    :y-num-ticks="4"
                    :categories="commissionChart"
                    :x-formatter="xFormatterCommission"
                    :y-grid-line="true"
                    :curve-type="CurveType.Linear"
                    :legend-position="LegendPosition.TopRight"
                    :hide-legend="false"
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
    </UContainer>
</template>

<script setup lang="ts">
import { CommissionService } from '~/services/commission-service'
import { CalendarDate, DateFormatter, getLocalTimeZone, today } from '@internationalized/date'

const df = new DateFormatter('en-US', {
    dateStyle: 'medium'
})

const modelValue = shallowRef({
    start: new CalendarDate(2025, 12, 25),
    end: today(getLocalTimeZone())
})

// Commission Chart

const commissionData = ref<{
    date: string;
    solo: number;
    booster: number;
    recurring: number;
}[]>([])

const commissionChart: Record<string, BulletLegendItemInterface> = {
  solo: { name: 'solo', color: '#3b82f6' },
  booster: { name: 'booster', color: '#22c55e' },
  recurring: { name: 'recurring', color: '#f97316' },
}

const xFormatterCommission = (tick: number, _i?: number, _ticks?: number[]): string => {
  return String(commissionData.value[tick]?.date ?? '')
}

// Customer Chart

const customerData = ref<{
    month: string;
    solo: number;
    booster: number;
    recurring: number;
}[]>([])

const customerChart = {
  solo: { name: 'solo', color: '#3b82f6' },
  booster: { name: 'booster', color: '#22c55e' },
  recurring: { name: 'recurring', color: '#f97316' },
}

const xFormatter = (i: number): string => `${customerData.value[i]?.month}`
const yFormatter = (tick: number) => tick.toString()

// Month Card

const monthcard = ref<{ mounth: string; total: string }[]>([])

onMounted(async () => {
    const commissionService = new CommissionService()
    const data = await commissionService.amInternalCommission({
        employeeId: '0202445',
        year: 2026
    })
    monthcard.value = data.data.data.map((item) => ({
        mounth: item.month,
        total: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total),
    }))
    commissionData.value = data.data.data.map((item) => {
        const solo = item.detail.find(d => d.name === 'Solo')
        const booster = item.detail.find(d => d.name === 'Booster')
        const recurring = item.detail.find(d => d.name === 'Recurring')
        return {
            date: item.month,
            solo: solo?.total ?? 0,
            booster: booster?.total ?? 0,
            recurring: recurring?.total ?? 0,
        }
    })
    customerData.value = data.data.data.map((item) => {
        const solo = item.detail.find(d => d.name === 'Solo')
        const booster = item.detail.find(d => d.name === 'Booster')
        const recurring = item.detail.find(d => d.name === 'Recurring')
        return {
            month: item.month,
            solo: solo?.count ?? 0,
            booster: booster?.count ?? 0,
            recurring: recurring?.count ?? 0,
        }
    })
})

</script>
