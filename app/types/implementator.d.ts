export interface ImplementatorMouthlyQueryParams {
    year: number;
}

export interface ImplementatorMonthlyDetail {
    name: string;
    count: number;
    total: number;
}

export interface ImplementatorMonthlyData {
    month: string;
    detail: ImplementatorMonthlyDetail[];
    total: number;
}

export interface ImplementatorMouthlyResponseData {
    success: boolean;
    message: string;
    data: {
        total: number;
        data: ImplementatorMonthlyData[];
    };
}
