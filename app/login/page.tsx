'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Delete } from 'lucide-react';

const PIN_LENGTH = 4;

export default function LoginPage() {
  const [pin, setPin]       = useState('');
  const [error, setError]   = useState('');
  const [shake, setShake]   = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = useCallback(async (fullPin: string) => {
    setLoading(true);
    try {
      const res  = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error ?? 'Wrong PIN');
        setShake(true);
        setPin('');
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError('Connection error');
      setPin('');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const addDigit = useCallback((digit: string) => {
    if (loading) return;
    setError('');
    setPin(prev => {
      if (prev.length >= PIN_LENGTH) return prev;
      const next = prev + digit;
      if (next.length === PIN_LENGTH) setTimeout(() => submit(next), 80);
      return next;
    });
  }, [loading, submit]);

  const deleteDigit = useCallback(() => {
    if (loading) return;
    setError('');
    setPin(prev => prev.slice(0, -1));
  }, [loading]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') addDigit(e.key);
      if (e.key === 'Backspace') deleteDigit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addDigit, deleteDigit]);

  const buttons = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-[280px] px-4">

        {/* Logo */}
        <div className="text-center select-none">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="text-2xl font-bold gradient-text">FinTracker</h1>
          <p className="text-muted text-sm mt-1.5">Enter your PIN to continue</p>
        </div>

        {/* PIN dots */}
        <div className={shake ? 'animate-shake' : ''}>
          <div className="flex gap-5">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                  i < pin.length
                    ? 'bg-indigo-500 border-indigo-500 scale-125'
                    : 'border-[#3d3d55] bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error message */}
        <div className="h-5 -my-4 flex items-center">
          {error && (
            <p className="text-rose-400 text-sm text-center animate-fadeIn">{error}</p>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {buttons.map((btn, i) => {
            if (btn === '') return <div key={i} />;

            if (btn === 'del') return (
              <button
                key={i}
                onClick={deleteDigit}
                disabled={loading || pin.length === 0}
                className="h-[68px] rounded-2xl bg-[#1a1a2e] text-slate-300 flex items-center justify-center hover:bg-[#24243e] active:scale-95 transition-all disabled:opacity-20 select-none"
              >
                <Delete size={20} />
              </button>
            );

            return (
              <button
                key={i}
                onClick={() => addDigit(btn)}
                disabled={loading}
                className="h-[68px] rounded-2xl bg-[#14141f] border border-[#1e1e30] text-white text-xl font-semibold hover:bg-[#1e1e30] hover:border-indigo-500/40 active:scale-95 active:bg-indigo-600/20 transition-all disabled:opacity-50 select-none"
              >
                {btn}
              </button>
            );
          })}
        </div>

        {loading && (
          <p className="text-muted text-xs animate-pulse">Verifying…</p>
        )}
      </div>
    </div>
  );
}
