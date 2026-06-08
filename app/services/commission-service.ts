import { apiService } from "./api-service"
import type { ManagerMouthlyResponseData, ManagerCommissionResponseData } from "~/types/manager"
import type { ImplementatorCommissionResponseData } from "~/types/implementator"
import type { SalesCommissionResponseData } from "~/types/sales"

export class CommissionService {

    async managerCommission(employeeId: string, params?: { month: number, year: number }): Promise<ManagerMouthlyResponseData> {
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

    async salesCommission(employeeId: string, params?: { month: number, year: number }): Promise<SalesCommissionResponseData> {
        try {
            const response = await apiService.client.get(`/commission/${employeeId}/sales`, {
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

    async managerCommissionSummary(managerId: string, params?: { month: number, year: number }): Promise<ManagerCommissionResponseData> {
        try {
            const response = await apiService.client.get(`/commission/${managerId}/manager`, {
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