
export interface SalesInvoiceQueryParams {
    startDate: string;
    endDate: string;
}

export interface InvoiceSalesResponseData {
    success: boolean;
    message: string;
    data: {
        data: InvoiceSalesData[];
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


