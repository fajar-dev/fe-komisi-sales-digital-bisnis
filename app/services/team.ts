import type { TeamQueryParams, TeamResponseData } from "~/types/team"
import { apiService } from "./api-service"


export class TeamService {
    async getTeamCommission(employeeId: string, params: TeamQueryParams): Promise<TeamResponseData> {
        try {
            const response = await apiService.client.get(`/manager/${employeeId}/team`, {
                headers: {
                    authorization: `Bearer ${useAuth().state.token}`
                },
                params
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
}