'use client';

import { useState, useMemo, useCallback } from 'react';
import { FinancialData, Transaction } from '@/lib/types';
import { buildFinancialData } from '@/lib/parseTransactions';
import { StatsCards }          from './StatsCards';
import { SpendingDonut }       from './SpendingDonut';
import { MonthlyChart }        from './MonthlyChart';
import { CategoryBreakdown }   from './CategoryBreakdown';
import { Recommendations }     from './Recommendations';
import { TransactionList }     from './TransactionList';
import { QuickStats }          from './QuickStats';
import { ImpulseScore }        from './ImpulseScore';
import { PaycheckEfficiency }  from './PaycheckEfficiency';
import { usePullToRefresh }    from '@/hooks/usePullToRefresh';
import { RefreshCw, Lock }     from 'lucide-react';

type Period = '30' | '90' | '180' | 'all';
const PERIOD_LABELS: Record<Period, string> = {
  '30': '30d', '90': '3m', '180': '6m', 'all': 'All',
};

function filterByPeriod(transactions: Transaction[], period: Period): Transaction[] {
  if (period === 'all') return transactions;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(period));
  return transactions.filter(t => new Date(t.date) >= cutoff);
}

interface Props {
  initialData: FinancialData;
  initialUpdated: string;
}

export function Dashboard({ initialData, initialUpdated }: Props) {
  const [data, setData]           = useState(initialData);
  const [lastUpdated, setLastUpdated] = useState(initialUpdated);
  const [period, setPeriod]       = useState<Period>('all');

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) return;
      setData(await res.json());
      setLastUpdated(new Date().toISOString());
    } catch { /* silent */ }
  }, []);

  const { isPulling, isRefreshing, progress } = usePullToRefresh(refresh);

  const filtered: FinancialData = useMemo(() => {
    if (period === 'all') return data;
    return buildFinancialData(filterByPeriod(data.transactions, period));
  }, [data, period]);

  const currency = data.transactions[0]?.currency ?? 'GBP';

  const lastUpdatedFmt = new Date(lastUpdated).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Pull-to-refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: isRefreshing ? 48 : `${progress * 48}px`, opacity: isPulling || isRefreshing ? 1 : 0 }}
      >
        <RefreshCw
          size={20}
          className={`text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${progress * 360}deg)` }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-[#1e1e30] bg-[#0d0d14]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold gradient-text">FinTracker</h1>
            <p className="text-xs text-muted mt-0.5 hidden sm:block">Monzo · Google Sheets</p>
          </div>

          {/* Period filter */}
          <div className="flex items-center gap-1 bg-[#14141f] border border-[#1e1e30] rounded-xl p-1">
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === p ? 'bg-indigo-600 text-white shadow' : 'text-muted hover:text-white'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-muted">{lastUpdatedFmt}</span>
            <button
              onClick={refresh}
              title="Refresh"
              className="text-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#1e1e30]"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={async () => { await fetch('/api/logout', { method: 'POST' }); window.location.href = '/login'; }}
              title="Lock"
              className="text-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#1e1e30]"
            >
              <Lock size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Quick stats — always current month, ignores period filter */}
        <QuickStats transactions={data.transactions} currency={currency} />

        {/* Period stats */}
        <StatsCards
          totalIncome={filtered.totalIncome}
          totalSpent={filtered.totalSpent}
          netSavings={filtered.netSavings}
          savingsRate={filtered.savingsRate}
          currency={currency}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SpendingDonut categories={filtered.categories} currency={currency} />
          <MonthlyChart  monthly={filtered.monthly}      currency={currency} />
        </div>

        {/* Impulse + Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ImpulseScore      transactions={filtered.transactions} currency={currency} />
          <PaycheckEfficiency data={filtered}                    currency={currency} />
        </div>

        {/* Recommendations */}
        <Recommendations recommendations={filtered.recommendations} currency={currency} />

        {/* Category + Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2">
            <CategoryBreakdown categories={filtered.categories} currency={currency} />
          </div>
          <div className="lg:col-span-3">
            <TransactionList transactions={filtered.transactions} currency={currency} />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted py-6 border-t border-[#1e1e30]">
        FinTracker — pull down to refresh on mobile
      </footer>
    </div>
  );
}
