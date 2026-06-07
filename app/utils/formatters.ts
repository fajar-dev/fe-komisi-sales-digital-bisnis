export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

export const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(Math.abs(value)) + '%'
}

export const formatGrowth = (value: number, isCurrency = true): string => {
    const sign = value >= 0 ? '+' : ''
    return sign + (isCurrency ? formatCurrency(value) : value)
}

export const trendColor = (trend: string): 'success' | 'error' => {
    return trend === 'up' ? 'success' : 'error'
}

export const trendIcon = (trend: string): string => {
    return trend === 'up' ? 'i-lucide-trending-up' : 'i-lucide-trending-down'
}

export const getStatusBadge = (status: string) => {
    switch (status) {
        case 'new':
            return { color: 'success', label: 'New', variant: 'subtle' }
        case 'upgrade':
            return { color: 'warning', label: 'Upgrade', variant: 'subtle' }
        case 'prorate':
            return { color: 'warning', label: 'Prorate', variant: 'subtle' }
        case 'termin':
            return { color: 'warning', label: 'Termin', variant: 'subtle' }
        default:
            return { color: 'info', label: 'Recurring', variant: 'subtle' }
    }
}
