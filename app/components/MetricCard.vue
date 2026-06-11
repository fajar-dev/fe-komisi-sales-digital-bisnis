<template>
    <UCard>
        <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <UIcon :name="icon" :class="['w-5 h-5', iconColor]" />
                {{ label }}
            </span>
            <UBadge
                v-if="data"
                :color="trendColor(data.trend)"
                variant="soft"
                size="sm"
            >
                <UIcon
                    :name="trendIcon(data.trend)"
                    class="w-3 h-3 mr-0.5"
                />
                {{ formatPercentage(data.percentage) }}
            </UBadge>
        </div>
        <div class="mt-4">
            <div :class="[large ? 'text-3xl' : 'text-2xl', 'font-bold text-gray-900 dark:text-white leading-tight']">
                {{ isCurrency ? formatCurrency(displayValue) : displayValue }}
            </div>
            <p v-if="data" class="text-sm text-gray-400 mt-2">
                {{ formatGrowth(data.growth, isCurrency) }} from last month
            </p>
        </div>
        <slot />
    </UCard>
</template>

<script setup lang="ts">
import type { TrendData } from '~/types/sales'

const props = defineProps<{
    label: string
    icon: string
    iconColor: string
    data?: TrendData
    value?: number
    isCurrency?: boolean
    large?: boolean
}>()

const displayValue = computed(() => {
    if (props.value !== undefined) return props.value
    return props.data?.value ?? 0
})
</script>
