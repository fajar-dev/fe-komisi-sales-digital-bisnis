import type { InvoiceQueryParams, InvoiceSalesResponseData, InvoiceImplementatorResponseData } from "~/types/invoice"
import { apiService } from "./api-service"


export class InvoiceService {
    async getInvoiceSales(employeeId: string, params: InvoiceQueryParams): Promise<InvoiceSalesResponseData> {
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

    async getInvoiceImplementator(employeeId: string, params: InvoiceQueryParams): Promise<InvoiceImplementatorResponseData> {
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