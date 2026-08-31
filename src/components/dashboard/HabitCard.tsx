import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Flame, Edit2, Archive, CheckCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import type { Habit } from '../../types';
import { useHabitStore } from '../../store/useHabitStore';
import { useAppStore } from '../../store/useAppStore';
import { HABIT_COLOR_HEX, TIME_SLOT_EMOJI } from '../../types';
import { CategoryBadge } from '../ui/Badge';

// ─────────────────────────────────────────────────────────────────────────────
// Habit Card Row
// ─────────────────────────────────────────────────────────────────────────────
interface HabitCardProps {
  habit: Habit;
  showSlot?: boolean;
}

export function HabitCard({ habit, showSlot = false }: HabitCardProps) {
  const { toggleHabit, deleteHabit, markHabitCompleted, archiveHabit, logDailyProgress } = useHabitStore();
  const openHabitCreator = useAppStore((s) => s.openHabitCreator);
  const today = format(new Date(), 'yyyy-MM-dd');
  const isDone = habit.completedDates.includes(today);
  const accentHex = HABIT_COLOR_HEX[habit.color] ?? '#10b981';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'group flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-200',
        isDone
          ? 'bg-zinc-900/40 border-zinc-800/60'
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
      )}
      style={isDone ? { borderColor: `${accentHex}30`, background: `${accentHex}06` } : {}}
      onClick={() => toggleHabit(habit.id, today)}
    >
      {/* Checkbox */}
      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="shrink-0"
      >
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div
              key="done"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: accentHex }} />
            </motion.div>
          ) : (
            <motion.div key="todo" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Circle className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Color dot */}
      <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: isDone ? accentHex : `${accentHex}40` }} />

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={clsx(
              'text-sm font-medium truncate transition-all duration-300',
              isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
            )}>
              {habit.title}
            </p>
            {habit.description && (
              <p className="text-xs text-zinc-600 truncate mt-0.5">{habit.description}</p>
            )}
          </div>
          
          {/* Quick Log Button for Numeric */}
          {habit.habitType === 'numeric_countdown' && habit.numericGoal && habit.numericGoal.remainingUnits > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                logDailyProgress(habit.id, habit.numericGoal!.dailyQuota, today);
              }}
              className="shrink-0 flex items-center gap-1 text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md transition"
            >
              +{habit.numericGoal.dailyQuota} {habit.numericGoal.unitLabel}
            </button>
          )}
        </div>

        {/* Numeric Progress Bar */}
        {habit.habitType === 'numeric_countdown' && habit.numericGoal && (
          <div className="mt-2 mb-1 pr-4">
             <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
               <span>{habit.numericGoal.remainingUnits} {habit.numericGoal.unitLabel} remaining</span>
               <span>{habit.numericGoal.totalUnits - habit.numericGoal.remainingUnits} / {habit.numericGoal.totalUnits}</span>
             </div>
             <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full rounded-full"
                 style={{ background: accentHex }}
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(100, Math.max(0, ((habit.numericGoal.totalUnits - habit.numericGoal.remainingUnits) / habit.numericGoal.totalUnits) * 100))}%` }}
               />
             </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <CategoryBadge category={habit.category} />
          {showSlot && (
            <span className="text-xs text-zinc-600 flex items-center gap-1">
              {TIME_SLOT_EMOJI[habit.timeSlot]} {habit.timeSlot}
            </span>
          )}
          {habit.durationDaysTarget && (
             <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
               Day {habit.completedDates.length}/{habit.durationDaysTarget}
             </span>
          )}
        </div>
      </div>

      {/* Streak */}
      {habit.streak > 0 && (
        <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg shrink-0">
          <Flame className="w-3 h-3" />
          {habit.streak}d
        </div>
      )}

      {/* Edit (on hover) */}
      <motion.button
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
        onClick={(e) => { e.stopPropagation(); openHabitCreator(habit.id); }}
        whileTap={{ scale: 0.9 }}
      >
        <Edit2 className="w-3.5 h-3.5" />
      </motion.button>

      {/* Mark Completed (on hover) */}
      <motion.button
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 transition"
        title="Mark as Completed / Mastered"
        onClick={(e) => { 
          e.stopPropagation(); 
          markHabitCompleted(habit.id); 
          // Micro-confetti effect using basic DOM element
          const confetti = document.createElement('div');
          confetti.innerHTML = '🎉';
          confetti.style.position = 'fixed';
          confetti.style.left = `${e.clientX}px`;
          confetti.style.top = `${e.clientY}px`;
          confetti.style.fontSize = '3rem';
          confetti.style.pointerEvents = 'none';
          confetti.style.transition = 'all 1s cubic-bezier(0.25, 1, 0.5, 1)';
          confetti.style.transform = 'translate(-50%, -50%) scale(0.5)';
          document.body.appendChild(confetti);
          requestAnimationFrame(() => {
            confetti.style.transform = 'translate(-50%, -200px) scale(1.5)';
            confetti.style.opacity = '0';
          });
          setTimeout(() => document.body.removeChild(confetti), 1000);
        }}
        whileTap={{ scale: 0.9 }}
      >
        <CheckCheck className="w-3.5 h-3.5" />
      </motion.button>

      {/* Archive (on hover) */}
      <motion.button
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition"
        title="Archive Habit"
        onClick={(e) => { e.stopPropagation(); archiveHabit(habit.id); }}
        whileTap={{ scale: 0.9 }}
      >
        <Archive className="w-3.5 h-3.5" />
      </motion.button>

      {/* Delete (on hover) */}
      <motion.button
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition"
        onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
        whileTap={{ scale: 0.9 }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  );
}
