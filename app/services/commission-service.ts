import { apiService } from "./api-service"
import type { ManagerMouthlyResponseData, ManagerCommissionResponseData, ManagerCommissionYearlyResponseData } from "~/types/manager"
import type { ImplementatorCommissionResponseData, ImplementatorCommissionYearlyResponseData } from "~/types/implementator"
import type { SalesCommissionResponseData, SalesCommissionYearlyResponseData } from "~/types/sales"

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

    async salesCommissionYearly(employeeId: string, params?: { year: number }): Promise<SalesCommissionYearlyResponseData> {
        try {
            const response = await apiService.client.get(`/commission/${employeeId}/sales/yearly`, {
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

    async implementatorCommissionYearly(employeeId: string, params?: { year: number }): Promise<ImplementatorCommissionYearlyResponseData> {
        try {
            const response = await apiService.client.get(`/commission/${employeeId}/implementator/yearly`, {
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

    async managerCommissionYearly(managerId: string, params?: { year: number }): Promise<ManagerCommissionYearlyResponseData> {
        try {
            const response = await apiService.client.get(`/commission/${managerId}/manager/yearly`, {
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