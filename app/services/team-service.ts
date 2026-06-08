import type { ManagerTeamQueryParams, ManagerTeamResponseData } from "~/types/team"
import { apiService } from "./api-service"


export class TeamService {
    async getManagerTeam(managerId: string, params: ManagerTeamQueryParams): Promise<ManagerTeamResponseData> {
        try {
            const response = await apiService.client.get(`/team/${managerId}/manager`, {
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