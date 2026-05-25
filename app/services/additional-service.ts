import { apiService } from "./api-service"
import type { currentPeriod } from "~/types/additional"

export class AdditionalService {
    async getCurrentPeriod(year?: number, month?: number): Promise<currentPeriod> {
        try {
            const response = await apiService.client.get(`/additional/period`, {
                params: { year, month },
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