import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Target } from 'lucide-react';
import { useGoalStore } from '../../store/useGoalStore';
import { GoalCard } from './GoalCard';
import { GoalCreator } from './GoalCreator';

// ─────────────────────────────────────────────────────────────────────────────
// Goals Page View
// ─────────────────────────────────────────────────────────────────────────────
export default function GoalsView() {
  const goals = useGoalStore((s) => s.goals);
  const [isCreatorOpen, setCreatorOpen] = useState(false);
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');

  const filtered = goals.filter((g) => filter === 'all' ? true : g.status === filter);
  const activeCount = goals.filter((g) => g.status === 'active').length;
  const avgProgress = goals.length
    ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
    : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100">Goals & Vision</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {activeCount} active goals · {avgProgress}% avg progress
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setCreatorOpen(true)}
          id="goals-add-btn"
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          <Plus className="w-4 h-4" /> New Goal
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Goals', value: activeCount, cls: 'bg-emerald-500/8 border-emerald-500/20' },
          { label: 'Avg Progress', value: `${avgProgress}%`, cls: 'bg-violet-500/8 border-violet-500/20' },
          { label: 'Total Goals', value: goals.length, cls: 'bg-sky-500/8 border-sky-500/20' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`p-3 rounded-xl border ${cls}`}>
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-xl font-bold text-zinc-100 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['active', 'all', 'completed'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition capitalize ${
              filter === f
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <Target className="w-10 h-10 text-zinc-700" />
            <p className="text-zinc-500 text-sm">No goals yet. What are you working towards?</p>
            <button onClick={() => setCreatorOpen(true)} className="text-emerald-400 text-sm hover:underline">
              Set your first goal →
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}
      </AnimatePresence>

      <GoalCreator isOpen={isCreatorOpen} onClose={() => setCreatorOpen(false)} />
    </div>
  );
}
