export const COOKIE_NAME = 'ft_auth';
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function makeToken(pin: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(pin));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyToken(token: string, pin: string, secret: string): Promise<boolean> {
  const expected = await makeToken(pin, secret);
  if (token.length !== expected.length) return false;
  // Constant-time comparison to prevent timing attacks
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
