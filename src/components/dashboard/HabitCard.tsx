import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Flame, Edit2 } from 'lucide-react';
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
  const { toggleHabit, deleteHabit } = useHabitStore();
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
      <div className="flex-1 min-w-0">
        <p className={clsx(
          'text-sm font-medium truncate transition-all duration-300',
          isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
        )}>
          {habit.title}
        </p>
        {habit.description && (
          <p className="text-xs text-zinc-600 truncate mt-0.5">{habit.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <CategoryBadge category={habit.category} />
          {showSlot && (
            <span className="text-xs text-zinc-600">
              {TIME_SLOT_EMOJI[habit.timeSlot]} {habit.timeSlot}
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
