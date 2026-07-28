class HealthService {
    getHealth() {
        return {
            success: true,
            message: "Billing API is healthy"
        };
    }
}
export const healthService = new HealthService();