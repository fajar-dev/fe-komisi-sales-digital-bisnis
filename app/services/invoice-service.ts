import type { InvoiceSalesResponseData, InvoiceSalesShowResponseData, SalesInvoiceQueryParams } from "~/types/sales"
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
            handleServiceError(error)
        }
    }

    async getInvoiceById(employeeId: string, ai: string): Promise<InvoiceSalesShowResponseData> {
        try {
            const response = await apiService.client.get(`/sales/${employeeId}/invoice/${ai}`, {
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                }
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