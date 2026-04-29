'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Recommendation } from '@/lib/types';
import { Lightbulb, RotateCcw } from 'lucide-react';

interface Props { recommendations: Recommendation[]; currency: string; }

const STORAGE_KEY  = 'ft_dismissed_recs';
const SWIPE_THRESHOLD = 80;

const PRIORITY_LABELS: Record<string, string> = {
  high: 'High', medium: 'Medium', low: 'Low',
};

function fmt(n: number, c: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);
}

function SwipeCard({
  rec,
  currency,
  onDismiss,
}: {
  rec: Recommendation;
  currency: string;
  onDismiss: (id: string) => void;
}) {
  const [offsetX, setOffsetX]   = useState(0);
  const [leaving, setLeaving]   = useState(false);
  const startX    = useRef(0);
  const isDragging = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current   = e.touches[0].clientX;
    isDragging.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setOffsetX(dx); // only left swipe
  };

  const onTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (offsetX < -SWIPE_THRESHOLD) {
      setLeaving(true);
      setTimeout(() => onDismiss(rec.id), 280);
    } else {
      setOffsetX(0);
    }
  }, [offsetX, rec.id, onDismiss]);

  const opacity = Math.max(0, 1 + offsetX / 200);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform:  leaving ? 'translateX(-110%)' : `translateX(${offsetX}px)`,
        opacity:    leaving ? 0 : opacity,
        transition: isDragging.current ? 'none' : 'transform 0.28s ease, opacity 0.28s ease',
        touchAction: 'pan-y',
        maxHeight:  leaving ? 0 : '500px',
        marginBottom: leaving ? 0 : undefined,
        overflow:   'hidden',
      }}
      className={`rounded-xl p-4 border select-none ${
        rec.priority === 'high'   ? 'bg-red-500/5 border-red-500/20' :
        rec.priority === 'medium' ? 'bg-amber-500/5 border-amber-500/20' :
                                    'bg-indigo-500/5 border-indigo-500/20'
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
              💡 ~{fmt(rec.potential, currency)}/month potential saving
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted/60 hidden sm:block">← swipe to dismiss</p>
        </div>
      </div>
    </div>
  );
}

export function Recommendations({ recommendations, currency }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Load dismissed IDs from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
      setDismissed(new Set(stored));
    } catch { /* ignore */ }
  }, []);

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const resetDismissed = () => {
    setDismissed(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const visible = recommendations.filter(r => !dismissed.has(r.id));

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb size={20} className="text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">Recommendations</h2>
        <span className="ml-auto text-xs text-muted">{visible.length} insight{visible.length !== 1 ? 's' : ''}</span>
        {dismissed.size > 0 && (
          <button
            onClick={resetDismissed}
            className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors"
            title="Restore dismissed"
          >
            <RotateCcw size={12} /> restore
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted text-sm">
          {recommendations.length > 0
            ? 'All recommendations dismissed. Tap restore to bring them back.'
            : 'Great job! No major issues detected.'}
        </p>
      ) : (
        <div className="space-y-3 overflow-hidden">
          {visible.map(rec => (
            <SwipeCard key={rec.id} rec={rec} currency={currency} onDismiss={dismiss} />
          ))}
          {visible.length > 0 && (
            <p className="text-xs text-muted text-center pt-1 sm:hidden">Swipe left to dismiss</p>
          )}
        </div>
      )}
    </div>
  );
}
