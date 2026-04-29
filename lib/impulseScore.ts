import { Transaction } from './types';

const IMPULSE_CATEGORIES = new Set(['shopping', 'entertainment', 'eating_out', 'games', 'holidays']);
const IMPULSE_THRESHOLD  = 50; // £50 and under = potential impulse

export interface ImpulseResult {
  score: number;       // 0-10
  count: number;
  totalSpent: number;
  examples: string[];
  label: 'Disciplined' | 'Moderate' | 'Impulsive';
  color: string;
}

export function calcImpulseScore(transactions: Transaction[]): ImpulseResult {
  const expenses = transactions.filter(t => t.amount < 0);
  if (!expenses.length) return { score: 0, count: 0, totalSpent: 0, examples: [], label: 'Disciplined', color: '#10b981' };

  const impulse = expenses.filter(t =>
    IMPULSE_CATEGORIES.has(t.category) && Math.abs(t.amount) <= IMPULSE_THRESHOLD
  );

  // Frequency penalty: days with 3+ impulse purchases
  const byDay = new Map<string, number>();
  for (const t of impulse) {
    const day = t.date.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const heavyDays = Array.from(byDay.values()).filter(v => v >= 3).length;

  const ratio     = impulse.length / expenses.length;
  const raw       = ratio * 8 + heavyDays * 0.4;
  const score     = Math.min(10, Math.round(raw * 10) / 10);
  const totalSpent = impulse.reduce((s, t) => s + Math.abs(t.amount), 0);

  const uniqueNames = Array.from(new Set(impulse.map(t => t.name))).slice(0, 3);

  const label: ImpulseResult['label'] = score <= 3 ? 'Disciplined' : score <= 6 ? 'Moderate' : 'Impulsive';
  const color = score <= 3 ? '#10b981' : score <= 6 ? '#f59e0b' : '#ef4444';

  return { score, count: impulse.length, totalSpent, examples: uniqueNames, label, color };
}
