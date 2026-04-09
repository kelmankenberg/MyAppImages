import { create } from 'zustand';
import type { AppImageEntry } from '../types/appImage';

interface AppImageState {
  entries: AppImageEntry[];
  loading: boolean;
  error: string | null;
  setEntries: (entries: AppImageEntry[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addEntry: (entry: AppImageEntry) => void;
  removeEntry: (id: string) => void;
}

export const useAppImageStore = create<AppImageState>((set) => ({
  entries: [],
  loading: false,
  error: null,
  setEntries: (entries) => set({ entries }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
  removeEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
}));
