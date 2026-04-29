'use client';

import { useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { calcImpulseScore } from '@/lib/impulseScore';

interface Props { transactions: Transaction[]; currency: string; }

function fmt(n: number, c: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);
}

export function ImpulseScore({ transactions, currency }: Props) {
  const r = useMemo(() => calcImpulseScore(transactions), [transactions]);

  const radius = 36;
  const circ   = 2 * Math.PI * radius;
  const filled = circ * (1 - r.score / 10);

  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-white">Impulse Buy Score</h2>

      <div className="flex items-center gap-5">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0 w-24 h-24">
          <svg width="96" height="96" className="-rotate-90">
            <circle cx="48" cy="48" r={radius} fill="none" stroke="#1e1e30" strokeWidth="8" />
            <circle
              cx="48" cy="48" r={radius}
              fill="none"
              stroke={r.color}
              strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={filled}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{r.score.toFixed(1)}</span>
            <span className="text-[10px] text-muted">/10</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold mb-1" style={{ color: r.color }}>{r.label}</p>
          <p className="text-sm text-slate-300">
            {r.count} impulse purchase{r.count !== 1 ? 's' : ''} totalling{' '}
            <span className="text-white font-medium">{fmt(r.totalSpent, currency)}</span>
          </p>
          {r.examples.length > 0 && (
            <p className="text-xs text-muted mt-2 truncate">
              e.g. {r.examples.join(', ')}
            </p>
          )}
        </div>
      </div>

      <div className="text-xs text-muted leading-relaxed border-t border-[#1e1e30] pt-3">
        Counts purchases under £50 in shopping, entertainment, eating out &amp; gaming.
        Lower is better.
      </div>
    </div>
  );
}
