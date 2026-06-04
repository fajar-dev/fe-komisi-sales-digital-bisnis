export interface InvoiceSalesInternalResponseData {
    success: boolean;
    statusCode: number;
    message: string;
    data: InvoiceSalesInternalData[]
}

export interface SalesInvoiceQueryParams {
    month: number;
    year: number;
}

export interface InvoiceSalesInternalData {
    ai: number;
    invoiceNumber: number;
    sequenceNumber: number;
    paidDate: string;
    status: string;
    monthPeriod: string;
    totalAccount: number;
    customerId: string;
    customerServiceId: number;
    customerCompany: string;
    contractUntilDate: string;
    serviceGroupId: string;
    serviceId: string;
    serviceName: string;
    serviceType: string;
    crossSellCount: number;
    implementator: {
        name: string;
        employeeId: string;
        photoProfile: string;
    };
    subscription: number;
    mrc: number;
    commissionPercentage: number;
    commission: number;
}

export interface SalesCommissionResponseData {
    success: boolean;
    statusCode: number;
    message: string;
    data: SalesCommissionData;
}

export interface SalesCommissionData {
    commission: {
        new: number;
        recurring: number;
        total: number;
    };
    mrc: number;
    subscription: number;
}