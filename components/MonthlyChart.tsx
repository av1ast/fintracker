'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { MonthlyData } from '@/lib/types';

interface Props {
  monthly: MonthlyData[];
  currency: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm shadow-xl space-y-1">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

export function MonthlyChart({ monthly }: Props) {
  if (!monthly.length) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-80">
        <p className="text-muted">No monthly data</p>
      </div>
    );
  }

  const data = monthly.slice(-12); // last 12 months

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Monthly Trend</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `£${(v / 1000).toFixed(0)}k`}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(v) => <span className="text-slate-300">{v}</span>}
          />
          <Bar dataKey="income" name="Income"  fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="spent"  name="Spent"   fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
