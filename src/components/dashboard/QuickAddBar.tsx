import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { useAppStore } from '../../store/useAppStore';
import type { TimeSlot, HabitCategory } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Quick Add Bar (also triggered by Ctrl+N)
// ─────────────────────────────────────────────────────────────────────────────
export function QuickAddBar() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Health');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('Morning');
  const { addHabit } = useHabitStore();
  const { isQuickAddOpen, closeQuickAdd } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickAddOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isQuickAddOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addHabit({ title: title.trim(), category, timeSlot, frequency: 'daily', color: 'emerald' });
    setTitle('');
    closeQuickAdd();
  };

  return (
    <AnimatePresence>
      {isQuickAddOpen && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4"
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-[#1c1c1f] border border-zinc-700 rounded-2xl shadow-2xl p-4 space-y-3"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.1)' }}
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Quick add habit… (Enter to save, Esc to close)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
              />
              <button type="button" onClick={closeQuickAdd} className="text-zinc-600 hover:text-zinc-400 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="bg-zinc-800 text-xs text-zinc-300 border border-zinc-700 rounded-lg px-2 py-1.5 outline-none"
              >
                {(['Health','Mindset','Skills','Productivity','Other'] as HabitCategory[]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                className="bg-zinc-800 text-xs text-zinc-300 border border-zinc-700 rounded-lg px-2 py-1.5 outline-none"
              >
                {(['Morning','Afternoon','Evening','Night'] as TimeSlot[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!title.trim()}
                className="ml-auto flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Habit
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
