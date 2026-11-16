# LandVest Pro — Land Investment & Rental Returns Management Platform

> **Enterprise-Grade Land Asset Capital Allocation, Return Yield Accrual, and Payout Administration SaaS**

---

## 1. Executive Summary & Regulatory Disclaimer

LandVest Pro is a production-quality financial administration platform designed for real estate investment sponsors, asset managers, and land syndication companies. It provides end-to-end management of agricultural, commercial, and industrial land holdings, investor portfolios, daily rental income distributions, manual UPI/RTGS settlement verification, and risk/liability reporting.

> [!IMPORTANT]
> **Financial & Compliance Notice:**
> In accordance with financial guidelines, **projected land rental yields are never represented as guaranteed investment returns**. All platform return calculators clearly distinguish between *configured projected returns* and *actual verified rental revenue*. Daily returns remain in **Accrued** status until verified against incoming lease collections and disbursed by administrative authorization.

---

## 2. Technology Stack

- **Frontend Framework:** Next.js (App Router, React 19)
- **Language:** TypeScript (Strict mode, zero `any` shortcuts in core types)
- **Styling:** Tailwind CSS with custom fintech financial theme:
  - Deep Navy Blue (`#142B4A`)
  - Royal Blue (`#2563EB`)
  - Emerald Green (`#059669`)
  - Amber Alert (`#D97706`)
  - Crimson Danger (`#DC2626`)
  - Soft Background (`#F5F7FA`)
- **UI Components:** Reusable modular system (`Button`, `DataTable`, `StatCard`, `Modal`, `ConfirmDialog`, `Tabs`, `PageHeader`, `CurrencyDisplay`, `FileUpload`, `SearchInput`, `Pagination`, etc.)
- **Icons:** Lucide React
- **Data Visualizations:** Recharts (Area, Bar, Pie/Donut, Line)
- **Form Management & Validation:** React Hook Form + Zod
- **Database & ODM:** MongoDB + Mongoose with connection pooling and singleton caching
- **Authentication:** JWT (JSON Web Tokens) with 7-day expiration + Bcrypt password hashing + RBAC middleware
- **Report Exporting:** SheetJS (XLSX) for Excel + Clean CSS Print/PDF formatting

---

## 3. Project Architecture & Directory Structure

```text
land-investment-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx               # Split-screen branded login
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx           # Executive KPI dashboard & 4 charts
│   │   │   ├── lands/                       # Land Management Module
│   │   │   │   ├── page.tsx                 # Land catalog & capacity table
│   │   │   │   ├── new/page.tsx             # Land registration form
│   │   │   │   └── [id]/                    # Land details & edit
│   │   │   ├── customers/                   # Investor Management Module
│   │   │   │   ├── page.tsx                 # Investor directory
│   │   │   │   ├── new/page.tsx             # Customer KYC & banking registration
│   │   │   │   └── [id]/                    # Customer profile & multi-tab ledger
│   │   │   ├── investments/                 # Allocation Management Module
│   │   │   │   ├── page.tsx                 # Active holdings list
│   │   │   │   ├── new/page.tsx             # Contract creation & live projection preview
│   │   │   │   └── [id]/page.tsx            # Contract details & return history
│   │   │   ├── transactions/                # UPI / Bank Settlement Module
│   │   │   │   ├── page.tsx                 # Audited transfer ledger & verification modal
│   │   │   │   └── new/page.tsx             # Anti-duplicate manual UTR entry form
│   │   │   ├── daily-returns/               # Return Accrual & Payout Module
│   │   │   │   └── page.tsx                 # Calculation engine trigger & batch payouts
│   │   │   ├── withdrawals/                 # Capital & Yield Withdrawal Module
│   │   │   │   └── page.tsx                 # Multi-state approval & payout dialogs
│   │   │   ├── reports/                     # Reports & Analytics Module
│   │   │   │   └── page.tsx                 # 6 report types + Excel & PDF exports
│   │   │   ├── settings/                    # Admin Profile & Password Change
│   │   │   └── layout.tsx                   # Auth guard, responsive sidebar & topbar
│   │   ├── api/                             # RESTful Next.js Route Handlers
│   │   │   ├── auth/                        # /login, /me, /seed, /change-password
│   │   │   ├── lands/                       # GET, POST, PUT, DELETE
│   │   │   ├── customers/                   # GET, POST, PUT, DELETE
│   │   │   ├── investments/                 # GET, POST, PUT, DELETE
│   │   │   ├── transactions/                # GET, POST, PUT (Anti-duplicate check)
│   │   │   ├── returns/                     # GET, /calculate, /payout
│   │   │   ├── withdrawals/                 # GET, POST, PUT
│   │   │   └── reports/                     # /dashboard, /export
│   │   ├── globals.css                      # Tailwind variables & base styles
│   │   └── layout.tsx                       # Root layout & Toaster notification provider
│   │
│   ├── components/
│   │   ├── ui/                              # 15+ Reusable enterprise UI primitives
│   │   ├── layout/                          # Sidebar, Topbar, Breadcrumbs
│   │   └── dashboard/                       # Recharts responsive wrappers
│   │
│   ├── lib/
│   │   ├── mongodb.ts                       # Singleton cached Mongoose connection
│   │   ├── auth.ts                          # JWT sign/verify, password hash, withAuth guard
│   │   ├── utils.ts                         # formatCurrency (₹), formatDate, cn()
│   │   ├── constants/                       # Status maps, badges, navigation items
│   │   └── validations/                     # Zod schemas for all modules
│   │
│   ├── models/                              # Mongoose Schemas with indexes & hooks
│   │   ├── User.ts
│   │   ├── Land.ts
│   │   ├── Customer.ts
│   │   ├── Investment.ts
│   │   ├── Transaction.ts
│   │   ├── DailyReturn.ts
│   │   ├── Withdrawal.ts
│   │   └── AuditLog.ts
│   │
│   ├── services/                            # Frontend API service layer
│   └── types/                               # TypeScript type definitions
```

