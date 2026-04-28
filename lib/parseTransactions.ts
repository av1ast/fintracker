import Papa from 'papaparse';
import { Transaction, CategorySummary, MonthlyData, FinancialData } from './types';
import { getCategoryConfig, INCOME_CATEGORIES } from './categories';
import { generateRecommendations } from './recommendations';

function parseMonzoDate(raw: string): string {
  if (!raw) return new Date().toISOString();
  // DD/MM/YYYY
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]).toISOString();
  // Try native parse
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function normaliseHeader(h: string): string {
  return h.toLowerCase().trim().replace(/\s+/g, '_');
}

function findCol(headers: string[], ...candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.findIndex(h => h.includes(c));
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseCSV(csvText: string): FinancialData {
  const result = Papa.parse<string[]>(csvText.trim(), {
    skipEmptyLines: true,
  });

  const rows = result.data as string[][];
  if (rows.length < 2) return emptyData();

  const rawHeaders = rows[0].map(normaliseHeader);

  const colDate     = findCol(rawHeaders, 'date');
  const colName     = findCol(rawHeaders, 'name', 'description', 'merchant');
  const colCategory = findCol(rawHeaders, 'category');
  const colAmount   = findCol(rawHeaders, 'amount');
  const colCurrency = findCol(rawHeaders, 'currency');
  const colNotes    = findCol(rawHeaders, 'notes');
  const colMoneyOut = findCol(rawHeaders, 'money_out');
  const colMoneyIn  = findCol(rawHeaders, 'money_in');
  const colId       = findCol(rawHeaders, 'transaction_id', 'id');

  const transactions: Transaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every(c => !c)) continue;

    const rawAmount = row[colAmount] ?? '';
    const rawOut = colMoneyOut !== -1 ? row[colMoneyOut] : '';
    const rawIn  = colMoneyIn  !== -1 ? row[colMoneyIn]  : '';

    let amount = parseFloat(rawAmount.replace(/[^0-9.\-]/g, '')) || 0;
    // Fall back to money_out / money_in columns
    if (amount === 0 && (rawOut || rawIn)) {
      const out = parseFloat((rawOut ?? '').replace(/[^0-9.]/g, '')) || 0;
      const inc = parseFloat((rawIn  ?? '').replace(/[^0-9.]/g, '')) || 0;
      amount = inc > 0 ? inc : -out;
    }

    const category = (row[colCategory] ?? 'general').toLowerCase().trim() || 'general';
    const dateRaw  = row[colDate] ?? '';
    const name     = row[colName] ?? 'Unknown';
    const currency = row[colCurrency] ?? 'GBP';
    const notes    = colNotes !== -1 ? row[colNotes] : undefined;
    const id       = colId !== -1 ? row[colId] : `tx-${i}`;

    if (!dateRaw || amount === 0) continue;

    transactions.push({
      id,
      date: parseMonzoDate(dateRaw),
      name: name.trim(),
      category,
      amount,
      currency,
      notes,
    });
  }

  return buildFinancialData(transactions);
}

export function buildFinancialData(transactions: Transaction[]): FinancialData {
  if (!transactions.length) return emptyData();

  // Separate income vs expenses
  const expenses = transactions.filter(
    t => t.amount < 0 && !INCOME_CATEGORIES.has(t.category)
  );
  const income = transactions.filter(
    t => t.amount > 0 && !INCOME_CATEGORIES.has(t.category)
  );
  // Also count explicit income category as income
  const explicitIncome = transactions.filter(t => t.category === 'income' && t.amount > 0);
  const allIncome = [...income, ...explicitIncome];

  const totalSpent  = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIncome = allIncome.reduce((s, t) => s + t.amount, 0);
  const netSavings  = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  // Categories (expense only)
  const catMap = new Map<string, { total: number; count: number }>();
  for (const t of expenses) {
    const existing = catMap.get(t.category) ?? { total: 0, count: 0 };
    catMap.set(t.category, { total: existing.total + Math.abs(t.amount), count: existing.count + 1 });
  }

  const categories: CategorySummary[] = Array.from(catMap.entries())
    .map(([cat, { total, count }]) => {
      const cfg = getCategoryConfig(cat);
      return {
        category: cat,
        displayName: cfg.displayName,
        total,
        count,
        percentage: totalSpent > 0 ? (total / totalSpent) * 100 : 0,
        color: cfg.color,
        emoji: cfg.emoji,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Monthly data
  const monthMap = new Map<string, { spent: number; income: number }>();
  for (const t of expenses) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const existing = monthMap.get(key) ?? { spent: 0, income: 0 };
    monthMap.set(key, { spent: existing.spent + Math.abs(t.amount), income: existing.income });
  }
  for (const t of allIncome) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const existing = monthMap.get(key) ?? { spent: 0, income: 0 };
    monthMap.set(key, { spent: existing.spent, income: existing.income + t.amount });
  }

  const monthly: MonthlyData[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { spent, income }]) => {
      const [y, m] = month.split('-');
      const label = new Date(+y, +m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      return { month, label, spent, income };
    });

  const avgMonthlySpend = monthly.length > 0
    ? monthly.reduce((s, m) => s + m.spent, 0) / monthly.length
    : 0;

  const recommendations = generateRecommendations(categories, totalSpent, totalIncome, savingsRate, transactions);

  return {
    transactions,
    categories,
    monthly,
    totalSpent,
    totalIncome,
    netSavings,
    savingsRate,
    avgMonthlySpend,
    recommendations,
  };
}

function emptyData(): FinancialData {
  return {
    transactions: [],
    categories: [],
    monthly: [],
    totalSpent: 0,
    totalIncome: 0,
    netSavings: 0,
    savingsRate: 0,
    avgMonthlySpend: 0,
    recommendations: [],
  };
}
