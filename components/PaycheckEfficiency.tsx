'use client';

import { useMemo } from 'react';
import { FinancialData } from '@/lib/types';

interface Props { data: FinancialData; currency: string; }

const ESSENTIAL   = new Set(['groceries', 'bills', 'health', 'transport', 'personal_care']);
const LIFESTYLE   = new Set(['eating_out', 'shopping', 'entertainment', 'games', 'holidays']);
const SAVINGS_CAT = new Set(['pot_transfer', 'savings']);

function fmt(n: number, c: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);
}

export function PaycheckEfficiency({ data, currency }: Props) {
  const breakdown = useMemo(() => {
    const { categories, totalIncome, netSavings } = data;
    if (totalIncome <= 0) return null;

    const essentials  = categories.filter(c => ESSENTIAL.has(c.category)).reduce((s, c) => s + c.total, 0);
    const lifestyle   = categories.filter(c => LIFESTYLE.has(c.category)).reduce((s, c) => s + c.total, 0);
    const savingsCat  = categories.filter(c => SAVINGS_CAT.has(c.category)).reduce((s, c) => s + c.total, 0);
    const totalSavings = Math.max(0, netSavings) + savingsCat;
    const other       = Math.max(0, data.totalSpent - essentials - lifestyle - savingsCat);

    const pct = (n: number) => Math.round((n / totalIncome) * 100);

    const score = Math.round(((essentials + totalSavings) / totalIncome) * 100);
    const label = score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : score >= 35 ? 'Fair' : 'Needs work';
    const labelColor = score >= 70 ? '#10b981' : score >= 50 ? '#6366f1' : score >= 35 ? '#f59e0b' : '#ef4444';

    return {
      essentials, lifestyle, totalSavings, other,
      pctEssentials: pct(essentials),
      pctLifestyle:  pct(lifestyle),
      pctSavings:    pct(totalSavings),
      pctOther:      pct(other),
      score, label, labelColor,
    };
  }, [data]);

  if (!breakdown) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-40">
        <p className="text-muted text-sm">No income data to calculate efficiency</p>
      </div>
    );
  }

  const b = breakdown;
  const segments = [
    { label: 'Essentials', pct: b.pctEssentials, color: '#10b981', value: b.essentials },
    { label: 'Lifestyle',  pct: b.pctLifestyle,  color: '#f59e0b', value: b.lifestyle  },
    { label: 'Savings',    pct: b.pctSavings,    color: '#6366f1', value: b.totalSavings },
    { label: 'Other',      pct: b.pctOther,      color: '#6b7280', value: b.other       },
  ].filter(s => s.pct > 0);

  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Paycheck Efficiency</h2>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: b.labelColor }}>{b.score}%</p>
          <p className="text-xs" style={{ color: b.labelColor }}>{b.label}</p>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="h-4 rounded-full overflow-hidden flex gap-0.5">
        {segments.map(seg => (
          <div
            key={seg.label}
            className="h-full rounded-sm transition-all duration-700"
            style={{ width: `${seg.pct}%`, background: seg.color }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
            <div className="min-w-0">
              <p className="text-xs text-muted">{seg.label} <span className="text-slate-400">{seg.pct}%</span></p>
              <p className="text-xs text-white font-medium">{fmt(seg.value, currency)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
