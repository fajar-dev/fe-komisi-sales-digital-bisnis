export interface InternalMouthlyQueryParams {
    year: number;
}

export interface MonthlyBucketDetailItem {
    name: string;
    count: number;
    total: number;
}

export interface MonthlyDetailBreakdown {
    startDate: string;
    endDate: string;
    total: number;
    totalInternal: number;
    totalResell: number;
    mrc: number;
    subscription: number;
    internal: MonthlyBucketDetailItem[];
    resell: MonthlyBucketDetailItem[];
}

export interface InternalMonthlyData {
    month: string;
    detail: MonthlyDetailBreakdown[];
    total: number;
}

export interface InternalMouthlyResponseData {
    success: boolean;
    message: string;
    data: {
        total: number;
        totalInternal: number;
        totalResell: number;
        data: InternalMonthlyData[];
    };
}

export interface SalesInvoiceQueryParams {
    startDate: string;
    endDate: string;
}

export interface InvoiceSalesResponseData {
    success: boolean;
    message: string;
    data: {
        newResellData: InvoiceSalesData[];
        newResellTotalCommission: number;
        newResellTotalDpp: number;
        otherData: InvoiceSalesData[];
        otherTotalCommission: number;
        otherTotalDpp: number;
        totalCommission: number;
        totalDpp: number;
    };
}

export interface InvoiceSalesShowResponseData {
    success: boolean;
    message: string;
    data: InvoiceSalesData;
}

export interface InvoiceSalesData {
    ai: number;
    counter: number;
    invoiceNumber: number;
    position: number;
    invoiceDate: string;
    dpp: number;
    implementator: implementator;
    newSub:number
    paidDate: string;
    monthPeriod: number;
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
    isAdjustment: boolean;
    type:string
    salesCommissionPercentage: number;
    modal: string | null;
    price: string | null;
    margin: string | null;
    markup: string | null;
    mrc: number | string | null;
}

export interface implementator {
    name: string;
    id: string;
    photo: string;
}


