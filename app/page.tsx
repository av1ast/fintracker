import { parseCSV } from '@/lib/parseTransactions';
import { Dashboard } from '@/components/Dashboard';

async function fetchSheetData(): Promise<{ data: string | null; error: string | null }> {
  const id  = process.env.SPREADSHEET_ID;
  const gid = process.env.SHEET_GID;

  if (!id) {
    return { data: null, error: 'SPREADSHEET_ID env variable is not set. See README.' };
  }

  const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ''}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        return { data: null, error: 'The Google Sheet is not publicly accessible. Share it as "Anyone with the link can view".' };
      }
      return { data: null, error: `Google Sheets returned ${res.status}. Make sure the sheet is shared publicly.` };
    }
    const text = await res.text();
    // Google sometimes returns an HTML login page instead of CSV
    if (text.trim().startsWith('<')) {
      return { data: null, error: 'Received an HTML page instead of CSV. The sheet may not be publicly shared.' };
    }
    return { data: text, error: null };
  } catch {
    return { data: null, error: 'Network error: could not reach Google Sheets.' };
  }
}

export default async function Home() {
  const { data, error } = await fetchSheetData();

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-8 max-w-lg text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-white mb-2">Cannot load your data</h1>
          <p className="text-muted text-sm mb-6">{error}</p>
          <div className="text-left bg-[#0d0d14] rounded-xl p-4 text-sm text-slate-300 space-y-2">
            <p className="font-semibold text-white">Quick fix:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted">
              <li>Open your Google Sheet</li>
              <li>File → Share → Publish to web <span className="text-slate-400">(or share link as Viewer)</span></li>
              <li>Set <code className="text-indigo-400">SPREADSHEET_ID</code> in <code className="text-indigo-400">.env.local</code></li>
              <li>Restart the dev server</li>
            </ol>
          </div>
        </div>
      </main>
    );
  }

  const financialData = parseCSV(data);

  return <Dashboard initialData={financialData} initialUpdated={new Date().toISOString()} />;
}
