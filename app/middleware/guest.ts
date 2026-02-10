
import { authService } from '~/services/auth-service'
import { useDashboardRoute } from '~/composables/useDasboardRoute'

export default defineNuxtRouteMiddleware((to, from) => {
    if (process.client) {
        if (authService.token.value && authService.user.value) {
            const { getRoute } = useDashboardRoute()
            const dashboardPath = getRoute(authService.user.value)
            return navigateTo(dashboardPath)
        }
    }
})
