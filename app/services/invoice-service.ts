
import { apiService } from "./api-service"
import type { InvoiceSalesInternalResponseData, InvoiceSalesResellResponseData, SalesInvoiceQueryParams } from "~/types/sales"
import type { InvoiceImplementatorResponseData, ImplementatorInvoiceQueryParams } from "~/types/implementator"
import type { SnapshotListQueryParams, SnapshotListResponseData } from "~/types/snapshot"

export class InvoiceService {
    async getSnapshotList(params: SnapshotListQueryParams): Promise<SnapshotListResponseData> {
        try {
            const response = await apiService.client.get(`/invoice/snapshot`, {
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

    async getInvoiceResell(employeeId: string, params: SalesInvoiceQueryParams): Promise<InvoiceSalesResellResponseData> {
        try {
            const response = await apiService.client.get(`/invoice/${employeeId}/resell`, {
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