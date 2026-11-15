export type TransactionType = "income" | "expense";

export type PaymentMethod =
  | "cash"
  | "upi"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "net_banking"
  | "other";

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  currency?: string;
  defaultMonthlyBudget?: number; // in paise
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICategory {
  _id: string;
  userId: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ITransaction {
  _id: string;
  userId: string;
  amount: number; // in paise
  type: TransactionType;
  categoryId: string | ICategory;
  categoryName: string;
  description: string;
  date: string | Date;
  paymentMethod: PaymentMethod;
  recurringTransactionId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IBudget {
  _id: string;
  userId: string;
  categoryId?: string | ICategory; // null or undefined for overall monthly budget
  categoryName: string;
  amount: number; // in paise
  month: number; // 1 - 12
  year: number;
  alertThreshold: number; // percentage, default 80
  spent?: number; // populated in runtime/service in paise
  percentageUsed?: number;
  remaining?: number; // in paise
  status?: "normal" | "warning" | "exceeded";
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IRecurringTransaction {
  _id: string;
  userId: string;
  amount: number; // in paise
  type: TransactionType;
  categoryId: string | ICategory;
  categoryName: string;
  description: string;
  paymentMethod: PaymentMethod;
  frequency: RecurringFrequency;
  startDate: string | Date;
  endDate?: string | Date;
  nextExecutionDate: string | Date;
  lastExecutedDate?: string | Date;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IFinancialInsight {
  id: string;
  type: "positive" | "warning" | "danger" | "info";
  title: string;
  message: string;
  metric?: string;
  icon?: string;
}

export interface IDashboardStats {
  totalBalance: number; // in paise
  totalIncome: number; // in paise
  totalExpenses: number; // in paise
  monthlySavings: number; // in paise
  savingsRate: number; // percentage 0-100
  monthOverMonthExpenseGrowth: number; // percentage
  monthOverMonthIncomeGrowth: number; // percentage
  insights: IFinancialInsight[];
  recentTransactions: ITransaction[];
  monthlyTrend: Array<{
    month: string;
    income: number; // in paise
    expense: number; // in paise
    savings: number; // in paise
  }>;
  categorySpending: Array<{
    name: string;
    amount: number; // in paise
    color: string;
    percentage: number;
  }>;
}
