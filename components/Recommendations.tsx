'use client';

import { Recommendation } from '@/lib/types';
import { Lightbulb } from 'lucide-react';

interface Props {
  recommendations: Recommendation[];
  currency: string;
}

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

const PRIORITY_LABELS: Record<string, string> = {
  high: 'High Priority',
  medium: 'Medium',
  low: 'Low',
};

export function Recommendations({ recommendations, currency }: Props) {
  if (!recommendations.length) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Savings Recommendations</h2>
        </div>
        <p className="text-muted text-sm">Great job! No major areas of concern detected.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb size={20} className="text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">Savings Recommendations</h2>
        <span className="ml-auto text-xs text-muted">{recommendations.length} insight{recommendations.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`rounded-xl p-4 border transition-all ${
              rec.priority === 'high'
                ? 'bg-red-500/5 border-red-500/20'
                : rec.priority === 'medium'
                ? 'bg-amber-500/5 border-amber-500/20'
                : 'bg-indigo-500/5 border-indigo-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none mt-0.5 flex-shrink-0">{rec.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-semibold text-white">{rec.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium badge-${rec.priority}`}>
                    {PRIORITY_LABELS[rec.priority]}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{rec.description}</p>
                {rec.potential > 0 && (
                  <p className="mt-2 text-xs font-semibold text-emerald-400">
                    💡 Potential saving: ~{fmt(rec.potential, currency)}/month
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
