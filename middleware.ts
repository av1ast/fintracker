import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/logout'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const pin    = process.env.PIN_CODE;
  const secret = process.env.COOKIE_SECRET;

  // Misconfigured — let the app show its own error
  if (!pin || !secret) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token || !(await verifyToken(token, pin, secret))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest).*)'],
};
