import { apiService } from "./api-service"
import type { ManagerMouthlyQueryParams, ManagerMouthlyResponseData } from "~/types/manager"
import type { ImplementatorCommissionResponseData } from "~/types/implementator"

export class CommissionService {

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
            handleServiceError(error)
        }
    }

    async implementatorCommission(employeeId: string, params?: { month: number, year: number }): Promise<ImplementatorCommissionResponseData> {
        try {
            const response = await apiService.client.get(`/commission/${employeeId}/implementator`, {
                params,
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                }
            })
            return response.data
        } catch (error: any) {
            handleServiceError(error)
        }
    }
}