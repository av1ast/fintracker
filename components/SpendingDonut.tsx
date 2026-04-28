'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CategorySummary } from '@/lib/types';

interface Props {
  categories: CategorySummary[];
  currency: string;
}

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(n);
}

interface TooltipPayload {
  payload?: { displayName: string; total: number; percentage: number; emoji: string };
}

function CustomTooltip({ active, payload, currency }: { active?: boolean; payload?: TooltipPayload[]; currency: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="glass-card p-3 text-sm shadow-xl">
      <p className="font-semibold text-white">{d.emoji} {d.displayName}</p>
      <p className="text-muted">{fmt(d.total, currency)}</p>
      <p className="text-indigo-400">{d.percentage.toFixed(1)}%</p>
    </div>
  );
}

export function SpendingDonut({ categories, currency }: Props) {
  const top = categories.slice(0, 8);

  if (!top.length) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-80">
        <p className="text-muted">No expense data</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Spending by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={top}
            dataKey="total"
            nameKey="displayName"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={2}
            strokeWidth={0}
          >
            {top.map((entry) => (
              <Cell key={entry.category} fill={entry.color} opacity={0.9} />
            ))}
          </Pie>
          <Tooltip content={(props) => <CustomTooltip {...props} currency={currency} />} />
          <Legend
            verticalAlign="bottom"
            formatter={(value) => (
              <span className="text-xs text-slate-300">{value}</span>
            )}
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
