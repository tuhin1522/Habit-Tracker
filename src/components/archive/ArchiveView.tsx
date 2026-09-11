import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Archive, RotateCcw, Flame, Calendar, Star, Crown } from 'lucide-react';
import { clsx } from 'clsx';
import { format, parseISO } from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';
import { HABIT_COLOR_HEX } from '../../types';

type Tab = 'trophy' | 'archived';

// ─────────────────────────────────────────────────────────────────────────────
// ArchiveView — Trophy Room & Archived Habits
// ─────────────────────────────────────────────────────────────────────────────
export default function ArchiveView() {
  const { habits, reactivateHabit, archiveHabit } = useHabitStore();
  const [activeTab, setActiveTab] = useState<Tab>('trophy');

  const completed = habits.filter((h) => h.status === 'completed');
  const archived  = habits.filter((h) => h.status === 'archived');

  return (
    <div className="flex flex-col h-full bg-[#09090b]">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Trophy Room & Archive</h1>
        </div>
        <p className="text-xs text-zinc-600 ml-10.5">Habits you've mastered and historical logs</p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-6 pt-4 shrink-0">
        {([
          { key: 'trophy' as Tab,   icon: Trophy,  label: 'Trophy Room',  count: completed.length },
          { key: 'archived' as Tab, icon: Archive, label: 'Archived',     count: archived.length  },
        ] as const).map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition',
              activeTab === key
                ? key === 'trophy'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span className={clsx(
              'text-[10px] font-black px-1.5 py-0.5 rounded-full',
              activeTab === key && key === 'trophy'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-zinc-700 text-zinc-400'
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          {activeTab === 'trophy' ? (
            <motion.div
              key="trophy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {completed.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No trophies yet"
                  message="Complete habits or mark them as mastered — they'll appear here."
                  iconColor="text-amber-600"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {completed.map((habit, i) => (
                    <TrophyCard
                      key={habit.id}
                      habit={habit}
                      index={i}
                      onArchive={() => archiveHabit(habit.id)}
                      onReactivate={() => reactivateHabit(habit.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="archived"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {archived.length === 0 ? (
                <EmptyState
                  icon={Archive}
                  title="No archived habits"
                  message="Habits you archive will be stored here, preserving all historical data."
                  iconColor="text-zinc-600"
                />
              ) : (
                <div className="space-y-3">
                  {archived.map((habit) => (
                    <ArchivedRow key={habit.id} habit={habit} onReactivate={() => reactivateHabit(habit.id)} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trophy Card
// ─────────────────────────────────────────────────────────────────────────────
function TrophyCard({
  habit,
  index,
  onArchive,
  onReactivate,
}: {
  habit: ReturnType<typeof useHabitStore.getState>['habits'][0];
  index: number;
  onArchive: () => void;
  onReactivate: () => void;
}) {
  const color = HABIT_COLOR_HEX[habit.color] ?? '#10b981';
  const rank = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="relative bg-zinc-900 border border-zinc-700/80 rounded-2xl p-5 overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl"
        style={{ background: color }}
      />

      {/* Shimmer top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 badge-shimmer"
        style={{ background: `linear-gradient(90deg, transparent, ${color}88, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{rank}</span>
          <Crown className="w-4 h-4 text-amber-400 opacity-60" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={onReactivate}
            title="Reactivate habit"
            className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-700 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Revive
          </button>
          <button
            onClick={onArchive}
            title="Move to archive"
            className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition flex items-center gap-1"
          >
            <Archive className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-zinc-100 mb-1 truncate">{habit.title}</h3>
      {habit.description && (
        <p className="text-xs text-zinc-500 mb-3 truncate">{habit.description}</p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatBadge icon={Flame} label="Best Streak" value={`${habit.longestStreak}d`} color={color} />
        <StatBadge icon={Star} label="Completions" value={habit.completedDates.length} color={color} />
        {habit.completedAt && (
          <StatBadge icon={Calendar} label="Mastered" value={format(parseISO(habit.completedAt), 'MMM d')} color={color} />
        )}
      </div>

      {/* Color accent line */}
      <div className="mt-4 h-1 rounded-full" style={{ background: `${color}30` }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: '100%', background: color }}
        />
      </div>

      {/* Category badge */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">{habit.category}</span>
        <span className="text-[10px] text-zinc-700">·</span>
        <span className="text-[10px] text-zinc-600">{habit.timeSlot}</span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Archived Row
// ─────────────────────────────────────────────────────────────────────────────
function ArchivedRow({
  habit,
  onReactivate,
}: {
  habit: ReturnType<typeof useHabitStore.getState>['habits'][0];
  onReactivate: () => void;
}) {
  const color = HABIT_COLOR_HEX[habit.color] ?? '#10b981';

  return (
    <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 group hover:border-zinc-700 transition">
      <div className="w-3 h-3 rounded-full shrink-0 opacity-50" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-400 truncate">{habit.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-zinc-600">{habit.category}</span>
          <span className="text-[10px] text-zinc-700">·</span>
          <span className="text-[10px] text-zinc-600">{habit.completedDates.length} completions</span>
          <span className="text-[10px] text-zinc-700">·</span>
          <span className="text-[10px] text-zinc-600">Best {habit.longestStreak}d streak</span>
        </div>
      </div>
      <button
        onClick={onReactivate}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 bg-zinc-800 hover:text-emerald-400 hover:bg-zinc-700 transition opacity-0 group-hover:opacity-100"
      >
        <RotateCcw className="w-3 h-3" />
        Reactivate
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Badge
// ─────────────────────────────────────────────────────────────────────────────
function StatBadge({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-lg px-2 py-1">
      <Icon className="w-3 h-3" style={{ color }} />
      <div>
        <p className="text-[9px] text-zinc-600 leading-none">{label}</p>
        <p className="text-xs font-bold text-zinc-300 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({
  icon: Icon,
  title,
  message,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  iconColor: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <div>
        <p className="text-zinc-300 font-semibold mb-1">{title}</p>
        <p className="text-zinc-600 text-sm max-w-xs">{message}</p>
      </div>
    </div>
  );
}
