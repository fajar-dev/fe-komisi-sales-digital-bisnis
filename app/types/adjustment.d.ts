export interface AdjustmentResponseShowData {
    success: boolean
    message: string
    data: AdjustmentData
}

export interface AdjustmentResponseData {
    success: boolean
    message: string
    data: AdjustmentData[]
}

export interface AdjustmentData {
    id: number
    ai: number
    employeeId: string
    approvedId: string
    modal: string
    price: string
    margin: string
    markup: string
    commission_percentage: string
    commission: string
    note: string
    status: 'pending' | 'approved' | 'decline'
    requestName: string
    requestPhotoProfile: string
    companyName: string
    customerId: string
    serviceGroupId: string
    serviceName: string
    invoiceNumber: number
    position: number
}


export interface AdjustmentRequestData {
    ai: number
    percentage: number
    commission: number
    modal: number
    price: number
    margin: number
    markup: number
    note: string
}