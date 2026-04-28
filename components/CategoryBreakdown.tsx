'use client';

import { CategorySummary } from '@/lib/types';

interface Props {
  categories: CategorySummary[];
  currency: string;
}

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(n);
}

export function CategoryBreakdown({ categories, currency }: Props) {
  if (!categories.length) return null;

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-white mb-5">Category Breakdown</h2>
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.category}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{cat.emoji}</span>
                <span className="text-sm font-medium text-slate-200">{cat.displayName}</span>
                <span className="text-xs text-muted">×{cat.count}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-white">{fmt(cat.total, currency)}</span>
                <span className="text-xs text-muted ml-2">{cat.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-[#1e1e30] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full animate-progress"
                style={{
                  width: `${cat.percentage}%`,
                  background: cat.color,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
