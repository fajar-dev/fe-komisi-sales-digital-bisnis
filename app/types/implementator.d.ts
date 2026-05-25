
export interface InvoiceImplementatorResponseData {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        invoice: InvoiceImplementatorData[];
        churnCount: number;
        totalSubscription: number;
        totalMrc: number;
        totalCommission: number;
    };
}

export interface ImplementatorInvoiceQueryParams {
    month: number;
    year: number;
}

export interface InvoiceImplementatorData {
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
    salesId: {
        name: string;
        employeeId: string;
        photoProfile: string;
    };
    subscription: number;
    mrc: number;
    commissionPercentage: number;
    commission: number;
}