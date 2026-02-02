import type { InvoiceSalesResponseData, SalesInvoiceQueryParams } from "~/types/sales"
import { apiService } from "./api-service"
import type { InvoiceImplementatorResponseData, ImplementatorInvoiceQueryParams } from "~/types/implementator"


export class InvoiceService {
    async getInvoiceSales(employeeId: string, params: SalesInvoiceQueryParams): Promise<InvoiceSalesResponseData> {
        try {
            const response = await apiService.client.get(`/sales/${employeeId}/invoice`, {
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                },
                params
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    async getInvoiceImplementator(employeeId: string, params: ImplementatorInvoiceQueryParams): Promise<InvoiceImplementatorResponseData> {
        try {
            const response = await apiService.client.get(`/implementator/${employeeId}/invoice`, {
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                },
                params
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
}