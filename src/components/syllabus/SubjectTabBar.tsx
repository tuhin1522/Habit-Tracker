import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useSyllabusStore, computeSubjectProgress } from '../../store/useSyllabusStore';
import { SubjectModal } from './SubjectModal';
import type { Subject } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// SubjectTabBar — Horizontal subject switcher with progress bars
// ─────────────────────────────────────────────────────────────────────────────

export function SubjectTabBar() {
  const { subjects, activeSubjectId, setActiveSubject, addSubject, updateSubject, deleteSubject } = useSyllabusStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  return (
    <div className="flex items-center gap-2 px-6 pt-5 pb-0 overflow-x-auto">
      {subjects.map((subject) => {
        const pct = computeSubjectProgress(subject);
        const isActive = subject.id === activeSubjectId;

        return (
          <div key={subject.id} className="relative group">
            <button
              onClick={() => setActiveSubject(subject.id)}
              className={clsx(
                'relative flex flex-col items-start gap-1.5 px-4 pt-2.5 pb-2 rounded-t-xl border-b-2 transition-all duration-200 min-w-[120px]',
                isActive
                  ? 'bg-zinc-900 border-b-0 border border-zinc-700 text-zinc-100'
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
              )}
              style={isActive ? { borderBottomColor: 'transparent' } : {}}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="subject-tab-active"
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: subject.themeColor }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: subject.themeColor }}
                />
                <span className="text-sm font-semibold whitespace-nowrap">{subject.name}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: subject.themeColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[10px] font-bold" style={{ color: subject.themeColor }}>
                {pct}% mastered
              </span>
            </button>

            {/* Hover edit/delete controls */}
            <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-0.5 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); setEditingSubject(subject); }}
                className="w-5 h-5 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700 transition"
                title="Edit subject"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
              {subjects.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id); }}
                  className="w-5 h-5 flex items-center justify-center rounded text-zinc-600 hover:text-rose-400 hover:bg-zinc-700 transition"
                  title="Delete subject"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Subject */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-medium shrink-0 ml-1"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Subject
      </button>

      {/* Modals */}
      <SubjectModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={addSubject}
        title="Add Subject"
      />

      {editingSubject && (
        <SubjectModal
          isOpen={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          onSave={(name, color) => updateSubject(editingSubject.id, { name, themeColor: color })}
          initial={{ name: editingSubject.name, themeColor: editingSubject.themeColor }}
          title="Edit Subject"
        />
      )}
    </div>
  );
}
