import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle, Target, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Progress Header
// ─────────────────────────────────────────────────────────────────────────────
const MOTIVATIONAL_QUOTES = [
  'Every day is Day 1.',
  'Your future self is watching.',
  'Discipline is freedom.',
  'Small steps, massive results.',
  'Build the identity, not just the habit.',
  'Win the morning, win the day.',
  'No shortcuts. No excuses. Just reps.',
];

export function ProgressHeader() {
  const habits = useHabitStore((s) => s.habits);
  const today = format(new Date(), 'yyyy-MM-dd');

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const progressPercent = totalHabits ? Math.round((completedToday / totalHabits) * 100) : 0;
  const maxStreak = Math.max(0, ...habits.map((h) => h.streak));
  const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];

  const getProgressColor = () => {
    if (progressPercent >= 80) return '#10b981';
    if (progressPercent >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  return (
    <div className="space-y-4">
      {/* Date + Quote */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
            Today's Protocol
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {format(new Date(), 'EEEE, MMMM do · yyyy')}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs text-zinc-400 italic max-w-[200px]">{quote}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard
          label="Completed"
          value={`${completedToday}/${totalHabits}`}
          icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
          color="emerald"
        />
        <KPICard
          label="Completion"
          value={`${progressPercent}%`}
          icon={<Target className="w-4 h-4 text-sky-400" />}
          color="sky"
        />
        <KPICard
          label="Best Streak"
          value={`${maxStreak}d`}
          icon={<Flame className="w-4 h-4 text-amber-400" />}
          color="amber"
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-400 font-medium">Promise Keeper Score</span>
          <span className="font-bold" style={{ color: getProgressColor() }}>
            {progressPercent}%
          </span>
        </div>
        <div className="relative h-2.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${getProgressColor()}99, ${getProgressColor()})` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Shimmer sweep */}
          {progressPercent > 0 && (
            <motion.div
              className="absolute top-0 left-0 h-full w-16 opacity-30 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }}
              animate={{ x: ['-100%', '600%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
            />
          )}
        </div>
        {progressPercent === 100 && (
          <motion.p
            className="text-xs text-emerald-400 font-semibold text-center"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🎉 PERFECT DAY — Protocol Complete!
          </motion.p>
        )}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
const KPI_STYLES: Record<string, React.CSSProperties> = {
  emerald: { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' },
  sky:     { background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' },
  amber:   { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' },
};

function KPICard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl" style={KPI_STYLES[color]}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <span className="text-xl font-bold text-zinc-100">{value}</span>
    </div>
  );
}
