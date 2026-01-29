export interface ManagerMouthlyQueryParams {
    year: number;
}

export interface ManagerMonthlyDetail {
    name: string;
    count: number;
    total: number;
}

export interface ManagerMonthlyData {
    month: string;
    detail: ManagerMonthlyDetail[];
    total: number;
}

export interface ManagerMouthlyResponseData {
    success: boolean;
    message: string;
    data: {
        total: number;
        data: ManagerMonthlyData[];
    };
}
