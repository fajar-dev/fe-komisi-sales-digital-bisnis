export interface SnapshotListQueryParams {
    search?: string;
    status?: string;
    type?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
}

export interface SnapshotSales {
    name: string;
    employeeId: string;
    photoProfile: string;
}

export interface SnapshotItem {
    ai: number;
    invoiceNumber: number;
    sequenceNumber: number;
    paidDate: string;
    status: string;
    monthPeriod: string;
    monthPeriodSummary: string;
    totalAccount: number;
    customerId: string;
    customerServiceId: number;
    customerCompany: string;
    serviceGroupId: string;
    serviceId: string;
    serviceName: string;
    serviceType: string;
    sales: SnapshotSales;
    implementator: SnapshotSales;
    subscription: number;
    mrc: number;
    commissionPercentage: number;
    commission: number;
    isAdjust: boolean;
}

export interface SnapshotListMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SnapshotListResponseData {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        items: SnapshotItem[];
        meta: SnapshotListMeta;
    };
}
