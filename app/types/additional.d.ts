export interface currentPeriod {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        year: number;
        month: number;
        startDate: string;
        endDate: string;
    }
}