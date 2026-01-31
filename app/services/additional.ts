import { apiService } from "./api-service"
import type { currentPeriod } from "~/types/additional"

export class AdditionalService {
    async getCurrentPeriod(): Promise<currentPeriod> {
        try {
            const response = await apiService.client.get(`/additional`, {
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