'use client';

import { Transaction } from '@/lib/types';
import { getQuickStats } from '@/lib/quickStats';
import { useMemo } from 'react';
import { CalendarDays, ShieldCheck, Wallet } from 'lucide-react';

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

interface Props { transactions: Transaction[]; currency: string; }

export function QuickStats({ transactions, currency }: Props) {
  const s = useMemo(() => getQuickStats(transactions), [transactions]);

  const safeColor = s.safePerDay > 20 ? 'text-emerald-400' : s.safePerDay > 0 ? 'text-amber-400' : 'text-rose-400';
  const leftColor = s.leftThisMonth > 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="grid grid-cols-3 gap-3">

      {/* Today spent */}
      <div className="glass-card hover-glow p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs font-medium">Today</span>
          <CalendarDays size={15} className="text-rose-400 opacity-70" />
        </div>
        <p className="text-xl font-bold text-rose-400">{fmt(s.todaySpent, currency)}</p>
        <p className="text-xs text-muted">spent so far</p>
      </div>

      {/* Left this month */}
      <div className="glass-card hover-glow p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs font-medium">This Month</span>
          <Wallet size={15} className="text-indigo-400 opacity-70" />
        </div>
        {s.hasIncomeData ? (
          <>
            <p className={`text-xl font-bold ${leftColor}`}>{fmt(s.leftThisMonth, currency)}</p>
            <p className="text-xs text-muted">remaining</p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-rose-400">{fmt(s.monthSpent, currency)}</p>
            <p className="text-xs text-muted">spent this month</p>
          </>
        )}
      </div>

      {/* Safe to spend */}
      <div className="glass-card hover-glow p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs font-medium">Safe/day</span>
          <ShieldCheck size={15} className="text-violet-400 opacity-70" />
        </div>
        {s.hasIncomeData ? (
          <>
            <p className={`text-xl font-bold ${safeColor}`}>{fmt(s.safePerDay, currency)}</p>
            <p className="text-xs text-muted">{s.daysLeft}d left</p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-muted">—</p>
            <p className="text-xs text-muted">no income data</p>
          </>
        )}
      </div>

    </div>
  );
}
