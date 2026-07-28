<template>
    <div class="w-full px-4 sm:px-6 lg:px-8">
        <HeroBackground />

        <div class="py-6">
            <h1 class="text-2xl font-bold text-highlighted">Invoice Snapshots</h1>
            <p class="text-sm text-gray-500">Daftar seluruh invoice snapshot — cari & filter berdasarkan status dan type</p>
        </div>

        <UCard :ui="{ root: 'w-full' }">
            <template #header>
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <UInput
                        v-model="search"
                        icon="i-lucide-search"
                        placeholder="Cari customer, invoice, atau service…"
                        class="w-full lg:max-w-xs"
                        :ui="{ trailing: 'pe-1' }"
                    >
                        <template v-if="search" #trailing>
                            <UButton
                                color="neutral"
                                variant="link"
                                size="sm"
                                icon="i-lucide-x"
                                aria-label="Clear"
                                @click="search = '';"
                            />
                        </template>
                    </UInput>

                    <div class="flex flex-wrap items-center gap-2">
                        <USelect
                            v-model="month"
                            :items="monthOptions"
                            placeholder="Bulan"
                            class="w-36"
                        />
                        <USelect
                            v-model="year"
                            :items="yearOptions"
                            placeholder="Tahun"
                            class="w-28"
                        />
                        <USelect
                            v-model="status"
                            :items="statusOptions"
                            placeholder="Status"
                            class="w-36"
                        />
                        <USelect
                            v-model="type"
                            :items="typeOptions"
                            placeholder="Type"
                            class="w-36"
                        />
                    </div>
                </div>
            </template>

            <UTable
                sticky
                :data="items"
                :columns="columns"
                :loading="loading"
                class="flex-1 max-h-[800px]"
            />

            <template #footer>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex items-center gap-3">
                        <p class="text-sm text-gray-500">
                            Menampilkan {{ items.length }} dari {{ meta.total }} data
                        </p>
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-500">Rows</span>
                            <USelect
                                v-model="limit"
                                :items="limitOptions"
                                class="w-20"
                            />
                        </div>
                    </div>
                    <UPagination
                        v-model:page="page"
                        :items-per-page="meta.limit"
                        :total="meta.total"
                    />
                </div>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { InvoiceService } from '~/services/invoice-service'
import { AdditionalService } from '~/services/additional-service'
import type { SnapshotItem, SnapshotListMeta } from '~/types/snapshot'

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

const invoiceService = new InvoiceService()

const items = ref<SnapshotItem[]>([])
const meta = ref<SnapshotListMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 })
const loading = ref(false)

const now = new Date()
const search = ref('')
const status = ref('all')
const type = ref('all')
const month = ref<number>(now.getMonth() + 1)
const year = ref<number>(now.getFullYear())
const limit = ref<number>(10)
const page = ref(1)
const ready = ref(false)

const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Upgrade', value: 'upgrade' },
    { label: 'Prorate', value: 'prorate' },
    { label: 'Termin', value: 'termin' },
    { label: 'Recurring', value: 'recurring' }
]

const typeOptions = [
    { label: 'All Type', value: 'all' },
    { label: 'Internal', value: 'internal' },
    { label: 'Resell', value: 'resell' }
]

const monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
]

const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030]
const limitOptions = [10, 25, 50, 100]

const typeBadge = (serviceType: string) => {
    return serviceType === 'resell'
        ? { color: 'secondary' as const, label: 'Resell' }
        : { color: 'primary' as const, label: 'Internal' }
}

const columns: TableColumn<SnapshotItem>[] = [
    {
        accessorKey: 'invoiceNumber',
        header: 'Invoice Number',
        cell: ({ row }) => {
            return h('div', { class: 'flex flex-col' }, [
                h('a', {
                    href: `https://isx.nusa.net.id/customer.php?module=customer&pid=printNewCustomerInvoice&invoiceNum=${row.original.invoiceNumber}&urut=${row.original.sequenceNumber}&new=1&proforma=0&signature=0`,
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
            const value = row.getValue('paidDate') as string
            if (!value) return '-'
            return new Date(value).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
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
        id: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const badge = typeBadge(row.original.serviceType)
            return h(UBadge, { color: badge.color, variant: 'soft' }, () => badge.label)
        }
    },
    {
        header: 'Service',
        meta: { class: { th: 'min-w-[220px]', td: 'min-w-[220px]' } },
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
        meta: { class: { th: 'min-w-[220px]', td: 'min-w-[220px]' } },
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
        header: 'Account Manager',
        cell: ({ row }) => {
            const sales = row.original.sales
            if (!sales || !sales.employeeId) return '-'
            return h('div', { class: 'flex items-center gap-3' }, [
                h(UAvatar, { src: sales.photoProfile || undefined, size: 'lg' }),
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
        meta: { class: { th: 'text-right', td: 'text-right font-medium' } },
        cell: ({ row }) => formatCurrency(Number(row.getValue('subscription')) || 0)
    },
    {
        accessorKey: 'mrc',
        header: 'MRC',
        meta: { class: { th: 'text-right', td: 'text-right font-medium' } },
        cell: ({ row }) => formatCurrency(Number(row.getValue('mrc')) || 0)
    },
    {
        header: 'Commission',
        meta: { class: { th: 'text-right', td: 'text-right font-medium' } },
        cell: ({ row }) => {
            return h('div', { class: 'flex flex-col' }, [
                h('span', { class: 'text-sm text-highlighted' }, Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 2 }).format(row.original.commissionPercentage) + '%'),
                h('span', { class: 'text-sm' }, formatCurrency(row.original.commission))
            ])
        }
    },
    {
        id: 'isAdjust',
        header: 'Adjust',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => {
            if (!row.original.isAdjust) return h('span', { class: 'text-gray-400' }, '-')
            return h(UBadge, { color: 'warning', variant: 'subtle' }, () => 'Adjusted')
        }
    }
]

const fetchSnapshots = async () => {
    loading.value = true
    try {
        const response = await invoiceService.getSnapshotList({
            search: search.value || undefined,
            status: status.value !== 'all' ? status.value : undefined,
            type: type.value !== 'all' ? type.value : undefined,
            month: month.value,
            year: year.value,
            page: page.value,
            limit: limit.value
        })
        items.value = response.data.items
        meta.value = response.data.meta
    } finally {
        loading.value = false
    }
}

// Filter berubah → kembali ke page 1 lalu fetch (hindari double-fetch)
const resetAndFetch = () => {
    if (page.value !== 1) {
        page.value = 1
    } else {
        fetchSnapshots()
    }
}

let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => { if (ready.value) resetAndFetch() }, 400)
})

watch([status, type, month, year, limit], () => {
    if (ready.value) resetAndFetch()
})
watch(page, () => {
    if (ready.value) fetchSnapshots()
})

onMounted(async () => {
    // Set default bulan/tahun ke periode berjalan (cut-off 26-25) dari backend
    try {
        const additionalService = new AdditionalService()
        const response = await additionalService.getCurrentPeriod()
        if (response?.data) {
            month.value = response.data.month
            year.value = response.data.year
        }
    } catch {
        // fallback: tetap pakai bulan/tahun kalender saat ini
    }

    await fetchSnapshots()
    ready.value = true
})
</script>
