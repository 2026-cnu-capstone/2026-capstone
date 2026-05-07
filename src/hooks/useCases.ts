import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CASES } from '@/lib/constants';
import { nextCaseId } from '@/lib/utils';
import type { ActiveCase, Case } from '@/types';

const STORAGE_KEY = 'forensic_cases';

function loadCases(): Case[] {
  if (typeof window === 'undefined') return DEFAULT_CASES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Case[]) : DEFAULT_CASES;
  } catch {
    return DEFAULT_CASES;
  }
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>(loadCases);
  const [activeCase, setActiveCase] = useState<ActiveCase>({
    id: 'DF-2026-0425',
    title: '20260425_김영끌_랜섬웨어',
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch {
      // ignore quota / private mode errors
    }
  }, [cases]);

  const createCase = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return null;
    const id = nextCaseId(cases);
    const today = new Date().toISOString().slice(0, 10);
    const created: Case = {
      id,
      title: trimmed,
      status: 'idle',
      analyst: '-',
      media: '-',
      size: '-',
      date: today,
      progress: 0,
    };
    setCases(prev => [created, ...prev]);
    return created;
  }, [cases]);

  const deleteCase = useCallback((id: string) => {
    setCases(prev => {
      const remaining = prev.filter(c => c.id !== id);
      setActiveCase(ac =>
        ac.id !== id
          ? ac
          : remaining[0]
            ? { id: remaining[0].id, title: remaining[0].title }
            : { id: '', title: '케이스 없음' }
      );
      return remaining;
    });
  }, []);

  return { cases, setCases, activeCase, setActiveCase, createCase, deleteCase };
}
