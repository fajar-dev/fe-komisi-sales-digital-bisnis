import { apiService } from "./api-service"
import type { ManagerMouthlyQueryParams, ManagerMouthlyResponseData } from "~/types/manager"

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
}