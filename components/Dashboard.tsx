'use client';

import { useState, useMemo } from 'react';
import { FinancialData, Transaction } from '@/lib/types';
import { buildFinancialData } from '@/lib/parseTransactions';
import { StatsCards } from './StatsCards';
import { SpendingDonut } from './SpendingDonut';
import { MonthlyChart } from './MonthlyChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { Recommendations } from './Recommendations';
import { TransactionList } from './TransactionList';
import { RefreshCw } from 'lucide-react';

type Period = '30' | '90' | '180' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  '30': '30 days',
  '90': '3 months',
  '180': '6 months',
  'all': 'All time',
};

function filterByPeriod(transactions: Transaction[], period: Period): Transaction[] {
  if (period === 'all') return transactions;
  const days = parseInt(period);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return transactions.filter(t => new Date(t.date) >= cutoff);
}

interface Props {
  data: FinancialData;
  lastUpdated: string;
}

export function Dashboard({ data, lastUpdated }: Props) {
  const [period, setPeriod] = useState<Period>('all');

  const filtered: FinancialData = useMemo(() => {
    if (period === 'all') return data;
    const txs = filterByPeriod(data.transactions, period);
    return buildFinancialData(txs);
  }, [data, period]);

  const currency = data.transactions[0]?.currency ?? 'GBP';

  const lastUpdatedFmt = new Date(lastUpdated).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="border-b border-[#1e1e30] bg-[#0d0d14]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold gradient-text">FinTracker</h1>
            <p className="text-xs text-muted mt-0.5">Monzo · Google Sheets</p>
          </div>

          {/* Period filter — select on small, pills on large */}
          <div className="flex items-center gap-2">
            <select
              className="sm:hidden bg-[#14141f] border border-[#1e1e30] text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
              value={period}
              onChange={e => setPeriod(e.target.value as Period)}
            >
              {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
              ))}
            </select>
            <div className="hidden sm:flex items-center gap-1 bg-[#14141f] border border-[#1e1e30] rounded-xl p-1">
              {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    period === p
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted">
            <RefreshCw size={12} />
            <span>Updated {lastUpdatedFmt}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <StatsCards
          totalIncome={filtered.totalIncome}
          totalSpent={filtered.totalSpent}
          netSavings={filtered.netSavings}
          savingsRate={filtered.savingsRate}
          currency={currency}
        />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingDonut categories={filtered.categories} currency={currency} />
          <MonthlyChart monthly={filtered.monthly} currency={currency} />
        </div>

        {/* Recommendations */}
        <Recommendations recommendations={filtered.recommendations} currency={currency} />

        {/* Category breakdown + transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <CategoryBreakdown categories={filtered.categories} currency={currency} />
          </div>
          <div className="lg:col-span-3">
            <TransactionList transactions={filtered.transactions} currency={currency} />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted py-6 border-t border-[#1e1e30]">
        FinTracker — your personal Monzo dashboard
      </footer>
    </div>
  );
}
