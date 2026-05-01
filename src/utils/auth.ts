import { supabase } from '../lib/supabase';

const AUTH_TOKEN_KEY = 'rudolph_authenticated';
const AUTH_TIMESTAMP_KEY = 'rudolph_auth_timestamp';
const FAILED_ATTEMPTS_KEY = 'rudolph_failed_attempts';
const LOCKOUT_UNTIL_KEY = 'rudolph_lockout_until';

const AUTH_EXPIRY_DAYS = 30;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000;

export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isLockedOut(): { locked: boolean; remainingMs: number } {
  const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_UNTIL_KEY) || '0', 10);
  const now = Date.now();
  if (lockoutUntil > now) {
    return { locked: true, remainingMs: lockoutUntil - now };
  }
  return { locked: false, remainingMs: 0 };
}

export async function verifyPassword(
  plain: string
): Promise<{ ok: boolean; reason?: string }> {
  const lock = isLockedOut();
  if (lock.locked) {
    return {
      ok: false,
      reason: `잠금 중 — ${Math.ceil(lock.remainingMs / 1000)}초 후 다시 시도하세요`,
    };
  }

  if (!supabase) {
    return { ok: false, reason: 'Supabase 미연결 — 관리자에게 문의' };
  }

  const { data, error } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'access_password_hash')
    .single();

  if (error || !data) {
    return { ok: false, reason: '서버 오류 — 잠시 후 다시 시도하세요' };
  }

  const inputHash = await sha256(plain);
  const match = inputHash === data.value;

  if (match) {
    clearFailedAttempts();
    return { ok: true };
  }

  recordFailedAttempt();
  const attempts = getFailedAttempts();
  const remaining = MAX_FAILED_ATTEMPTS - attempts;

  if (remaining > 0) {
    return { ok: false, reason: `비밀번호가 틀렸습니다 (${remaining}회 남음)` };
  }
  return { ok: false, reason: '5회 실패 — 1분간 잠금됩니다' };
}

function getFailedAttempts(): number {
  return parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10);
}

function recordFailedAttempt(): void {
  const attempts = getFailedAttempts() + 1;
  localStorage.setItem(FAILED_ATTEMPTS_KEY, attempts.toString());
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    localStorage.setItem(
      LOCKOUT_UNTIL_KEY,
      (Date.now() + LOCKOUT_DURATION_MS).toString()
    );
  }
}

function clearFailedAttempts(): void {
  localStorage.removeItem(FAILED_ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_UNTIL_KEY);
}

export function saveAuthToken(): void {
  localStorage.setItem(AUTH_TOKEN_KEY, 'true');
  localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
  if (token !== 'true' || !timestamp) return false;

  const elapsed = Date.now() - parseInt(timestamp, 10);
  if (elapsed > AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
    logout();
    return false;
  }
  return true;
}

export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TIMESTAMP_KEY);
}
