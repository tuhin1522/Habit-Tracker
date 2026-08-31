import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Target, Hash, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useHabitStore } from '../../store/useHabitStore';
import { useAppStore } from '../../store/useAppStore';
import type { HabitCategory, TimeSlot, HabitFrequency } from '../../types';
import { HABIT_COLORS, HABIT_COLOR_HEX } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Full Habit Creator Modal
// ─────────────────────────────────────────────────────────────────────────────
interface HabitCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: HabitCategory[] = ['Health', 'Mindset', 'Skills', 'Productivity', 'Other'];
const SLOTS: TimeSlot[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

type CreatorMode = 'regular' | 'challenge' | 'numeric';

export function HabitCreator({ isOpen, onClose }: HabitCreatorProps) {
  const { addHabit, updateHabit, habits } = useHabitStore();
  const editingHabitId = useAppStore((s) => s.editingHabitId);
  const editHabit = habits.find((h) => h.id === editingHabitId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Health');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('Morning');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [color, setColor] = useState('emerald');
  const [targetValue, setTargetValue] = useState<number | undefined>(undefined);
  
  // New States
  const [creatorMode, setCreatorMode] = useState<CreatorMode>('regular');
  const [durationDaysTarget, setDurationDaysTarget] = useState<number | undefined>(undefined);
  const [totalUnits, setTotalUnits] = useState<number | undefined>(undefined);
  const [dailyQuota, setDailyQuota] = useState<number | undefined>(undefined);
  const [unitLabel, setUnitLabel] = useState<string>('');

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && editHabit) {
      setTitle(editHabit.title);
      setDescription(editHabit.description || '');
      setCategory(editHabit.category);
      setTimeSlot(editHabit.timeSlot);
      setFrequency(editHabit.frequency);
      setColor(editHabit.color);
      setTargetValue(editHabit.targetValue);
      
      if (editHabit.habitType === 'numeric_countdown') {
        setCreatorMode('numeric');
        setTotalUnits(editHabit.numericGoal?.totalUnits);
        setDailyQuota(editHabit.numericGoal?.dailyQuota);
        setUnitLabel(editHabit.numericGoal?.unitLabel || '');
      } else if (editHabit.durationDaysTarget) {
        setCreatorMode('challenge');
        setDurationDaysTarget(editHabit.durationDaysTarget);
      } else {
        setCreatorMode('regular');
      }
    } else if (isOpen) {
      reset();
    }
  }, [isOpen, editHabit]);

  const reset = () => {
    setTitle(''); setDescription(''); setCategory('Health');
    setTimeSlot('Morning'); setFrequency('daily'); setColor('emerald');
    setTargetValue(undefined);
    setCreatorMode('regular');
    setDurationDaysTarget(undefined);
    setTotalUnits(undefined);
    setDailyQuota(undefined);
    setUnitLabel('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const habitType: 'boolean' | 'numeric_countdown' = creatorMode === 'numeric' ? 'numeric_countdown' : 'boolean';
    
    const numericGoal = creatorMode === 'numeric' && totalUnits && dailyQuota && unitLabel
      ? {
          totalUnits,
          remainingUnits: editHabit?.numericGoal?.remainingUnits ?? totalUnits,
          dailyQuota,
          unitLabel
        }
      : undefined;

    const finalDurationDays = creatorMode === 'challenge' ? durationDaysTarget : undefined;

    const habitData = { 
      title: title.trim(), 
      description: description.trim() || undefined, 
      category, 
      timeSlot, 
      frequency, 
      color, 
      targetValue,
      habitType,
      durationDaysTarget: finalDurationDays,
      numericGoal
    };

    if (editHabit) {
      await updateHabit(editHabit.id, habitData);
    } else {
      await addHabit(habitData);
    }
    setLoading(false);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editHabit ? "Edit Habit" : "Create New Habit"} width="max-w-md">
      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
        
        {/* Habit Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Goal Type</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setCreatorMode('regular')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${creatorMode === 'regular' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
            >
              <Target className="w-5 h-5 mb-1.5" />
              <span className="text-xs font-medium">Regular</span>
            </button>
            <button
              type="button"
              onClick={() => setCreatorMode('challenge')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${creatorMode === 'challenge' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
            >
              <Calendar className="w-5 h-5 mb-1.5" />
              <span className="text-xs font-medium">Challenge</span>
            </button>
            <button
              type="button"
              onClick={() => setCreatorMode('numeric')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${creatorMode === 'numeric' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
            >
              <Hash className="w-5 h-5 mb-1.5" />
              <span className="text-xs font-medium">Numeric</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Habit Name *</label>
          <input
            type="text"
            placeholder={creatorMode === 'numeric' ? "e.g. Read 500 Pages" : "e.g. Morning Meditation"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl placeholder:text-zinc-600 focus:border-emerald-500 transition"
          />
        </div>

        {/* Conditional Fields based on mode */}
        {creatorMode === 'challenge' && (
          <div className="space-y-1.5 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Challenge Duration (Days) *</label>
            <input
              type="number"
              min={1}
              required
              placeholder="e.g. 30"
              value={durationDaysTarget ?? ''}
              onChange={(e) => setDurationDaysTarget(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl focus:border-emerald-500 transition"
            />
          </div>
        )}

        {creatorMode === 'numeric' && (
          <div className="space-y-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Target *</label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="e.g. 500"
                  value={totalUnits ?? ''}
                  onChange={(e) => setTotalUnits(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl focus:border-emerald-500 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pages, words"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl focus:border-emerald-500 transition"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Daily Quota *</label>
              <input
                type="number"
                min={1}
                required
                placeholder="e.g. 10"
                value={dailyQuota ?? ''}
                onChange={(e) => setDailyQuota(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl focus:border-emerald-500 transition"
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
          <input
            type="text"
            placeholder="Optional short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl placeholder:text-zinc-600 focus:border-emerald-500 transition"
          />
        </div>

        {/* Category + Slot row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategory)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl focus:border-emerald-500 transition outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Time Slot</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl focus:border-emerald-500 transition outline-none"
            >
              {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Frequency */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl focus:border-emerald-500 transition outline-none"
          >
            <option value="daily">Daily</option>
            <option value="6x/week">6x / Week</option>
            <option value="5x/week">5x / Week</option>
            <option value="4x/week">4x / Week</option>
            <option value="3x/week">3x / Week</option>
            <option value="2x/week">2x / Week</option>
            <option value="1x/week">1x / Week</option>
          </select>
        </div>

        {/* Color */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Color</label>
          <div className="flex gap-2">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="relative w-7 h-7 rounded-full border-2 transition"
                style={{
                  background: HABIT_COLOR_HEX[c],
                  borderColor: color === c ? 'white' : 'transparent',
                  boxShadow: color === c ? `0 0 0 3px ${HABIT_COLOR_HEX[c]}60` : 'none',
                }}
              >
                {color === c && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Target Value (Original feature, leave for compatibility) */}
        {creatorMode === 'regular' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Daily Target Value (optional)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTargetValue((v) => Math.max(1, (v ?? 1) - 1))}
                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={1}
                placeholder="—"
                value={targetValue ?? ''}
                onChange={(e) => setTargetValue(e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2 rounded-xl text-center focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setTargetValue((v) => (v ?? 0) + 1)}
                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={!title.trim() || loading}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold transition"
          >
            {loading ? 'Saving…' : (editHabit ? 'Save Changes' : 'Create Habit')}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
