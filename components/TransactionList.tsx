'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { getCategoryConfig } from '@/lib/categories';

interface Props {
  transactions: Transaction[];
  currency: string;
}

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Math.abs(n));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

export function TransactionList({ transactions, currency }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions
      .filter(t =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <h2 className="text-lg font-semibold text-white">Transactions</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="bg-[#0d0d14] border border-[#1e1e30] rounded-xl pl-8 pr-4 py-2 text-sm text-slate-200 placeholder-muted focus:outline-none focus:border-indigo-500 w-full sm:w-56 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-[#1e1e30]">
              <th className="pb-3 text-muted font-medium pr-4 whitespace-nowrap">Date</th>
              <th className="pb-3 text-muted font-medium pr-4">Name</th>
              <th className="pb-3 text-muted font-medium pr-4 hidden sm:table-cell">Category</th>
              <th className="pb-3 text-muted font-medium text-right whitespace-nowrap">Amount</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => {
              const cfg = getCategoryConfig(t.category);
              const isExpense = t.amount < 0;
              return (
                <tr key={t.id} className="table-row-hover border-b border-[#1e1e3080] last:border-0">
                  <td className="py-3 pr-4 text-muted whitespace-nowrap text-xs sm:text-sm">{fmtDate(t.date)}</td>
                  <td className="py-3 pr-4 text-slate-200 max-w-[140px] sm:max-w-[220px] truncate text-sm" title={t.name}>
                    <span className="sm:hidden mr-1.5">{cfg.emoji}</span>
                    {t.name}
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}35` }}
                    >
                      <span>{cfg.emoji}</span>
                      {cfg.displayName}
                    </span>
                  </td>
                  <td className={`py-3 text-right font-semibold text-sm whitespace-nowrap ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isExpense ? '−' : '+'}{fmt(t.amount, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!visible.length && (
          <p className="text-muted text-sm text-center py-8">No transactions found.</p>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted">
            {filtered.length} transactions · page {page + 1} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded-lg bg-[#1e1e30] text-slate-300 disabled:opacity-30 hover:bg-[#2a2a40] transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
              disabled={page === pages - 1}
              className="px-3 py-1 rounded-lg bg-[#1e1e30] text-slate-300 disabled:opacity-30 hover:bg-[#2a2a40] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
