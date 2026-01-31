export interface InvoiceQueryParams {
    startDate: string;
    endDate: string;
}

export interface InvoiceSalesResponseData {
    success: boolean;
    message: string;
    data: {
        data: InvoiceSalesData[];
        total: number;
    };
}

export interface InvoiceSalesData {
    ai: number;
    invoiceNumber: number;
    invoiceDate: string;
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
    salesCommission: number;
    salesCommissionPercentage: number;
}

export interface InvoiceImplementatorResponseData {
    success: boolean;
    message: string;
    data: {
        data: InvoiceImplementatorData[];
        total: number;
    };
}

export interface InvoiceImplementatorData {
    ai: number;
    invoiceNumber: number;
    invoiceDate: string;
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
    implementatorCommission: number;
    implementatorCommissionPercentage: number;
}