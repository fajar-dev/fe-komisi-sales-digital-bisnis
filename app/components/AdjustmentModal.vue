<template>
  <UModal
    :open="props.open"
    :title="`#${invoiceData?.invoiceNumber}`"
    :description="invoiceData?.customerCompany"
    @update:open="emit('update:open', $event)"
    :ui="{
      overlay: 'bg-white/45 dark:bg-black/45 backdrop-blur-xs'
    }"
  >
    <template #body>
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-gray-500" />
      </div>
      
      <div v-else class="space-y-4">
          <UAlert
            color="warning"
            variant="subtle"
            description="Data changes may affect the commission of the Implementator and Sales Manager."
            icon="i-lucide-alert-triangle"
            size="xs"
            :ui="{
              icon: 'pt-8'
            }"
          />

      <UForm
          :schema="schema"
          :state="formData"
          class="space-y-3"
          @submit="onSubmit"
      >
          <UFormField v-if="isResell" name="modal" label="Modal (HPP)" class="col-span-3">
              <UInput v-model.number="formData.modal" type="number" class="w-full">
                  <template #leading>
                      <span class="text-gray-500 text-sm">Rp.</span>
                  </template>
              </UInput>
          </UFormField>

          <div class="grid grid-cols-12 gap-4">
              <UFormField name="percentage" label="Percentage (%)" required class="col-span-4">
                  <USelect 
                      v-if="isInternal"
                      v-model.number="formData.percentage" 
                      :items="percentageOptions" 
                      class="w-full" 
                  />
                  <UInput 
                      v-else
                      v-model.number="formData.percentage" 
                      type="number" 
                      class="w-full" 
                      readonly
                  />
              </UFormField>

              <UFormField name="commission" label="Commission" required class="col-span-8">
                  <UInput v-model.number="formData.commission" type="number" class="w-full" readonly>
                      <template #leading>
                          <span class="text-gray-500 text-sm">Rp.</span>
                      </template>
                  </UInput>
              </UFormField>
          </div>

          <UFormField label="Note" name="note" required>
              <UTextarea
                  v-model="formData.note"
                  class="w-full"
                  placeholder="Reason..."
                  :rows="3"
              />
          </UFormField>

          <div class="flex justify-end gap-2">
              <UButton
                  label="Cancel"
                  color="neutral"
                  variant="subtle"
                  :disabled="saving"
                  @click="emit('update:open', false)"
              />
              <UButton
                  label="Submit"
                  color="primary"
                  variant="solid"
                  type="submit"
                  :loading="saving"
              />
          </div>
      </UForm>

      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { InvoiceService } from '~/services/invoice-service'
import { useRoute } from 'vue-router'
import type { InvoiceSalesData } from '~/types/sales'
import { AdjustmentService } from '~/services/adjustment-service'

const props = defineProps<{
  ai: number
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'updated'): void
  (e: 'update:open', value: boolean): void
}>()

const route = useRoute()
const employeeId = route.params.id as string

const schema = z.object({
  percentage: z.number(),
  commission: z.number(),
  note: z.string().min(1, 'Note is required'),
  modal: z.number().optional()
})

type Schema = z.output<typeof schema>

const formData = reactive({
  percentage: 0 as number | undefined,
  commission: 0 as number | undefined,
  note: '',
  modal: 0 as number | undefined
})

const saving = ref(false)
const loading = ref(false)
const isInitializing = ref(false)
const initialPercentage = ref(0)
const invoiceData = ref<InvoiceSalesData | null>(null)

async function loadInvoiceData() {
  if (!props.ai) return

  loading.value = true
  const invoiceService = new InvoiceService()
  const response = await invoiceService.getInvoiceById(employeeId, String(props.ai))
  if (response?.data) {
     invoiceData.value = response.data
     const data = response.data as any

     isInitializing.value = true
     initialPercentage.value = data.salesCommissionPercentage ?? 0
     
     Object.assign(formData, {
      percentage: data.salesCommissionPercentage ? Number(data.salesCommissionPercentage) : 0,
      commission: data.salesCommission ? Number(data.salesCommission) : 0,
      note: data.adjustmentNote || '',
      modal: data.modal ? Number(data.modal) : 0
    })
    nextTick(() => {
      isInitializing.value = false
    })
  }
  loading.value = false
}

watch(() => formData.percentage, (newVal) => {
  if (isInitializing.value) return
  if (newVal !== undefined && invoiceData.value?.dpp) {
      const dpp = Number(invoiceData.value.dpp)
      formData.commission = (dpp * newVal) / 100
  }
})
watch(() => formData.modal, (newModal) => {
    if (isInitializing.value) return
    if (!isResell.value || !invoiceData.value?.dpp) return

    // Jika default percentage sudah 0.5 (Recurring), jangan ubah
    if (initialPercentage.value === 0.5) return
    
    const dpp = Number(invoiceData.value.dpp)
    const modal = newModal || 0
    
    // Calculate Margin: (Modal - DPP) / Modal * 100
    // If modal is 0, treat as < 10% margin category (2.5% commission)
    let margin = 0
    if (modal > 0 && dpp > 0) {
        margin = ((modal - dpp) / modal) * 100
    }
    
    let newPercentage = 0
    if (margin >= 15) {
        newPercentage = 5
    } else if (margin >= 10 && margin < 15) {
        newPercentage = 4
    } else {
        newPercentage = 2.5
    }
    
    formData.percentage = newPercentage
})

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.ai) {
      await loadInvoiceData()
    } else {
      resetForm()
      invoiceData.value = null
    }
  },
  { immediate: true }
)

function resetForm() {
  Object.assign(formData, {
    percentage: 0,
    commission: 0,
    note: '',
    modal: 0
  })
}

const isResell = computed(() => {
    return String((invoiceData.value as any)?.type || '').toLowerCase().trim().includes('resell')
})

const isInternal = computed(() => {
    return String((invoiceData.value as any)?.type || '').toLowerCase().trim().includes('internal')
})

const percentageOptions = computed(() => {
  const defaults = [12, 15, 1, 5, 4, 2.5, 0.4]

  if (!invoiceData.value) return defaults
  const type = String((invoiceData.value as any).type || '').toLowerCase().trim()
  
  if (type.includes('resell')) return [5, 4, 2.5, 0.4]
  if (type.includes('internal')) return [12, 15, 1]
  
  return defaults
})

async function onSubmit(_event: FormSubmitEvent<Schema>) {
  if (!props.ai || !invoiceData.value) return

  saving.value = true
  const adjustmentService = new AdjustmentService()

  const oldValue = {
      salesCommissionPercentage: Number(invoiceData.value.salesCommissionPercentage ?? 0),
      salesCommission: Number(invoiceData.value.salesCommission ?? 0),
      modal: Number((invoiceData.value as any).modal ?? 0),
  }

  const newValue = {
          salesCommissionPercentage: formData.percentage,
          salesCommission: formData.commission,
          modal: formData.modal ?? 0,
  }
  
  const action = 'update'

  await adjustmentService.createAdjustment({
      ai: props.ai,
      oldValue: oldValue as any,
      newValue: newValue,
      note: formData.note,
      action: action
  })
  
  emit('updated')
  emit('update:open', false)
  resetForm()
  saving.value = false
}
</script>