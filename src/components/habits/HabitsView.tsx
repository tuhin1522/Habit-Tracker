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
  const today = format(new Date(), 'yyyy-MM-dd');

  const filtered = filterCat === 'All' ? habits : habits.filter((h) => h.category === filterCat);
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100">My Habits</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {completedToday}/{habits.length} completed today · {totalStreak} total streak days
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

      {/* Habit List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              <Flame className="w-10 h-10 text-zinc-700" />
              <p className="text-zinc-500 text-sm">No habits yet.</p>
              <button onClick={() => openHabitCreator()} className="text-emerald-400 text-sm hover:underline">
                Create your first habit →
              </button>
            </motion.div>
          ) : (
            filtered.map((habit) => (
              <HabitCard key={habit.id} habit={habit} showSlot />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
