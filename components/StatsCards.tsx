'use client';

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';

interface StatsCardsProps {
  totalIncome: number;
  totalSpent: number;
  netSavings: number;
  savingsRate: number;
  currency: string;
}

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

interface CardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  positive?: boolean;
}

function Card({ label, value, sub, icon, gradient, positive }: CardProps) {
  return (
    <div className="glass-card hover-glow p-5 flex flex-col gap-3 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-muted text-sm font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white count-up">{value}</p>
        {sub && (
          <p className={`text-xs mt-1 ${positive === undefined ? 'text-muted' : positive ? 'text-success' : 'text-danger'}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export function StatsCards({ totalIncome, totalSpent, netSavings, savingsRate, currency }: StatsCardsProps) {
  const savingsOk = savingsRate >= 20;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Total Income"
        value={fmt(totalIncome, currency)}
        sub={totalIncome > 0 ? 'Across the period' : 'No income data'}
        icon={<TrendingUp size={18} className="text-emerald-400" />}
        gradient="bg-emerald-500/10"
        positive
      />
      <Card
        label="Total Spent"
        value={fmt(totalSpent, currency)}
        sub="All expenses"
        icon={<TrendingDown size={18} className="text-rose-400" />}
        gradient="bg-rose-500/10"
        positive={false}
      />
      <Card
        label="Net Savings"
        value={fmt(netSavings, currency)}
        sub={netSavings >= 0 ? 'Positive balance 🎉' : 'Spending exceeds income'}
        icon={<Wallet size={18} className="text-indigo-400" />}
        gradient="bg-indigo-500/10"
        positive={netSavings >= 0}
      />
      <Card
        label="Savings Rate"
        value={`${savingsRate.toFixed(1)}%`}
        sub={savingsOk ? 'Above 20% target ✓' : 'Target: 20% of income'}
        icon={<PiggyBank size={18} className="text-violet-400" />}
        gradient="bg-violet-500/10"
        positive={savingsOk}
      />
    </div>
  );
}
