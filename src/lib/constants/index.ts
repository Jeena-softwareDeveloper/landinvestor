import {
  LayoutDashboard,
  MapPin,
  Users,
  TrendingUp,
  ArrowLeftRight,
  CalendarDays,
  Wallet,
  FileText,
  Shield,
  Settings,
  type LucideIcon,
} from 'lucide-react';

// ─── Status Labels & Colors ──────────────────────────────────────────

export const LAND_STATUS_MAP: Record<string, { label: string; color: string; className: string }> = {
  active: { label: 'Active', color: '#059669', className: 'badge-success' },
  inactive: { label: 'Inactive', color: '#64748b', className: 'badge-default' },
  fully_funded: { label: 'Fully Funded', color: '#2563EB', className: 'badge-info' },
};

export const CUSTOMER_KYC_STATUS_MAP: Record<string, { label: string; color: string; className: string }> = {
  pending: { label: 'Pending', color: '#d97706', className: 'badge-warning' },
  verified: { label: 'Verified', color: '#059669', className: 'badge-success' },
  rejected: { label: 'Rejected', color: '#dc2626', className: 'badge-danger' },
};

export const CUSTOMER_ACCOUNT_STATUS_MAP: Record<string, { label: string; color: string; className: string }> = {
  active: { label: 'Active', color: '#059669', className: 'badge-success' },
  inactive: { label: 'Inactive', color: '#64748b', className: 'badge-default' },
  suspended: { label: 'Suspended', color: '#dc2626', className: 'badge-danger' },
};

export const INVESTMENT_STATUS_MAP: Record<string, { label: string; color: string; className: string }> = {
  active: { label: 'Active', color: '#059669', className: 'badge-success' },
  matured: { label: 'Matured', color: '#2563EB', className: 'badge-info' },
  cancelled: { label: 'Cancelled', color: '#dc2626', className: 'badge-danger' },
};

export const TRANSACTION_STATUS_MAP: Record<string, { label: string; color: string; className: string }> = {
  pending: { label: 'Pending', color: '#d97706', className: 'badge-warning' },
  verified: { label: 'Verified', color: '#059669', className: 'badge-success' },
  rejected: { label: 'Rejected', color: '#dc2626', className: 'badge-danger' },
  completed: { label: 'Completed', color: '#2563EB', className: 'badge-info' },
};

export const DAILY_RETURN_STATUS_MAP: Record<string, { label: string; color: string; className: string }> = {
  accrued: { label: 'Accrued', color: '#d97706', className: 'badge-warning' },
  verified: { label: 'Verified', color: '#2563EB', className: 'badge-info' },
  paid: { label: 'Paid', color: '#059669', className: 'badge-success' },
};

export const WITHDRAWAL_STATUS_MAP: Record<string, { label: string; color: string; className: string }> = {
  pending: { label: 'Pending', color: '#d97706', className: 'badge-warning' },
  approved: { label: 'Approved', color: '#2563EB', className: 'badge-info' },
  processing: { label: 'Processing', color: '#7c3aed', className: 'badge-info' },
  paid: { label: 'Paid', color: '#059669', className: 'badge-success' },
  rejected: { label: 'Rejected', color: '#dc2626', className: 'badge-danger' },
};

// ─── Transaction Types ───────────────────────────────────────────────

export const TRANSACTION_TYPES: Record<string, { label: string; color: string }> = {
  deposit: { label: 'Deposit', color: '#059669' },
  return_payment: { label: 'Return Payment', color: '#2563EB' },
  withdrawal: { label: 'Withdrawal', color: '#d97706' },
  refund: { label: 'Refund', color: '#dc2626' },
  adjustment: { label: 'Adjustment', color: '#7c3aed' },
};

export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
] as const;

// ─── Navigation Menu Items ───────────────────────────────────────────

export interface NavMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

export interface NavMenuGroup {
  group: string;
  items: NavMenuItem[];
}

export const NAVIGATION_MENU: NavMenuGroup[] = [
  {
    group: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Management',
    items: [
      { name: 'Land Properties', href: '/dashboard/lands', icon: MapPin },
      { name: 'Customers', href: '/dashboard/customers', icon: Users },
      { name: 'Investments', href: '/dashboard/investments', icon: TrendingUp },
    ],
  },
  {
    group: 'Finance',
    items: [
      { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
      { name: 'Daily Returns', href: '/dashboard/returns', icon: CalendarDays },
      { name: 'Withdrawals', href: '/dashboard/withdrawals', icon: Wallet },
    ],
  },
  {
    group: 'Reports',
    items: [
      { name: 'Reports', href: '/dashboard/reports', icon: FileText },
      { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: Shield, roles: ['admin'] },
    ],
  },
  {
    group: 'System',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
    ],
  },
];

// ─── Default Pagination ──────────────────────────────────────────────

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  maxLimit: 100,
} as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// ─── Date Formats ────────────────────────────────────────────────────

export const DATE_FORMATS = {
  display: 'dd MMM yyyy',
  displayTime: 'dd MMM yyyy, hh:mm a',
  input: 'yyyy-MM-dd',
  api: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  monthYear: 'MMM yyyy',
  dayMonth: 'dd MMM',
  time: 'hh:mm a',
} as const;

// ─── Roles ───────────────────────────────────────────────────────────

export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'viewer', label: 'Viewer' },
] as const;

// ─── App-wide Constants ──────────────────────────────────────────────

export const APP_NAME = 'Land Investment Platform';
export const CURRENCY_SYMBOL = '₹';
export const DEFAULT_RETURN_RATE = 0.1; // 0.1% per day
