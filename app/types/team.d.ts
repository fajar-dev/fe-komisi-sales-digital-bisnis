export interface TeamQueryParams {
    year: number;
}

export interface TeamResponseData {
    success: boolean;
    message: string;
    data: {
        data: ManagerTeamData[];
        total: number;
    };
}

export interface ManagerTeamData {
    id: number
    employee_id: string
    name: string
    email: string
    photo_profile: string
    job_position: string
    organization_name: string
    job_level: string
    branch: string
    manager_id: number
    totalCommission: number
}