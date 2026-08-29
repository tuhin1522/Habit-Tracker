import { create } from 'zustand';
import type { NavPage } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// App UI Store
// ─────────────────────────────────────────────────────────────────────────────
interface AppStore {
  activePage: NavPage;
  sidebarCollapsed: boolean;
  isHabitCreatorOpen: boolean;
  isQuickAddOpen: boolean;
  isJournalOpen: boolean;
  editingHabitId: string | null;
  setActivePage: (page: NavPage) => void;
  toggleSidebar: () => void;
  openHabitCreator: (habitId?: string) => void;
  closeHabitCreator: () => void;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  openJournal: () => void;
  closeJournal: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activePage: 'dashboard',
  sidebarCollapsed: false,
  isHabitCreatorOpen: false,
  isQuickAddOpen: false,
  isJournalOpen: false,
  editingHabitId: null,

  setActivePage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openHabitCreator: (habitId) => set({ isHabitCreatorOpen: true, editingHabitId: habitId || null }),
  closeHabitCreator: () => set({ isHabitCreatorOpen: false, editingHabitId: null }),
  openQuickAdd: () => set({ isQuickAddOpen: true }),
  closeQuickAdd: () => set({ isQuickAddOpen: false }),
  openJournal: () => set({ isJournalOpen: true, activePage: 'journal' }),
  closeJournal: () => set({ isJournalOpen: false }),
}));
