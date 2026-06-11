export interface ManagerTeamQueryParams {
    month: number;
    year: number;
}

export interface ManagerTeamResponseData {
    success: boolean;
    statusCode: number;
    message: string;
    data: ManagerTeamMemberData[];
}

export interface ManagerTeamMemberData {
    employeeId: string;
    name: string;
    photoProfile: string;
    detail: {
        commission: number;
        mrc: number;
        subscription: number;
        newCustomer: number;
        newAccount: number;
    };
    managerCommission: number;
}

export interface ManagerTeamYearlyResponseData {
    success: boolean;
    statusCode: number;
    message: string;
    data: ManagerTeamYearlyMemberData[];
}

export interface ManagerTeamYearlyMemberData {
    employeeId: string;
    name: string;
    photoProfile: string;
    monthly: ManagerTeamYearlyMonthData[];
}

export interface ManagerTeamYearlyMonthData {
    commission: number;
    mrc: number;
    subscription: number;
    newCustomer: number;
    newAccount: number;
    managerCommission: number;
}