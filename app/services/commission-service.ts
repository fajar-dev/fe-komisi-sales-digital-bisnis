import { apiService } from "./api-service"
import type { InvoiceQueryParams, InvoiceResponseData, InternalMouthlyQueryParams, InternalMouthlyResponseData } from "~/types/internal"
import type { ImplementatorMouthlyQueryParams, ImplementatorMouthlyResponseData } from "~/types/implementator"
import type { ManagerMouthlyQueryParams, ManagerMouthlyResponseData } from "~/types/manager"

export class CommissionService {
    async amInternalCommission(params?: InternalMouthlyQueryParams): Promise<InternalMouthlyResponseData> {
        try {
            const response = await apiService.client.get('/internal/commission', {
                params
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    async implementatorCommission(params?: ImplementatorMouthlyQueryParams): Promise<ImplementatorMouthlyResponseData> {
        try {
            const response = await apiService.client.get('/implementator/commission', {
                params
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    async managerCommission(params?: ManagerMouthlyQueryParams): Promise<ManagerMouthlyResponseData> {
        try {
            const response = await apiService.client.get('/manager/commission', {
                params
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    async invoiceData(params?: InvoiceQueryParams): Promise<InvoiceResponseData> {
        try {
            const response = await apiService.client.get('/internal/am/invoice', {
                params
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
}