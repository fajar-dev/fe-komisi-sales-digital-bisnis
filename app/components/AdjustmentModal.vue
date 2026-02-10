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
            description="Data changes may affect the commission of the Sales Manager."
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
        <div class="grid grid-cols-2 gap-4">
           <UFormField name="price" label="Resale Price (1 License)" required>
              <UInput v-model.number="formData.price" type="number" class="w-full">
                  <template #leading>
                      <span class="text-gray-500 text-sm">Rp.</span>
                  </template>
              </UInput>
          </UFormField>
          <UFormField name="modal" label="Modal (1 License)" required>
              <UInput v-model.number="formData.modal" type="number" class="w-full">
                  <template #leading>
                      <span class="text-gray-500 text-sm">Rp.</span>
                  </template>
              </UInput>
          </UFormField>
        </div>

        <div class="grid grid-cols-12 gap-4">
              <UFormField name="margin" label="Margin (%)" required class="col-span-4">
                  <UInput 
                      v-model.number="formData.margin" 
                      type="number" 
                      class="w-full" 
                      color="neutral"
                      variant="subtle"
                      readonly
                  />
              </UFormField>

              <UFormField name="markup" label="Markup" required class="col-span-8">
                  <UInput :model-value="formData.markup" type="number" class="w-full" color="neutral" variant="subtle" readonly>
                      <template #leading>
                          <span class="text-gray-500 text-sm">Rp.</span>
                      </template>
                  </UInput>
              </UFormField>
          </div>

          <UFormField name="dpp" label="DPP" required>
            <UInput :model-value="invoiceData ? Number(invoiceData.dpp) : 0" type="number" class="w-full" color="neutral" variant="subtle" readonly>
                <template #leading>
                    <span class="text-gray-500 text-sm">Rp.</span>
                </template>
            </UInput>
        </UFormField>
        
          <div class="grid grid-cols-12 gap-4">
              <UFormField name="percentage" label="Percentage (%)" required class="col-span-4">
                  <UInput 
                      v-model.number="formData.percentage" 
                      type="number" 
                      class="w-full" 
                      color="neutral"
                      variant="subtle"
                      readonly
                  />
              </UFormField>

              <UFormField name="commission" label="Commission" required class="col-span-8">
                  <UInput v-model.number="formData.commission" type="number" class="w-full" color="neutral" variant="subtle" readonly>
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

const toast = useToast()

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
  modal: z.number().optional(),
  price: z.number().optional(),
  margin: z.number().optional()
})

type Schema = z.output<typeof schema>

const formData = reactive({
  percentage: 0 as number | undefined,
  commission: 0 as number | undefined,
  note: '',
  modal: 0 as number | undefined,
  price: 0 as number | undefined,
  margin: 0 as number | undefined,
  markup: 0 as number | undefined
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
     
     const price = data.price ? Number(data.price) : 0
     const modal = data.modal ? Number(data.modal) : 0
     const markup = price - modal

     let margin = 0
     if (price > 0) {
         margin = ((price - modal) / price) * 100
     }
     margin = Number(margin.toFixed(2))

     Object.assign(formData, {
      percentage: data.salesCommissionPercentage ? Number(data.salesCommissionPercentage) : 0,
      commission: data.salesCommission ? Number(data.salesCommission) : 0,
      note: '',
      modal,
      price,
      margin,
      markup
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

watch([() => formData.price, () => formData.modal], ([newPrice, newModal]) => {
    if (isInitializing.value) return
    
    const price = newPrice || 0
    const modal = newModal || 0
    
    // Calculate Margin: (Price - Modal) / Price * 100
    let margin = 0
    if (price > 0) {
        margin = ((price - modal) / price) * 100
    }

    // Calculate Markup
    formData.markup = price - modal
    
    // Update margin display with 2 decimal places
    formData.margin = Number(margin.toFixed(2))

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
  isInitializing.value = true
  Object.assign(formData, {
    percentage: 0,
    commission: 0,
    note: '',
    modal: 0,
    price: 0,
    margin: 0,
    markup: 0
  })
  nextTick(() => {
    isInitializing.value = false
  })
}



async function onSubmit(_event: FormSubmitEvent<Schema>) {
  if (!props.ai || !invoiceData.value) return

  saving.value = true
  const adjustmentService = new AdjustmentService()

  await adjustmentService.createAdjustment({
      ai: props.ai,
      percentage: formData.percentage ?? 0,
      commission: formData.commission ?? 0,
      modal: formData.modal ?? 0,
      price: formData.price ?? 0,
      margin: formData.margin ?? 0,
      markup: formData.markup ?? 0,
      note: formData.note
  })

  toast.add({
      description: 'Adjustment request submitted. Please ask your manager to approve it.',
      color: 'success',
      icon: 'i-lucide-check-circle'
  })
  
  emit('updated')
  emit('update:open', false)
  resetForm()
  saving.value = false
}
</script>