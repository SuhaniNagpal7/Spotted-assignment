export interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
    password: string;
    wallet_balance: number;
    created_at: string;
    updated_at: string;
}
export interface BankAccount {
    id: string;
    user_id: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    bank_name: string;
    account_type: 'savings' | 'current';
    verified: boolean;
    created_at: string;
}
export interface Transaction {
    id: string;
    user_id: string;
    transfer_id: string;
    amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVERSED';
    utr?: string;
    bank_account_id: string;
    transfer_mode: 'IMPS' | 'NEFT' | 'UPI';
    remarks?: string;
    created_at: string;
    processed_at?: string;
    failure_reason?: string;
}
export interface AuthTokenPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}
export interface CreateTransferRequest {
    transferId: string;
    amount: number;
    transferMode: 'banktransfer' | 'upi';
    remarks: string;
    beneDetails: {
        beneId: string;
        name: string;
        email: string;
        phone: string;
        bankAccount: string;
        ifsc: string;
        address1: string;
        city: string;
        state: string;
        pincode: string;
    };
}
export interface TransferResponse {
    status: string;
    subCode: string;
    message: string;
    data: {
        referenceId: string;
        utr?: string;
        acknowledged: number;
    };
}
export interface BalanceResponse {
    status: string;
    subCode: string;
    message: string;
    data: {
        availableBalance: number;
        currency: string;
        lastUpdated: string;
    };
}
export interface BeneficiaryRequest {
    beneId: string;
    name: string;
    email: string;
    phone: string;
    bankAccount: string;
    ifsc: string;
    address1: string;
    city: string;
    state: string;
    pincode: string;
}
export interface BeneficiaryResponse {
    status: string;
    subCode: string;
    message: string;
    data: {
        beneId: string;
        name: string;
        email: string;
        phone: string;
        bankAccount: string;
        ifsc: string;
        maskedCard: string;
        status: string;
    };
}
export interface NotificationEvent {
    id: string;
    user_id: string;
    type: 'LOW_BALANCE' | 'WITHDRAWAL_SUCCESS' | 'WITHDRAWAL_FAILED' | 'ACCOUNT_ADDED';
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map