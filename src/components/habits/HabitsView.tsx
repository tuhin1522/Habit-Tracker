import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';
import { useAppStore } from '../../store/useAppStore';
import { HabitCard } from '../dashboard/HabitCard';
import { YearHeatmap } from './YearHeatmap';
import { StreakBadges } from './StreakBadges';
import type { HabitCategory } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Habits Page View
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES: (HabitCategory | 'All')[] = ['All','Health','Mindset','Skills','Productivity','Other'];

export default function HabitsView() {
  const habits = useHabitStore((s) => s.habits);
  const openHabitCreator = useAppStore((s) => s.openHabitCreator);
  const [filterCat, setFilterCat] = useState<HabitCategory | 'All'>('All');
  const [statusTab, setStatusTab] = useState<'active' | 'completed' | 'archived'>('active');
  const today = format(new Date(), 'yyyy-MM-dd');

  const filtered = habits.filter((h) => {
    const isCatMatch = filterCat === 'All' || h.category === filterCat;
    const isStatusMatch = statusTab === 'active' ? (h.status === 'active' || !h.status) : h.status === statusTab;
    return isCatMatch && isStatusMatch;
  });
  const activeHabits = habits.filter((h) => h.status === 'active' || !h.status);
  const totalStreak = activeHabits.reduce((sum, h) => sum + h.streak, 0);
  const completedToday = activeHabits.filter((h) => h.completedDates.includes(today)).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100">My Habits</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {completedToday}/{activeHabits.length} completed today · {totalStreak} total streak days
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => openHabitCreator()}
          id="habits-add-btn"
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          <Plus className="w-4 h-4" /> New Habit
        </motion.button>
      </div>

      {/* Year Heatmap */}
      <YearHeatmap />

      {/* Streak Badges */}
      <StreakBadges />

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              filterCat === cat
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {(['active', 'completed', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
              statusTab === tab
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-900/50'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'active' ? 'Active (In Progress)' : tab === 'completed' ? 'Completed Topics / Mastered' : 'Archived'}
          </button>
        ))}
      </div>

      {/* Habit List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              <Flame className="w-10 h-10 text-zinc-700" />
              <p className="text-zinc-500 text-sm">No {statusTab} habits found.</p>
              {statusTab === 'active' && (
                <button onClick={() => openHabitCreator()} className="text-emerald-400 text-sm hover:underline">
                  Create your first habit →
                </button>
              )}
            </motion.div>
          ) : (
            filtered.map((habit) => {
              if (statusTab === 'active') {
                return <HabitCard key={habit.id} habit={habit} showSlot />;
              }
              // Completed or Archived card UI
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">{habit.title}</h3>
                    <div className="flex gap-3 mt-2 text-xs text-zinc-500">
                      {statusTab === 'completed' && habit.completedAt && (
                        <span>Completed: {format(new Date(habit.completedAt), 'MMM d, yyyy')}</span>
                      )}
                      <span>{habit.totalDaysTracked || 0} days tracked</span>
                      {habit.longestStreak > 0 && <span className="text-amber-400">Streak: {habit.longestStreak}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => useHabitStore.getState().reactivateHabit(habit.id)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition"
                  >
                    Reactivate
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
