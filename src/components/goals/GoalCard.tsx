import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Trash2, Calendar, Edit2 } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { clsx } from 'clsx';
import type { Goal } from '../../types';
import { CATEGORY_COLORS } from '../../types';
import { useGoalStore } from '../../store/useGoalStore';
import { useAppStore } from '../../store/useAppStore';
import { CategoryBadge } from '../ui/Badge';

// ─────────────────────────────────────────────────────────────────────────────
// Goal Card
// ─────────────────────────────────────────────────────────────────────────────
interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { toggleMilestone, deleteGoal } = useGoalStore();
  const openGoalCreator = useAppStore((s) => s.openGoalCreator);
  const [expanded, setExpanded] = useState(false);
  const accentColor = CATEGORY_COLORS[goal.category];
  const daysLeft = differenceInDays(parseISO(goal.targetDate), new Date());
  const isOverdue = daysLeft < 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition group"
    >
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-zinc-100 truncate">{goal.title}</h3>
              <CategoryBadge category={goal.category} />
              {goal.status === 'completed' && (
                <span className="text-xs text-emerald-400 font-semibold">✓ Completed</span>
              )}
            </div>
            {goal.description && (
              <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{goal.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => openGoalCreator(goal.id)}
              className="p-1.5 rounded-lg text-zinc-700 hover:text-emerald-400 hover:bg-emerald-500/10 transition opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteGoal(goal.id)}
              className="p-1.5 rounded-lg text-zinc-700 hover:text-rose-400 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mt-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">Progress</span>
            <span className="font-semibold" style={{ color: accentColor }}>{goal.progress}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${accentColor}99, ${accentColor})` }}
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-3 text-xs">
          <div className={clsx('flex items-center gap-1', isOverdue ? 'text-rose-400' : 'text-zinc-500')}>
            <Calendar className="w-3.5 h-3.5" />
            {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
            · {format(parseISO(goal.targetDate), 'MMM d, yyyy')}
          </div>
          {goal.weeklyTarget && (
            <span className="text-zinc-600 truncate">
              📌 {goal.weeklyTarget}
            </span>
          )}
        </div>

        {/* Milestones (expandable) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Milestones</p>
                {goal.milestones.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMilestone(goal.id, m.id)}
                    className="flex items-center gap-2 w-full text-left group/ms"
                  >
                    <AnimatePresence mode="wait">
                      {m.completed ? (
                        <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                        </motion.div>
                      ) : (
                        <motion.div key="todo" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Circle className="w-4 h-4 text-zinc-700 shrink-0 group-hover/ms:text-zinc-500 transition" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span className={clsx('text-xs', m.completed ? 'line-through text-zinc-600' : 'text-zinc-300')}>
                      {m.title}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
