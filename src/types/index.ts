import { Types } from 'mongoose';

// ─── User ────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'manager' | 'viewer';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserSafe = Omit<IUser, 'password'>;

// ─── Land ────────────────────────────────────────────────────────────
export type LandStatus = 'active' | 'inactive' | 'fully_funded';

export interface IDailyReturnConfig {
  defaultRate: number;
  isActive: boolean;
  lastCalculated?: Date;
}

export interface ILand {
  _id: string;
  name: string;
  location: string;
  surveyNumber: string;
  totalArea: number;
  totalValue: number;
  availableInvestment: number;
  totalInvested: number;
  investmentPercentage: number;
  minInvestmentAmount?: number;
  coverImage?: string;
  images: string[];
  documents: string[];
  description: string;
  status: LandStatus;
  publicApproved?: boolean;
  featured?: boolean;
  rentalIncomeModel?: {
    projectedAnnualYield: number;
    distributionFrequency: 'daily' | 'monthly' | 'quarterly';
    tenantType: string;
    leaseDurationYears: number;
  };
  dailyReturnConfig: IDailyReturnConfig;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Customer ────────────────────────────────────────────────────────
export type KycStatus = 'pending' | 'verified' | 'rejected';
export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface IBankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
}

export interface ICustomer {
  _id: string;
  customerId: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  addressDetails?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  investorTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | string;
  totalInvested?: number;
  kycStatus: KycStatus;
  bankDetails: IBankDetails;
  upiId: string;
  registrationDate: Date;
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Investment ──────────────────────────────────────────────────────
export type InvestmentStatus = 'active' | 'matured' | 'cancelled';

export interface IInvestment {
  _id: string;
  customerId: any;
  landId: any;
  amount: number;
  startDate: Date;
  duration: number; // in months
  returnRate: number; // percentage
  status: InvestmentStatus;
  paymentReference: string;
  investmentPercentage: number;
  dailyAccruedReturn: number;
  monthlyAccruedReturn: number;
  totalAccruedReturn: number;
  maturityAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Transaction ─────────────────────────────────────────────────────
export type TransactionType =
  | 'deposit'
  | 'return_payment'
  | 'withdrawal'
  | 'refund'
  | 'adjustment';

export type TransactionStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'completed';

export type PaymentMethod = 'upi' | 'bank_transfer' | 'cash' | 'cheque';

export interface ITransaction {
  _id: string;
  customerId: any;
  investmentId?: any;
  type: TransactionType;
  amount: number;
  upiId: string;
  upiReference: string;
  transactionDate: Date;
  paymentMethod: PaymentMethod;
  screenshotUrl: string;
  adminNotes: string;
  status: TransactionStatus;
  verifiedBy?: any;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Daily Return ────────────────────────────────────────────────────
export type DailyReturnStatus = 'accrued' | 'verified' | 'paid';

export interface IDailyReturn {
  _id: string;
  investmentId: any;
  customerId: any;
  landId: any;
  date: Date;
  investmentAmount: number;
  returnRate: number;
  dailyReturnAmount: number;
  status: DailyReturnStatus;
  paidAt?: Date;
  verifiedBy?: any;
  createdAt: Date;
}

// ─── Withdrawal ──────────────────────────────────────────────────────
export type WithdrawalStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'paid'
  | 'rejected';

export interface IWithdrawal {
  _id: string;
  customerId: any;
  requestedAmount: number;
  availableBalance: number;
  paymentMethod?: string;
  upiId?: string;
  bankDetails?: IBankDetails;
  requestDate: Date;
  status: WithdrawalStatus;
  approvedBy?: any;
  approvedAt?: Date;
  paymentReference?: string;
  paymentProof?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Audit Log ───────────────────────────────────────────────────────
export interface IAuditLog {
  _id: string;
  userId: any;
  action: string;
  module: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: Date;
}

// ─── API Response Types ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ─── Filter Types ────────────────────────────────────────────────────
export interface LandFilters extends PaginationParams {
  status?: LandStatus;
  search?: string;
  location?: string;
}

export interface CustomerFilters extends PaginationParams {
  kycStatus?: KycStatus;
  accountStatus?: AccountStatus;
  search?: string;
}

export interface InvestmentFilters extends PaginationParams {
  customerId?: string;
  landId?: string;
  status?: InvestmentStatus;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface TransactionFilters extends PaginationParams {
  customerId?: string;
  investmentId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface DailyReturnFilters extends PaginationParams {
  investmentId?: string;
  customerId?: string;
  landId?: string;
  status?: DailyReturnStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface WithdrawalFilters extends PaginationParams {
  customerId?: string;
  status?: WithdrawalStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogFilters extends PaginationParams {
  userId?: string;
  action?: string;
  module?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Dashboard Types ─────────────────────────────────────────────────
export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalLands: number;
  activeLands: number;
  totalInvestments: number;
  totalInvestedAmount: number;
  totalReturnsAccrued: number;
  totalReturnsPaid: number;
  pendingWithdrawals: number;
  pendingWithdrawalAmount: number;
  pendingTransactions: number;
  monthlyInvestmentTrend: MonthlyTrend[];
  investmentsByLand: LandInvestmentSummary[];
}

export interface MonthlyTrend {
  month: string;
  amount: number;
  count: number;
}

export interface LandInvestmentSummary {
  landId: string;
  landName: string;
  totalInvested: number;
  investorCount: number;
  percentageFunded: number;
}

// ─── Auth Types ──────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: IUserSafe;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Report Types ────────────────────────────────────────────────────
export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  type?: string;
  customerId?: string;
  landId?: string;
}

export interface InvestmentReport {
  totalInvestments: number;
  totalAmount: number;
  averageInvestment: number;
  byLand: LandInvestmentSummary[];
  byMonth: MonthlyTrend[];
}

export interface ReturnReport {
  totalReturns: number;
  totalAmount: number;
  accrued: number;
  verified: number;
  paid: number;
  byMonth: MonthlyTrend[];
}

export interface TransactionReport {
  totalTransactions: number;
  totalAmount: number;
  byType: { type: TransactionType; count: number; amount: number }[];
  byStatus: { status: TransactionStatus; count: number; amount: number }[];
  byMonth: MonthlyTrend[];
}


// ─── UPI & Payment Order Extensions (3-App Architecture) ──────────────

export type UpiStatus = 'active' | 'inactive' | 'suspended';
export type UpiRotationStrategy = 'round_robin' | 'weighted' | 'least_used' | 'priority';

export interface IUpiAccount {
  _id: string;
  upiId: string;
  displayName: string;
  qrCode?: string;
  provider: string;
  status: UpiStatus;
  priority: number;
  weight: number;
  dailyTransactionLimit: number;
  dailyCollectionLimit: number;
  currentDailyCount: number;
  currentDailyAmount: number;
  totalTransactions: number;
  totalCollection: number;
  lastAssignedAt?: Date;
  lastResetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentOrderStatus =
  | 'initiated'
  | 'pending'
  | 'submitted'
  | 'processing'
  | 'verified'
  | 'failed'
  | 'rejected'
  | 'expired'
  | 'refunded';

export interface IPaymentOrder {
  _id: string;
  orderId: string;
  customerId: any;
  landId: any;
  amount: number;
  assignedUpiAccountId?: any;
  assignedUpiString: string;
  assignedUpiName: string;
  qrCodeUrl?: string;
  status: PaymentOrderStatus;
  expiresAt: Date;
  utr?: string;
  paymentProof?: string;
  customerNotes?: string;
  adminNotes?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: any;
  rejectionReason?: string;
  investmentId?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentTransaction {
  _id: string;
  orderId: any;
  utr: string;
  amount: number;
  upiAccountId: any;
  customerId: any;
  status: 'submitted' | 'verified' | 'rejected';
  reconciliationSource: 'customer_submission' | 'manual_entry' | 'gateway_webhook';
  proofUrl?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpiAssignmentLog {
  _id: string;
  orderId: string;
  upiAccountId: any;
  upiId: string;
  customerId: any;
  amount: number;
  strategyUsed: UpiRotationStrategy;
  timestamp: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IRentalIncome {
  _id: string;
  landId: any;
  period: string;
  grossIncome: number;
  operationalExpenses: number;
  netDistributableIncome: number;
  tenantDetails?: string;
  distributedAmount: number;
  status: 'collected' | 'distributed' | 'audited';
  createdAt: Date;
  updatedAt: Date;
}

export interface IReturnLedger {
  _id: string;
  customerId: any;
  investmentId: any;
  landId: any;
  amount: number;
  type: 'rental_yield' | 'bonus' | 'adjustment';
  referenceDate: Date;
  payoutStatus: 'accrued' | 'verified' | 'paid';
  payoutTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  _id: string;
  recipientType: 'customer' | 'admin';
  recipientId: any;
  title: string;
  message: string;
  type: 'payment' | 'investment' | 'return' | 'withdrawal' | 'system';
  read: boolean;
  link?: string;
  createdAt: Date;
}

export interface CustomerAuthResponse {
  token: string;
  customer: {
    _id: string;
    customerId: string;
    fullName: string;
    email: string;
    mobile: string;
    kycStatus: KycStatus;
    accountStatus: AccountStatus;
    walletBalance: number;
  };
}
