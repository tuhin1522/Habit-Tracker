import { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { Trophy, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { useJournalStore } from '../../store/useJournalStore';
import { WeeklyChart } from './WeeklyChart';
import { CategoryRadar } from './CategoryRadar';
import { MonthlyTrend } from './MonthlyTrend';

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AnalyticsView() {
  const habits = useHabitStore((s) => s.habits);
  const entries = useJournalStore((s) => s.entries);

  const stats = useMemo(() => {
    // Promise Keeper Score (last 30 days)
    const last30 = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    const totalSlots = habits.length * 30;
    const completedSlots = last30.reduce((sum, d) =>
      sum + habits.filter((h) => h.completedDates.includes(d)).length, 0);
    const promiseKeeperScore = totalSlots ? Math.round((completedSlots / totalSlots) * 100) : 0;

    // Current streaks
    const totalCurrentStreak = habits.reduce((sum, h) => sum + h.streak, 0);
    const maxStreak = Math.max(0, ...habits.map((h) => h.longestStreak));

    // Journal avg mood/energy
    const avgMood = entries.length
      ? Math.round(entries.reduce((s, e) => s + e.mood, 0) / entries.length * 10) / 10
      : 0;
    const avgEnergy = entries.length
      ? Math.round(entries.reduce((s, e) => s + e.energy, 0) / entries.length * 10) / 10
      : 0;

    return { promiseKeeperScore, totalCurrentStreak, maxStreak, avgMood, avgEnergy };
  }, [habits, entries]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-100">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Your performance at a glance</p>
      </div>

      {/* Promise Keeper Score — Hero KPI */}
      <div
        className="relative rounded-2xl p-6 border overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))', borderColor: 'rgba(16,185,129,0.2)' }}
      >
        <div className="relative flex items-center gap-6">
          <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 shrink-0">
            <Trophy className="w-6 h-6 text-emerald-400 mb-1" />
            <span className="text-2xl font-black text-emerald-400">{stats.promiseKeeperScore}%</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Promise Keeper Score</h2>
            <p className="text-zinc-500 text-sm mt-0.5">
              {stats.promiseKeeperScore >= 80
                ? '🔥 Elite level consistency — keep going!'
                : stats.promiseKeeperScore >= 60
                  ? '💪 Good momentum — push for 80%+'
                  : '⚡ Build the habit — consistency is key'}
            </p>
            <p className="text-xs text-zinc-600 mt-2">Based on last 30 days</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Habits', value: habits.length, icon: <Zap className="w-4 h-4 text-sky-400" />, cls: 'bg-sky-500/[0.08] border-sky-500/20' },
          { label: 'Combined Streak', value: `${stats.totalCurrentStreak}d`, icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, cls: 'bg-emerald-500/[0.08] border-emerald-500/20' },
          { label: 'Longest Streak', value: `${stats.maxStreak}d`, icon: <Trophy className="w-4 h-4 text-amber-400" />, cls: 'bg-amber-500/[0.08] border-amber-500/20' },
          { label: 'Journal Entries', value: entries.length, icon: <Calendar className="w-4 h-4 text-violet-400" />, cls: 'bg-violet-500/[0.08] border-violet-500/20' },
        ].map(({ label, value, icon, cls }) => (
          <div key={label} className={`p-3 rounded-xl border ${cls}`}>
            <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs text-zinc-500">{label}</span></div>
            <p className="text-xl font-bold text-zinc-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Mood & Energy Averages */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">😊</span>
            <div>
              <p className="text-xs text-zinc-500">Avg Mood</p>
              <p className="text-xl font-bold text-emerald-400">{stats.avgMood}<span className="text-sm text-zinc-500">/10</span></p>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-xs text-zinc-500">Avg Energy</p>
              <p className="text-xl font-bold text-amber-400">{stats.avgEnergy}<span className="text-sm text-zinc-500">/10</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyChart />
        <CategoryRadar />
      </div>
      <MonthlyTrend />
    </div>
  );
}
