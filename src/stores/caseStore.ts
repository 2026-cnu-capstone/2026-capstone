import { create } from 'zustand';
import type { Case } from '@/types/Case';
import { createCase, getCases } from '@/lib/api/case';

interface CaseState {
  cases: Case[];
  isLoading: boolean;
  error: string | null;
  fetchCases: () => Promise<void>;
  createCase: (name: string, description: string) => Promise<Case>;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: [],
  isLoading: false,
  error: null,
  fetchCases: async () => {
    set({ isLoading: true, error: null });
    try {
      const cases = await getCases();
      set({ cases, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },
  createCase: async (name, description) => {
    set({ isLoading: true, error: null });
    try {
      const newCase = await createCase({ name, description });
      set((s) => ({ cases: [newCase, ...s.cases], isLoading: false }));
      return newCase;
    } catch (e) {
      set({ error: String(e), isLoading: false });
      throw e;
    }
  },
}));
