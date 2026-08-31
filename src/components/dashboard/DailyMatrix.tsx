import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';
import { TIME_SLOT_EMOJI } from '../../types';
import type { TimeSlot } from '../../types';
import { HabitCard } from './HabitCard';
import { Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

// ─────────────────────────────────────────────────────────────────────────────
// Daily Routine Matrix — four time-slot sections
// ─────────────────────────────────────────────────────────────────────────────
const TIME_SLOTS: TimeSlot[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

const SLOT_CONFIG: Record<TimeSlot, { style: React.CSSProperties }> = {
  Morning:   { style: { background: 'linear-gradient(135deg, rgba(245,158,11,0.06), transparent)', borderColor: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.18)' } },
  Afternoon: { style: { background: 'linear-gradient(135deg, rgba(14,165,233,0.06), transparent)', borderColor: 'rgba(14,165,233,0.18)', border: '1px solid rgba(14,165,233,0.18)' } },
  Evening:   { style: { background: 'linear-gradient(135deg, rgba(139,92,246,0.06), transparent)', borderColor: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.18)' } },
  Night:     { style: { background: 'linear-gradient(135deg, rgba(39,39,42,0.4), transparent)',   borderColor: 'rgba(63,63,70,0.4)',    border: '1px solid rgba(63,63,70,0.4)'    } },
};

export function DailyMatrix() {
  const habits = useHabitStore((s) => s.habits).filter(h => h.status === 'active' || !h.status);
  const openHabitCreator = useAppStore((s) => s.openHabitCreator);
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-5">
      {TIME_SLOTS.map((slot) => {
        const slotHabits = habits.filter((h) => h.timeSlot === slot);
        const completedInSlot = slotHabits.filter((h) => h.completedDates.includes(today)).length;
        const allDone = slotHabits.length > 0 && completedInSlot === slotHabits.length;

        return (
          <div key={slot} className="rounded-2xl p-4" style={SLOT_CONFIG[slot].style}>
            {/* Slot Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{TIME_SLOT_EMOJI[slot]}</span>
                <h3 className="text-sm font-semibold text-zinc-300">{slot}</h3>
                {slotHabits.length > 0 && (
                  <span className="text-xs text-zinc-600">
                    {completedInSlot}/{slotHabits.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {allDone && (
                  <motion.span
                    className="text-xs text-emerald-400 font-semibold"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    ✓ Done
                  </motion.span>
                )}
                <button
                  onClick={() => openHabitCreator()}
                  className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition"
                  title="Add habit to this slot"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Habits list */}
            {slotHabits.length === 0 ? (
              <button
                onClick={() => openHabitCreator()}
                className="w-full py-3 text-xs text-zinc-600 hover:text-zinc-400 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl transition text-center"
              >
                + Add {slot.toLowerCase()} habit
              </button>
            ) : (
              <AnimatePresence>
                <div className="space-y-2">
                  {slotHabits.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </div>
  );
}
