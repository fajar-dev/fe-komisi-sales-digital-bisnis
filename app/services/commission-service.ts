import { apiService } from "./api-service"
import type { InvoiceQueryParams, InvoiceResponseData, InternalMouthlyQueryParams, InternalMouthlyResponseData } from "~/types/internal"
import type { ImplementatorMouthlyQueryParams, ImplementatorMouthlyResponseData } from "~/types/implementator"
import type { ManagerMouthlyQueryParams, ManagerMouthlyResponseData } from "~/types/manager"

export class CommissionService {
    async amInternalCommission(employeeId: string, params?: InternalMouthlyQueryParams): Promise<InternalMouthlyResponseData> {
        try {
            const response = await apiService.client.get(`/internal/${employeeId}/commission`, {
                params,
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                }
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    async implementatorCommission(employeeId: string, params?: ImplementatorMouthlyQueryParams): Promise<ImplementatorMouthlyResponseData> {
        try {
            const response = await apiService.client.get(`/implementator/${employeeId}/commission`, {
                params,
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                }
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    async managerCommission(employeeId: string, params?: ManagerMouthlyQueryParams): Promise<ManagerMouthlyResponseData> {
        try {
            const response = await apiService.client.get(`/manager/${employeeId}/commission`, {
                params,
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                }
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    async invoiceData(params?: InvoiceQueryParams): Promise<InvoiceResponseData> {
        try {
            const response = await apiService.client.get('/internal/am/invoice', {
                params,
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                }
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
}