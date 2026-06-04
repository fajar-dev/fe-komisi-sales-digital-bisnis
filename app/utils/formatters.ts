export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
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
