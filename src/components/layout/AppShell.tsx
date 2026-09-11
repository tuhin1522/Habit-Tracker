import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../store/useAppStore';
import { useHabitStore } from '../../store/useHabitStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useJournalStore } from '../../store/useJournalStore';
import { useFocusStore } from '../../store/useFocusStore';
import { useSyllabusStore } from '../../store/useSyllabusStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { HabitCreator } from '../habits/HabitCreator';

// Lazy-load pages for performance
const DashboardView  = lazy(() => import('../dashboard/DashboardView'));
const HabitsView     = lazy(() => import('../habits/HabitsView'));
const GoalsView      = lazy(() => import('../goals/GoalsView'));
const JournalView    = lazy(() => import('../journal/JournalView'));
const FocusView      = lazy(() => import('../focus/FocusView'));
const AnalyticsView  = lazy(() => import('../analytics/AnalyticsView'));
const SettingsView   = lazy(() => import('../settings/SettingsView'));
const SyllabusView   = lazy(() => import('../syllabus/SyllabusView'));
const ArchiveView    = lazy(() => import('../archive/ArchiveView'));

// ─────────────────────────────────────────────────────────────────────────────
// App Shell — Root layout with data loading
// ─────────────────────────────────────────────────────────────────────────────
export function AppShell() {
  const { activePage, isHabitCreatorOpen, closeHabitCreator } = useAppStore();
  const loadHabits        = useHabitStore((s) => s.loadHabits);
  const loadGoals         = useGoalStore((s) => s.loadGoals);
  const loadEntries       = useJournalStore((s) => s.loadEntries);
  const loadFocusSessions = useFocusStore((s) => s.loadSessions);
  const loadSubjects      = useSyllabusStore((s) => s.loadSubjects);

  // Attach keyboard shortcuts
  useKeyboardShortcuts();

  // Boot: load all data from Dexie on mount
  useEffect(() => {
    loadHabits();
    loadGoals();
    loadEntries();
    loadFocusSessions();
    loadSubjects();
  }, []);

  const PageComponent = {
    dashboard: DashboardView,
    habits:    HabitsView,
    goals:     GoalsView,
    journal:   JournalView,
    focus:     FocusView,
    analytics: AnalyticsView,
    settings:  SettingsView,
    syllabus:  SyllabusView,
    archive:   ArchiveView,
  }[activePage];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b]">
      <Sidebar />

      {/* Main viewport */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex-1 h-full overflow-y-auto"
              style={{ height: '100vh' }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Global Modals */}
      <HabitCreator isOpen={isHabitCreatorOpen} onClose={closeHabitCreator} />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
