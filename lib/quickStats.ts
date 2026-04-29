import { Transaction } from './types';
import { INCOME_CATEGORIES } from './categories';

export interface QuickStats {
  todaySpent: number;
  leftThisMonth: number;
  safePerDay: number;
  daysLeft: number;
  monthSpent: number;
  monthIncome: number;
  hasIncomeData: boolean;
}

export function getQuickStats(transactions: Transaction[]): QuickStats {
  const now        = new Date();
  const todayStr   = now.toISOString().slice(0, 10);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft   = Math.max(1, daysInMonth - now.getDate());

  const expenses = (t: Transaction) => t.amount < 0 && !INCOME_CATEGORIES.has(t.category);
  const income   = (t: Transaction) => t.amount > 0 && (t.category === 'income' || !INCOME_CATEGORIES.has(t.category));

  // Today
  const todaySpent = transactions
    .filter(t => expenses(t) && t.date.startsWith(todayStr))
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  // This month
  const monthSpent = transactions
    .filter(t => expenses(t) && new Date(t.date) >= monthStart)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const monthIncome = transactions
    .filter(t => income(t) && new Date(t.date) >= monthStart)
    .reduce((s, t) => s + t.amount, 0);

  // Fallback: use average from past 3 months as estimated income
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const pastIncome = transactions
    .filter(t => income(t) && new Date(t.date) >= threeMonthsAgo && new Date(t.date) < monthStart)
    .reduce((s, t) => s + t.amount, 0);
  const avgMonthlyIncome = pastIncome / 3;

  const effectiveIncome = monthIncome > 0 ? monthIncome : avgMonthlyIncome;
  const hasIncomeData   = effectiveIncome > 0;
  const leftThisMonth   = Math.max(0, effectiveIncome - monthSpent);
  const safePerDay      = hasIncomeData ? leftThisMonth / daysLeft : 0;

  return { todaySpent, leftThisMonth, safePerDay, daysLeft, monthSpent, monthIncome: effectiveIncome, hasIncomeData };
}
