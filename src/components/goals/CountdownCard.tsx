import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Check, X, Flame, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';
import { HABIT_COLOR_HEX } from '../../types';
import type { Habit } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// CountdownCard — Numeric Decrement Goal
// ─────────────────────────────────────────────────────────────────────────────

interface CountdownCardProps {
  habit: Habit;
}

export function CountdownCard({ habit }: CountdownCardProps) {
  const { logDailyProgress, updateHabit } = useHabitStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const g = habit.numericGoal!;
  const color = HABIT_COLOR_HEX[habit.color] ?? '#10b981';
  const pct = g.totalUnits > 0 ? Math.round(((g.totalUnits - g.remainingUnits) / g.totalUnits) * 100) : 100;
  const today = format(new Date(), 'yyyy-MM-dd');
  const doneToday = habit.completedDates.includes(today);

  const handleDailyDone = async () => {
    if (g.remainingUnits <= 0) return;
    await logDailyProgress(habit.id, g.dailyQuota, today);
    // Check if just hit 0
    if (g.remainingUnits - g.dailyQuota <= 0) setShowComplete(true);
  };

  // SVG ring
  const R = 38;
  const circ = 2 * Math.PI * R;
  const dash = (pct / 100) * circ;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-200 relative overflow-hidden"
      >
        {/* Background glow */}
        <div
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-[0.06] blur-2xl"
          style={{ background: color }}
        />

        <div className="flex items-start gap-4">
          {/* Circular ring */}
          <div className="relative shrink-0">
            <svg width="92" height="92" className="-rotate-90">
              <circle cx="46" cy="46" r={R} fill="none" stroke="#27272a" strokeWidth="7" />
              <circle
                cx="46" cy="46" r={R}
                fill="none"
                stroke={color}
                strokeWidth="7"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${color}88)`,
                  transition: 'stroke-dasharray 0.6s ease',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black" style={{ color }}>{pct}%</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-bold text-zinc-100 truncate">{habit.title}</h3>
              <button
                onClick={() => setShowEdit(true)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Remaining */}
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-3xl font-black" style={{ color }}>{g.remainingUnits.toLocaleString()}</span>
              <span className="text-sm text-zinc-500 font-medium">/ {g.totalUnits.toLocaleString()} {g.unitLabel} remaining</span>
            </div>

            {/* Streak + quota */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-lg px-2.5 py-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">{habit.streak}d streak</span>
              </div>
              <span className="text-xs text-zinc-600">{g.dailyQuota} {g.unitLabel}/day quota</span>
            </div>

            {/* Action button */}
            {g.remainingUnits > 0 ? (
              <button
                onClick={handleDailyDone}
                disabled={doneToday}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  doneToday
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'text-white hover:opacity-90 active:scale-[0.98]'
                }`}
                style={doneToday ? {} : { background: color, boxShadow: `0 0 16px ${color}44` }}
              >
                {doneToday
                  ? `✓ Done today (+${g.dailyQuota} ${g.unitLabel})`
                  : `+${g.dailyQuota} ${g.unitLabel} Done Today`
                }
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                🎉 Goal Complete!
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <EditModal
        isOpen={showEdit}
        habit={habit}
        onClose={() => setShowEdit(false)}
        onSave={(total, remaining, quota) => {
          updateHabit(habit.id, {
            numericGoal: { ...g, totalUnits: total, remainingUnits: remaining, dailyQuota: quota },
          });
          setShowEdit(false);
        }}
      />

      {/* Celebration Modal */}
      <AnimatePresence>
        {showComplete && (
          <CelebrationModal onClose={() => setShowComplete(false)} habit={habit} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Modal
// ─────────────────────────────────────────────────────────────────────────────
function EditModal({
  isOpen,
  habit,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  habit: Habit;
  onClose: () => void;
  onSave: (total: number, remaining: number, quota: number) => void;
}) {
  const g = habit.numericGoal!;
  const [total, setTotal]     = useState(String(g.totalUnits));
  const [remaining, setRemaining] = useState(String(g.remainingUnits));
  const [quota, setQuota]     = useState(String(g.dailyQuota));

  const handleSave = () => {
    const t = Math.max(1, parseInt(total) || g.totalUnits);
    const r = Math.max(0, Math.min(t, parseInt(remaining) || g.remainingUnits));
    const q = Math.max(1, parseInt(quota) || g.dailyQuota);
    onSave(t, r, q);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="relative z-10 w-full max-w-sm bg-[#18181b] border border-zinc-700 rounded-2xl p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-zinc-100">Edit Goal: {habit.title}</h3>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200"><X className="w-4 h-4" /></button>
            </div>
            {[
              { label: 'Total Units', value: total, set: setTotal },
              { label: 'Remaining', value: remaining, set: setRemaining },
              { label: `Daily Quota (${g.unitLabel}/day)`, value: quota, set: setQuota },
            ].map(({ label, value, set }) => (
              <div key={label} className="mb-4">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
            ))}
            <div className="flex gap-2 mt-5">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Celebration Modal
// ─────────────────────────────────────────────────────────────────────────────
function CelebrationModal({ onClose, habit }: { onClose: () => void; habit: Habit }) {
  const color = HABIT_COLOR_HEX[habit.color] ?? '#10b981';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-md bg-[#18181b] border border-zinc-700 rounded-3xl p-8 shadow-2xl text-center overflow-hidden"
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Glow */}
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 30%, ${color}, transparent 70%)` }} />

        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>

        <PartyPopper className="w-8 h-8 mx-auto mb-2" style={{ color }} />
        <h2 className="text-2xl font-black text-zinc-100 mb-2">Goal Achieved!</h2>
        <p className="text-zinc-400 text-sm mb-6">
          You completed <span className="font-bold" style={{ color }}>{habit.numericGoal?.totalUnits} {habit.numericGoal?.unitLabel}</span>!<br/>
          That's an incredible achievement.
        </p>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 bg-zinc-800 rounded-xl px-3 py-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">{habit.streak}d streak</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-800 rounded-xl px-3 py-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">{habit.longestStreak}d best</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-white font-bold text-base transition"
          style={{ background: color }}
        >
          Celebrate! 🏆
        </button>
      </motion.div>
    </div>
  );
}
