export interface InternalMouthlyQueryParams {
    year: number;
}

export interface MonthlyBucketDetailItem {
    name: string;
    count: number;
    total: number;
}

export interface MonthlyDetailBreakdown {
    startDate: string;
    endDate: string;
    total: number;
    totalInternal: number;
    totalResell: number;
    internal: MonthlyBucketDetailItem[];
    resell: MonthlyBucketDetailItem[];
}

export interface InternalMonthlyData {
    month: string;
    detail: MonthlyDetailBreakdown[];
    total: number;
}

export interface InternalMouthlyResponseData {
    success: boolean;
    message: string;
    data: {
        total: number;
        totalInternal: number;
        totalResell: number;
        data: InternalMonthlyData[];
    };
}