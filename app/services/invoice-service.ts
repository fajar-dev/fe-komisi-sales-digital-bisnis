
import { apiService } from "./api-service"
import type { InvoiceSalesInternalResponseData, SalesInvoiceQueryParams } from "~/types/sales"
import type { InvoiceImplementatorResponseData, ImplementatorInvoiceQueryParams } from "~/types/implementator"

export class InvoiceService {
    async getInvoiceInternal(employeeId: string, params: SalesInvoiceQueryParams): Promise<InvoiceSalesInternalResponseData> {
        try {
            const response = await apiService.client.get(`/invoice/${employeeId}/internal`, {
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                },
                params
            })
            return response.data
        } catch (error: any) {
            handleServiceError(error)
        }
    }

    async getInvoiceImplementator(employeeId: string, params: ImplementatorInvoiceQueryParams): Promise<InvoiceImplementatorResponseData> {
        try {
            const response = await apiService.client.get(`/invoice/${employeeId}/implementator`, {
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                },
                params
            })
            return response.data
        } catch (error: any) {
            handleServiceError(error)
        }
    }
}