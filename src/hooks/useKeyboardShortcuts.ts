import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

// ─────────────────────────────────────────────────────────────────────────────
// Global Keyboard Shortcuts
// Ctrl+N  → Open new habit creator
// Ctrl+J  → Open quick journal
// Escape  → Close any open overlay
// ─────────────────────────────────────────────────────────────────────────────
export function useKeyboardShortcuts() {
  const {
    openHabitCreator, closeHabitCreator,
    openJournal, closeJournal,
    isHabitCreatorOpen, isJournalOpen, isQuickAddOpen,
    closeQuickAdd,
  } = useAppStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'n') {
        e.preventDefault();
        openHabitCreator();
      }

      if (mod && e.key === 'j') {
        e.preventDefault();
        openJournal();
      }

      if (e.key === 'Escape') {
        if (isHabitCreatorOpen) closeHabitCreator();
        if (isJournalOpen) closeJournal();
        if (isQuickAddOpen) closeQuickAdd();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isHabitCreatorOpen, isJournalOpen, isQuickAddOpen]);
}
