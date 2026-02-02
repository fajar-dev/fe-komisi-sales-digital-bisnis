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

export interface InvoiceImplementatorResponseData {
    success: boolean;
    message: string;
    data: {
        data: InvoiceImplementatorData[];
        total: number;
    };
}

export interface ImplementatorInvoiceQueryParams {
    startDate: string;
    endDate: string;
}

export interface InvoiceImplementatorData {
    ai: number;
    invoiceNumber: number;
    invoiceDate: string;
    paidDate: string;
    monthPeriod: number;
    dpp: number;
    customerServiceId: number;
    customerId: string;
    customerCompany: string;
    customerGroupId: string;
    serviceId: string;
    serviceName: string;
    salesId: string;
    managerSalesId: string;
    implementatorId: string;
    referralId: string;
    isNew: boolean;
    isUpgrade: boolean;
    isTermin: boolean;
    isAdjustment: boolean;
    implementatorCommission: number;
    implementatorCommissionPercentage: number;
}