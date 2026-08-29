import { create } from 'zustand';
import { nanoid } from './nanoid';
import { format } from 'date-fns';
import type { JournalEntry } from '../types';
import { dbGetAllJournalEntries, dbSaveJournalEntry, dbDeleteJournalEntry } from '../db/database';

// ─────────────────────────────────────────────────────────────────────────────
// Journal Store
// ─────────────────────────────────────────────────────────────────────────────
interface JournalStore {
  entries: JournalEntry[];
  isLoaded: boolean;
  todayEntry: JournalEntry | null;
  loadEntries: () => Promise<void>;
  saveEntry: (data: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  entries: [],
  isLoaded: false,
  todayEntry: null,

  loadEntries: async () => {
    const entries = await dbGetAllJournalEntries();
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = entries.find((e) => e.date === today) ?? null;
    set({ entries, isLoaded: true, todayEntry });
  },

  saveEntry: async (data) => {
    const existing = get().entries.find((e) => e.date === data.date);
    let entry: JournalEntry;
    if (existing) {
      entry = { ...existing, ...data };
    } else {
      entry = { ...data, id: nanoid(), createdAt: new Date().toISOString() };
    }
    await dbSaveJournalEntry(entry);
    const entries = get().entries.filter((e) => e.id !== entry.id);
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = entry.date === today ? entry : get().todayEntry;
    set({ entries: [entry, ...entries], todayEntry });
  },

  deleteEntry: async (id) => {
    await dbDeleteJournalEntry(id);
    set((s) => {
      const entries = s.entries.filter((e) => e.id !== id);
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayEntry = entries.find((e) => e.date === today) ?? null;
      return { entries, todayEntry };
    });
  },
}));
