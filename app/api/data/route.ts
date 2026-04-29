import { NextResponse } from 'next/server';
import { parseCSV } from '@/lib/parseTransactions';

export async function GET() {
  const id  = process.env.SPREADSHEET_ID;
  const gid = process.env.SHEET_GID;
  if (!id) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ''}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ error: 'Fetch failed' }, { status: 502 });
    const text = await res.text();
    if (text.trim().startsWith('<')) return NextResponse.json({ error: 'Sheet not public' }, { status: 403 });
    return NextResponse.json(parseCSV(text));
  } catch {
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}
