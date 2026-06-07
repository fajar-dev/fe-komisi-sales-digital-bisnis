
import type { TrendData } from '~/types/sales'

export interface InvoiceImplementatorResponseData {
    success: boolean;
    statusCode: number;
    message: string;
    data: InvoiceImplementatorData[]
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
    monthPeriodSummary: string;
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
    sales: {
        name: string;
        employeeId: string;
        photoProfile: string;
    };
    subscription: number;
    mrc: number;
    commissionPercentage: number;
    commission: number;
}

export interface ImplementatorCommissionResponseData {
    success: boolean;
    statusCode: number;
    message: string;
    data: ImplementatorCommissionData;
}

export interface ImplementatorCommissionData {
    commission: {
        new: TrendData;
        recurring: TrendData;
        total: TrendData;
    };
    mrc: TrendData;
    subscription: TrendData;
    churnCount: TrendData;
    newAccount: TrendData;
}