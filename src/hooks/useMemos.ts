import { useCallback, useEffect, useState } from 'react';
import type { Memo, MemoColor } from '../types/memo';

const STORAGE_KEY = 'rudolph_memos';

function loadFromStorage(): Memo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Memo =>
        typeof m === 'object' &&
        m !== null &&
        typeof m.id === 'string' &&
        typeof m.content === 'string' &&
        typeof m.color === 'string' &&
        typeof m.createdAt === 'string' &&
        typeof m.updatedAt === 'string'
    );
  } catch {
    return [];
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `memo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>(() => loadFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
    } catch (e) {
      console.warn('[useMemos] 저장 실패:', e);
    }
  }, [memos]);

  const createMemo = useCallback((color: MemoColor = 'yellow') => {
    const now = new Date().toISOString();
    const newMemo: Memo = {
      id: generateId(),
      content: '',
      color,
      createdAt: now,
      updatedAt: now,
    };
    setMemos((prev) => [newMemo, ...prev]);
    return newMemo.id;
  }, []);

  const updateMemo = useCallback(
    (id: string, updates: Partial<Pick<Memo, 'content' | 'color'>>) => {
      setMemos((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
        )
      );
    },
    []
  );

  const deleteMemo = useCallback((id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { memos, createMemo, updateMemo, deleteMemo };
}
