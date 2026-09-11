import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Trophy, Archive, Play, Calendar, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';
import { useFocusStore } from '../../store/useFocusStore';
import { useAppStore } from '../../store/useAppStore';
import { HabitCard } from '../dashboard/HabitCard';
import { YearHeatmap } from './YearHeatmap';
import { StreakBadges } from './StreakBadges';
import { CountdownCard } from '../goals/CountdownCard';
import { clsx } from 'clsx';
import type { HabitCategory, Habit } from '../../types';
import { HABIT_COLOR_HEX } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Habits Page View — with Lifecycle Tabs & Sprint Badges
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES: (HabitCategory | 'All')[] = ['All','Health','Mindset','Skills','Productivity','Other'];
type StatusTab = 'active' | 'completed' | 'archived';

export default function HabitsView() {
  const { habits, reactivateHabit, archiveHabit } = useHabitStore();
  const { setSessionConfig, toggleTimer, isRunning } = useFocusStore();
  const { openHabitCreator, setActivePage } = useAppStore();

  const [filterCat, setFilterCat] = useState<HabitCategory | 'All'>('All');
  const [statusTab, setStatusTab] = useState<StatusTab>('active');
  const today = format(new Date(), 'yyyy-MM-dd');

  const activeHabits   = habits.filter((h) => h.status === 'active' || !h.status);
  const completedToday = activeHabits.filter((h) => h.completedDates.includes(today)).length;
  const todayPct       = activeHabits.length ? Math.round((completedToday / activeHabits.length) * 100) : 0;

  const filtered = habits.filter((h) => {
    const isCatMatch    = filterCat === 'All' || h.category === filterCat;
    const isStatusMatch = statusTab === 'active'
      ? (h.status === 'active' || !h.status)
      : h.status === statusTab;
    return isCatMatch && isStatusMatch;
  });

  const handleQuickPlay = (habit: Habit) => {
    setSessionConfig(habit.id, habit.title);
    if (!isRunning) toggleTimer();
    setActivePage('focus');
  };

  const TAB_CFG = [
    { key: 'active'    as StatusTab, icon: Flame,   label: 'Active Habits',         count: habits.filter(h => h.status === 'active' || !h.status).length },
    { key: 'completed' as StatusTab, icon: Trophy,  label: 'Mastered / Trophy Room', count: habits.filter(h => h.status === 'completed').length             },
    { key: 'archived'  as StatusTab, icon: Archive, label: 'Archived',               count: habits.filter(h => h.status === 'archived').length              },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* ── Page Header ───────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100">My Habits</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-zinc-500 text-sm">
              {completedToday}/{activeHabits.length} completed today
            </span>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-0.5">
              <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${todayPct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-400">{todayPct}%</span>
            </div>
          </div>
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

      {/* ── Year Heatmap ──────────────────────────────── */}
      <YearHeatmap />

      {/* ── Streak Badges ─────────────────────────────── */}
      <StreakBadges />

      {/* ── Category Filter ───────────────────────────── */}
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

      {/* ── Status Tabs ───────────────────────────────── */}
      <div className="flex gap-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-1">
        {TAB_CFG.map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => setStatusTab(key)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              statusTab === key
                ? key === 'completed'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : key === 'archived'
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                : 'text-zinc-500 hover:text-zinc-200'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className={clsx(
              'text-[10px] font-black px-1.5 py-0.5 rounded-full',
              statusTab === key
                ? key === 'completed' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                : 'bg-zinc-800 text-zinc-500'
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Habit List ────────────────────────────────── */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              {statusTab === 'completed' ? <Trophy className="w-10 h-10 text-amber-700" /> :
               statusTab === 'archived'  ? <Archive className="w-10 h-10 text-zinc-700" /> :
               <Flame className="w-10 h-10 text-zinc-700" />}
              <p className="text-zinc-500 text-sm">
                {statusTab === 'active'    ? 'No active habits found.' :
                 statusTab === 'completed' ? 'No mastered habits yet. Keep going!' :
                 'No archived habits.'}
              </p>
              {statusTab === 'active' && (
                <button onClick={() => openHabitCreator()} className="text-emerald-400 text-sm hover:underline">
                  Create your first habit →
                </button>
              )}
            </motion.div>
          ) : (
            filtered.map((habit) => {
              if (statusTab === 'active') {
                // Numeric countdown habits get the CountdownCard
                if (habit.habitType === 'numeric_countdown' && habit.numericGoal) {
                  return (
                    <motion.div key={habit.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <CountdownCard habit={habit} />
                    </motion.div>
                  );
                }
                // Regular habit card with sprint badge + quick-play
                return (
                  <motion.div key={habit.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative group">
                    <HabitCard habit={habit} showSlot />
                    {/* Sprint badge overlay */}
                    {habit.durationDaysTarget && (
                      <SprintBadge habit={habit} />
                    )}
                    {/* Quick-play button */}
                    <button
                      onClick={() => handleQuickPlay(habit)}
                      title="Start focus session for this habit"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition w-7 h-7 flex items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
                    >
                      <Play className="w-3 h-3 fill-cyan-400" />
                    </button>
                  </motion.div>
                );
              }

              // Completed / Archived row
              return (
                <LifecycleRow
                  key={habit.id}
                  habit={habit}
                  tab={statusTab}
                  onReactivate={() => reactivateHabit(habit.id)}
                  onArchive={() => archiveHabit(habit.id)}
                />
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sprint Badge
// ─────────────────────────────────────────────────────────────────────────────
function SprintBadge({ habit }: { habit: Habit }) {
  const target = habit.durationDaysTarget!;
  const done   = habit.completedDates.length;
  const dayNum = Math.min(done + 1, target);
  const pct    = Math.round((done / target) * 100);

  return (
    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-zinc-900/90 border border-cyan-500/30 rounded-lg px-2 py-1 backdrop-blur-sm">
      <Zap className="w-3 h-3 text-cyan-400" />
      <span className="text-[10px] font-bold text-cyan-400">Day {dayNum}/{target}</span>
      <div className="w-10 h-1 bg-zinc-700 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle Row (Completed / Archived)
// ─────────────────────────────────────────────────────────────────────────────
function LifecycleRow({
  habit,
  tab,
  onReactivate,
  onArchive,
}: {
  habit: Habit;
  tab: StatusTab;
  onReactivate: () => void;
  onArchive: () => void;
}) {
  const color = HABIT_COLOR_HEX[habit.color] ?? '#10b981';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 group hover:border-zinc-700 transition"
    >
      <div className="w-2.5 h-2.5 rounded-full shrink-0 opacity-60" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-zinc-300">{habit.title}</h3>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {tab === 'completed' && habit.completedAt && (
            <span className="text-[10px] text-zinc-600 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              Mastered {format(new Date(habit.completedAt), 'MMM d, yyyy')}
            </span>
          )}
          <span className="text-[10px] text-zinc-600">{habit.completedDates.length} completions</span>
          {habit.longestStreak > 0 && (
            <span className="text-[10px] text-amber-600 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5" />
              {habit.longestStreak}d best streak
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onReactivate}
          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-semibold rounded-lg transition"
        >
          Reactivate
        </button>
        {tab === 'completed' && (
          <button
            onClick={onArchive}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-semibold rounded-lg transition flex items-center gap-1"
          >
            <Archive className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
