import { apiService } from "./api-service"
import type { InternalMouthlyQueryParams, InternalMouthlyResponseData } from "~/types/sales"
import type { ImplementatorMouthlyQueryParams, ImplementatorMouthlyResponseData } from "~/types/implementator"
import type { ManagerMouthlyQueryParams, ManagerMouthlyResponseData } from "~/types/manager"

export class CommissionService {
    async salesCommission(employeeId: string, params?: InternalMouthlyQueryParams): Promise<InternalMouthlyResponseData> {
        try {
            const response = await apiService.client.get(`/sales/${employeeId}/commission`, {
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
}