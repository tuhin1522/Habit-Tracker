import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useGoalStore } from '../../store/useGoalStore';
import { useAppStore } from '../../store/useAppStore';
import { nanoid } from '../../store/nanoid';
import type { HabitCategory, Milestone } from '../../types';
import { addMonths, format } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// Goal Creator Modal
// ─────────────────────────────────────────────────────────────────────────────
interface GoalCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: HabitCategory[] = ['Health', 'Mindset', 'Skills', 'Productivity', 'Other'];

export function GoalCreator({ isOpen, onClose }: GoalCreatorProps) {
  const { addGoal, updateGoal, goals } = useGoalStore();
  const editingGoalId = useAppStore((s) => s.editingGoalId);
  const editGoal = goals.find((g) => g.id === editingGoalId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Mindset');
  const [targetDate, setTargetDate] = useState(format(addMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [weeklyTarget, setWeeklyTarget] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && editGoal) {
      setTitle(editGoal.title);
      setDescription(editGoal.description || '');
      setCategory(editGoal.category);
      setTargetDate(editGoal.targetDate);
      setWeeklyTarget(editGoal.weeklyTarget || '');
      setMilestones(editGoal.milestones);
    } else if (isOpen) {
      reset();
    }
  }, [isOpen, editGoal]);

  const reset = () => {
    setTitle(''); setDescription(''); setCategory('Mindset');
    setTargetDate(format(addMonths(new Date(), 3), 'yyyy-MM-dd'));
    setWeeklyTarget(''); setMilestones([]); setNewMilestone('');
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones((ms) => [...ms, { id: nanoid(), title: newMilestone.trim(), completed: false }]);
    setNewMilestone('');
  };

  const removeMilestone = (id: string) => setMilestones((ms) => ms.filter((m) => m.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    
    if (editGoal) {
      await updateGoal(editGoal.id, {
        title: title.trim(), description: description.trim() || undefined,
        category, targetDate, milestones,
        weeklyTarget: weeklyTarget.trim() || undefined,
      });
    } else {
      await addGoal({
        title: title.trim(), description: description.trim() || undefined,
        category, targetDate, progress: 0, milestones,
        weeklyTarget: weeklyTarget.trim() || undefined, status: 'active',
      });
    }
    setLoading(false);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={editGoal ? "Edit Goal" : "Set New Goal"} width="max-w-lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Goal Title *</label>
          <input type="text" placeholder="e.g. Build 90-Day Discipline Protocol" value={title}
            onChange={(e) => setTitle(e.target.value)} required
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl placeholder:text-zinc-600 focus:border-emerald-500 transition" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
          <textarea rows={2} placeholder="What does achieving this goal mean to you?" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl placeholder:text-zinc-600 focus:border-emerald-500 transition" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as HabitCategory)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl focus:border-emerald-500 transition outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Date</label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl focus:border-emerald-500 transition" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Weekly Target</label>
          <input type="text" placeholder="What will you do this week to get closer?" value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 rounded-xl placeholder:text-zinc-600 focus:border-emerald-500 transition" />
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Milestones</label>
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl">
              <span className="flex-1 text-sm text-zinc-300">{m.title}</span>
              <button type="button" onClick={() => removeMilestone(m.id)} className="text-zinc-600 hover:text-rose-400 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input type="text" placeholder="Add a milestone…" value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMilestone(); } }}
              className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 rounded-xl placeholder:text-zinc-600 focus:border-emerald-500 transition" />
            <button type="button" onClick={addMilestone}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-zinc-100 transition">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => { reset(); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition">
            Cancel
          </button>
          <motion.button type="submit" disabled={!title.trim() || loading} whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold transition">
            {loading ? 'Saving…' : 'Create Goal'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
