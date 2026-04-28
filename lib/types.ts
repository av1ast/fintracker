export interface Transaction {
  id: string;
  date: string; // ISO string
  name: string;
  category: string;
  amount: number; // negative = expense, positive = income
  currency: string;
  notes?: string;
  type?: string;
}

export interface CategoryConfig {
  displayName: string;
  color: string;
  emoji: string;
}

export interface CategorySummary {
  category: string;
  displayName: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
  emoji: string;
}

export interface MonthlyData {
  month: string;   // "2024-01"
  label: string;   // "Jan 24"
  spent: number;
  income: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  potential: number;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  icon: string;
}

export interface FinancialData {
  transactions: Transaction[];
  categories: CategorySummary[];
  monthly: MonthlyData[];
  totalSpent: number;
  totalIncome: number;
  netSavings: number;
  savingsRate: number;
  avgMonthlySpend: number;
  recommendations: Recommendation[];
}
