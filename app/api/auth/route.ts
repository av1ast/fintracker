import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, COOKIE_MAX_AGE, makeToken } from '@/lib/auth';

const MAX_ATTEMPTS  = 5;
const LOCKOUT_MS    = 15 * 60 * 1000; // 15 minutes

// Module-level store — persists for the lifetime of the Node process
const tracker = new Map<string, { count: number; lockedUntil: number }>();

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  const ip  = getIP(req);
  const now = Date.now();

  const record = tracker.get(ip) ?? { count: 0, lockedUntil: 0 };

  // Locked out?
  if (record.lockedUntil > now) {
    const mins = Math.ceil((record.lockedUntil - now) / 60_000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { pin } = body as { pin?: string };

  const correctPin = process.env.PIN_CODE;
  const secret     = process.env.COOKIE_SECRET;

  if (!correctPin || !secret) {
    return NextResponse.json({ error: 'Server misconfigured — set PIN_CODE and COOKIE_SECRET.' }, { status: 500 });
  }

  if (!pin || pin !== correctPin) {
    const newCount    = record.count + 1;
    const lockedUntil = newCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0;
    tracker.set(ip, { count: newCount, lockedUntil });

    const left = MAX_ATTEMPTS - newCount;
    const msg  = lockedUntil
      ? 'Too many attempts. Locked for 15 minutes.'
      : `Wrong PIN — ${left} attempt${left !== 1 ? 's' : ''} left.`;

    return NextResponse.json({ error: msg }, { status: 401 });
  }

  // Correct PIN — clear tracker and issue cookie
  tracker.delete(ip);
  const token = await makeToken(correctPin, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'strict',
    maxAge:    COOKIE_MAX_AGE,
    path:      '/',
  });
  return res;
}