---

## 4. Default Seed Credentials & Quick Start

### 1. Configure Environment
Create `.env.local` in the project root:
```env
MONGODB_URI=mongodb://localhost:27017/land-investment-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Run the Development Server
```bash
npm run dev
# or for production:
npm run build
npm run start
```

### 3. Default Admin Account
Navigate to `http://localhost:3000/login`:
- **Email:** `admin@landvest.com`
- **Password:** `password123`

*(You can trigger a database re-seed anytime using the "Seed Demo Data" button on the Dashboard or calling `POST /api/auth/seed`)*

---

## 5. Core Business Modules & Logic

### Module 1: Admin Financial Dashboard
- **Top Statistics Cards:**
  1. Total Land Value (₹)
  2. Total Customer Investments (₹)
  3. Total Active Customers
  4. Total Active Lands
  5. Today's Accrued Returns (₹)
  6. Total Returns Paid (₹)
  7. Pending Withdrawals (₹)
  8. Available Investment Capacity (₹)
- **Financial Analytics Charts:**
  1. *Investment Growth Trend:* 12-month area chart of cumulative customer investments
  2. *Monthly Returns Chart:* Bar chart of distributed lease yields
  3. *Land-wise Investment Distribution:* Donut chart of property allocations
  4. *Customer Investment Distribution:* Top investor capital breakdown
- **Live Action Feeds:** Latest investments and pending withdrawal review shortcuts.

### Module 2: Land Management
- Survey Number validation with uniqueness constraints.
- Total Land Value vs Available Investment Amount live capacity tracking.
- Automatic status update to **Fully Funded** when subscription reaches 100%.
- Safety deletion restrictions: Prevents accidental deletion of lands with active investors.
- Detailed view with allocated investor ledger and legal document attachments.

### Module 3: Customer & Investor Directory
- Auto-generated sequential Customer IDs (`CUST-10001`, etc.).
- Comprehensive KYC status management (`pending`, `verified`, `rejected`).
- Bank details (Account Holder, Account Number, IFSC, Bank Name) and instant UPI settlement ID.
- Tabbed portfolio ledger displaying Customer Investments, Transactions, Daily Returns, and Withdrawals.

### Module 4: Investment Management & Allocation Logic
- Pre-validation checks: Customer active status and land available investment capacity.
- Automatic allocation calculation:
  $$\text{Ownership Share} = \left(\frac{\text{Investment Amount}}{\text{Total Land Value}}\right) \times 100$$
  $$\text{Daily Accrued Return} = \frac{\text{Investment Amount} \times \text{Daily Return Rate}}{100}$$
  $$\text{Monthly Accrued Return} = \text{Daily Accrued Return} \times 30$$
  $$\text{Projected Maturity Amount} = \text{Investment Amount} + (\text{Monthly Return} \times \text{Duration Months})$$
- Live real-time projection summary preview during contract creation.
- Immediate rollback & land capacity restoration upon investment cancellation.

### Module 5: UPI & Manual Money Transfer Verification
- Manual transaction recording for offline payments (UPI, NEFT, RTGS, Cheque).
- **Anti-Duplicate Fraud Prevention:** Strict database-level uniqueness checks on payment references / UTR numbers to prevent duplicate credit entries.
- Verification status lifecycle: `Pending` → `Verified` → `Completed` (or `Rejected`).
- Full audit logging of administrator verification decisions.

### Module 6: Daily Returns Calculation Engine
- Dedicated return calculation batch runner for specified dates and land assets.
- Safety separation of states:
  - **Accrued:** Yield calculated according to active contracts; not credited to customer balances.
  - **Verified:** Administrative check against actual bank lease income receipts.
  - **Paid:** Disbursed to customer accounts and recorded as ledger settlements.
- Duplicate accrual prevention: Automatically skips investments already calculated for the selected date.

### Module 7: Withdrawal Management
- Customer withdrawal request queue with available balance validation against verified/paid returns.
- Prevents requests exceeding eligible balance.
- Multi-step admin approval workflow (`Pending` → `Approved` → `Paid` with UTR entry or `Rejected` with reason).
- Automatic creation of matching withdrawal transaction records upon disbursement.

### Module 8: Audited Reports & Analytics Export
- 6 comprehensive report formats:
  1. *Land Investment Report*
  2. *Customer Investment Portfolio*
  3. *Daily Returns Ledger*
  4. *Transactions & UTR Report*
  5. *Customer Withdrawals Report*
  6. *Outstanding Liability & Risk Report*
- Multi-parameter filtering by Date Range, Land Property, and Customer.
- 1-click **Excel Export** (`.xlsx`) via SheetJS and **Printable PDF** view.

---

## 6. Security & Audit Trail

- **JWT Session Security:** Protected API routes using `withAuth` and `verifyToken` wrappers.
- **Password Protection:** Bcrypt hashing with 12 salt rounds; passwords excluded by default from queries (`select: false`).
- **Audit Logging:** Every critical administrative action (`SYSTEM_SEEDED`, `LAND_CREATED`, `INVESTMENT_CREATED`, `TRANSACTION_RECORDED`, `DAILY_RETURNS_CALCULATED`, `WITHDRAWAL_STATUS_UPDATED`) is recorded in the `AuditLog` collection with timestamp, administrator ID, action, and JSON details.
- **Server-Side Input Sanitization:** Zod schema validation on every API endpoint before executing database queries.
