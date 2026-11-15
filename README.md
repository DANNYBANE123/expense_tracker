# ApexFinance — Personal Expense Tracker

> **B.Tech Computer Science Major Project** | Full-Stack Fintech SaaS Web Application

A production-quality personal expense tracker built with the **Next.js 16 App Router**, **MongoDB + Mongoose**, **Auth.js v5**, **Tailwind CSS v4**, and **Recharts** — deployed as a single unified monorepo with zero separate backend.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MongoDB (Mongoose ODM) |
| Auth | Auth.js v5 (NextAuth beta) with Credentials provider |
| Validation | Zod + React Hook Form |
| Charts | Recharts 2 |
| Icons | Lucide React |
| Notifications | Sonner |
| Theme | next-themes (dark/light) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Login page with one-click demo
│   │   └── register/page.tsx      # Registration page
│   ├── dashboard/
│   │   ├── layout.tsx             # Auth-protected dashboard shell
│   │   ├── page.tsx               # Main dashboard overview
│   │   ├── transactions/page.tsx  # Transactions CRUD with filters
│   │   ├── budgets/page.tsx       # Budget management
│   │   ├── analytics/page.tsx     # Analytics & CSV export
│   │   ├── categories/page.tsx    # Category management
│   │   └── recurring/page.tsx     # Recurring schedules
│   ├── api/
│   │   ├── auth/[...nextauth]/    # Auth.js JWT handlers
│   │   ├── register/              # POST: User registration
│   │   ├── transactions/          # GET/POST, GET/PUT/DELETE [id]
│   │   ├── budgets/               # GET/POST, PUT/DELETE [id]
│   │   ├── categories/            # GET/POST, PUT/DELETE [id]
│   │   ├── recurring/             # GET/POST, PUT/DELETE, /process
│   │   ├── analytics/             # GET: Dashboard stats + insights
│   │   ├── export/                # GET: CSV export with filters
│   │   └── seed/                  # POST: Demo data seeder
│   ├── layout.tsx
│   ├── page.tsx                   # Public landing page
│   └── globals.css
├── components/
│   ├── ui/                        # Button, Card, Input, Badge, etc.
│   ├── dashboard/                 # Stat cards, charts, insights
│   ├── transactions/              # Table, filters, modal
│   ├── budgets/                   # Budget card + modal
│   ├── categories/                # Category modal
│   └── recurring/                 # Recurring modal
├── lib/
│   ├── auth/auth.ts               # NextAuth config + JWT callbacks
│   ├── auth/session.ts            # Server-side session helpers
│   ├── db/mongodb.ts              # Mongoose connection with caching
│   ├── validations/               # Zod schemas
│   ├── services/                  # Analytics, Insights, Recurring
│   └── utils/                     # cn(), currency helpers
├── models/
│   ├── User.ts
│   ├── Transaction.ts
│   ├── Category.ts
│   ├── Budget.ts
│   └── RecurringTransaction.ts
└── types/index.ts
```

---

## ✨ Features

### 🔐 Authentication
- Secure bcrypt-hashed passwords (12 salt rounds)
- JWT session management via Auth.js v5
- Protected dashboard routes (server-side session check)
- Auto-seed default categories on first registration
- One-click **Demo Login** with realistic sample data

### 📊 Dashboard Overview
- Total balance, income, expenses, monthly savings
- Month-over-month growth indicators (%)
- Income vs Expense bar chart (6-month trend)
- Category-wise spending donut chart
- Monthly spending velocity area chart
- Smart Financial Intelligence panel
- Recent transactions feed

### 💳 Transaction Management
- Full CRUD with server-side ownership verification
- Search (description + category), type filter, category filter, date range
- Sort by date or amount (asc/desc)
- Paginated results (15 per page)
- Payment method tracking (UPI, credit/debit card, bank transfer, cash)
- CSV export with custom date range filters

### 🎯 Budget System
- Overall monthly budgets OR category-specific budgets
- Configurable alert thresholds (default 80%)
- Live spending calculation per budget
- Visual progress bars with color-coded status
- Exceeded (red) / Warning (amber) / On Track (green) indicators

### 🏷️ Categories
- 10 default expense categories (Food, Rent, Bills, Entertainment…)
- 6 default income categories (Salary, Freelancing, Investments…)
- Custom category creation with color picker
- Delete-protection if category has transactions

### 🔁 Recurring Transactions
- Daily / Weekly / Monthly / Yearly cadences
- Start date + optional end date
- Duplicate prevention (checks for same recurring ID on same day)
- Auto-processes when dashboard or recurring page loads
- Manual "Process Due Now" sync button

### 🧠 Smart Financial Insights
- All rule-based, computed from real MongoDB data
- Highest spending category detection
- Month-over-month surge alerts (>20% increase)
- Budget 80% and 100% threshold alerts
- Savings rate analysis and growth detection
- Never hardcoded

### 📈 Analytics & Reports
- Month-over-month income and expense comparison
- Category breakdown pie chart
- Spending velocity area chart
- Custom date range CSV export for audit/tax

---

## 🛠 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Steps

```bash
# 1. Clone the project
git clone <repo-url>
cd expense

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Edit .env.local with your credentials
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
AUTH_SECRET=<generate-with: openssl rand -hex 32>
NEXTAUTH_URL=http://localhost:3000

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Account
Click **"Quick Demo Login"** on the sign-in page. It will:
1. Auto-register a demo user
2. Load realistic sample transactions, budgets, and recurring schedules
3. Redirect to dashboard immediately

---

## 💾 MongoDB Data Architecture

| Collection | Purpose |
|---|---|
| `users` | User accounts with bcrypt-hashed passwords |
| `transactions` | All income/expense ledger entries in integer paise |
| `categories` | Per-user income/expense categories with colors |
| `budgets` | Monthly budgets scoped by category or overall |
| `recurringtransactions` | Automated cadence schedules |

**Important**: All monetary amounts are stored as **integer paise** (₹1 = 100 paise) to avoid IEEE-754 floating point inaccuracies.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register new user |
| POST | `/api/auth/[...nextauth]` | Auth.js sign-in/out |
| GET/POST | `/api/transactions` | List/create transactions |
| GET/PUT/DELETE | `/api/transactions/[id]` | Single transaction CRUD |
| GET/POST | `/api/budgets` | List/create budgets |
| PUT/DELETE | `/api/budgets/[id]` | Update/delete budget |
| GET/POST | `/api/categories` | List/create categories |
| PUT/DELETE | `/api/categories/[id]` | Update/delete category |
| GET/POST | `/api/recurring` | List/create recurring schedules |
| PUT/DELETE | `/api/recurring/[id]` | Update/delete schedule |
| POST | `/api/recurring/process` | Manually process due schedules |
| GET | `/api/analytics` | Dashboard stats + smart insights |
| GET | `/api/export` | CSV export (with filters) |
| POST | `/api/seed` | Load demo data for current user |

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `MONGODB_URI` → MongoDB Atlas connection string
- `AUTH_SECRET` → Random 32-byte hex string
- `NEXTAUTH_URL` → Your Vercel deployment URL

### Railway / Render
Same environment variables. Use `npm run build && npm start`.

---

## 📝 Notes for Evaluators

- **Zero mock data**: All charts, stats, and insights are computed from live MongoDB aggregation pipelines
- **Security**: Every API route verifies the session and enforces `userId` ownership on all DB queries
- **Paise precision**: `rupeesToPaise()` converts user input, `paiseToRupees()` converts for display
- **Demo workflow**: Register → Click "Load Demo Data" header button (or use one-click demo login)

---

**Built with ❤️ for B.Tech CS Major Project Evaluation**
