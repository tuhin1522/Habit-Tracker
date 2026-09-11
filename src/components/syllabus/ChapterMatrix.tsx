import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Check, Clock,
  Play, X, Pencil,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSyllabusStore, computeChapterStatus } from '../../store/useSyllabusStore';
import { useFocusStore } from '../../store/useFocusStore';
import { useAppStore } from '../../store/useAppStore';
import { BubbleIndicator } from './BubbleIndicator';
import type { Subject, Chapter } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Status Tag
// ─────────────────────────────────────────────────────────────────────────────
function StatusTag({ chapter }: { chapter: Chapter }) {
  const status = computeChapterStatus(chapter);
  const cfg = {
    not_started: { label: 'Not Started', cls: 'bg-zinc-800 text-zinc-500 border-zinc-700' },
    in_progress:  { label: 'In Progress', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    mastered:     { label: 'Mastered ✓', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  }[status];

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline editable chapter name
// ─────────────────────────────────────────────────────────────────────────────
function EditableChapterName({ subjectId, chapter }: { subjectId: string; chapter: Chapter }) {
  const { updateChapterName } = useSyllabusStore();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(chapter.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== chapter.name) updateChapterName(subjectId, chapter.id, trimmed);
    else setValue(chapter.name);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef} autoFocus value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setValue(chapter.name); setEditing(false); }
        }}
        className="bg-zinc-800 border border-cyan-500/50 rounded-lg px-2 py-0.5 text-sm text-zinc-100 w-full focus:outline-none"
      />
    );
  }

  return (
    <span
      onDoubleClick={() => setEditing(true)}
      className="text-sm font-medium text-zinc-200 cursor-pointer hover:text-cyan-400 transition-colors truncate"
      title="Double-click to edit"
    >
      {chapter.name}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Column Modal
// ─────────────────────────────────────────────────────────────────────────────
function AddColumnModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, bangla: string) => void;
}) {
  const [label, setLabel] = useState('');
  const [bangla, setBangla] = useState('');

  const handleSave = () => {
    if (!label.trim()) return;
    onSave(label.trim(), bangla.trim());
    setLabel('');
    setBangla('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-sm bg-[#18181b] border border-zinc-700 rounded-2xl p-6 shadow-2xl"
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-zinc-100">Add Column</h3>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Column Name
                </label>
                <input
                  autoFocus type="text" value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="e.g. Practice Problems"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500/50 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Bengali Label <span className="text-zinc-600 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text" value={bangla}
                  onChange={(e) => setBangla(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="e.g. অনুশীলন"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500/50 transition outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!label.trim()}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-500 disabled:opacity-40 transition"
              >
                Add Column
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline editable column header
// ─────────────────────────────────────────────────────────────────────────────
function EditableColumnHeader({
  subjectId,
  colKey,
  label,
  bangla,
  onDelete,
}: {
  subjectId: string;
  colKey: string;
  label: string;
  bangla: string;
  onDelete: () => void;
}) {
  const { renameResourceColumn } = useSyllabusStore();
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);
  const [editBangla, setEditBangla] = useState(bangla);

  const commit = () => {
    const trimmed = editLabel.trim();
    if (trimmed) renameResourceColumn(subjectId, colKey, trimmed, editBangla.trim());
    else { setEditLabel(label); setEditBangla(bangla); }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-col items-center gap-1 min-w-[80px]">
        <input
          autoFocus value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditLabel(label); setEditBangla(bangla); setEditing(false); } }}
          className="w-full bg-zinc-800 border border-cyan-500/50 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 text-center focus:outline-none"
        />
        <input
          value={editBangla}
          onChange={(e) => setEditBangla(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); } }}
          placeholder="বাংলা"
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[9px] text-zinc-400 text-center focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div className="relative group/col flex flex-col items-center gap-0.5">
      {/* Delete button — appears on hover */}
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500/80 text-white opacity-0 group-hover/col:opacity-100 hover:bg-rose-500 transition-all z-10"
        title={`Delete "${label}" column`}
      >
        <X className="w-2.5 h-2.5" />
      </button>

      {/* Edit on double-click */}
      <span
        onDoubleClick={() => setEditing(true)}
        className={`text-[9px] font-bold uppercase tracking-wide cursor-pointer hover:text-zinc-200 transition text-zinc-500`}
        title="Double-click to rename"
      >
        {label}
      </span>
      <span className="text-[9px] text-zinc-700">{bangla}</span>

      {/* Tiny edit icon */}
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover/col:opacity-100 transition"
        title="Rename column"
      >
        <Pencil className="w-2 h-2 text-zinc-600 hover:text-zinc-300" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ChapterMatrix
// ─────────────────────────────────────────────────────────────────────────────
interface ChapterMatrixProps {
  subject: Subject;
}

export function ChapterMatrix({ subject }: ChapterMatrixProps) {
  const {
    addChapter, deleteChapter, reorderChapter,
    toggleResource, toggleRevisionPass,
    addResourceColumn, deleteResourceColumn,
  } = useSyllabusStore();
  const { setSessionConfig, toggleTimer, isRunning } = useFocusStore();
  const { setActivePage } = useAppStore();

  const [newChapterName, setNewChapterName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addColumnOpen, setAddColumnOpen] = useState(false);

  const cols = subject.resourceColumns ?? [];
  // Total colspan for the bottom "add chapter" row:
  // # | chapter | ...cols | rev1 | rev2 | status | actions
  const totalCols = 1 + 1 + cols.length + 2 + 1 + 1;

  const handleAddChapter = () => {
    const name = newChapterName.trim();
    if (!name) return;
    addChapter(subject.id, name);
    setNewChapterName('');
    setAdding(false);
  };

  const handleQuickPlay = (chapter: Chapter) => {
    setSessionConfig(null, `${subject.name} — ${chapter.name}`);
    if (!isRunning) toggleTimer();
    setActivePage('focus');
  };

  const handleDeleteColumn = (key: string) => {
    const col = cols.find(c => c.key === key);
    if (!col) return;
    if (!window.confirm(`Delete the "${col.label}" column? This will remove all progress data for this column from every chapter.`)) return;
    deleteResourceColumn(subject.id, key);
  };

  return (
    <>
      <div className="flex-1 overflow-hidden px-6 pb-6 flex flex-col">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex-1 flex flex-col overflow-hidden">
          <div className="overflow-auto flex-1 relative">
            <table className="w-full border-collapse" style={{ minWidth: 600 + cols.length * 90 }}>

              {/* ── Header ──────────────────────────────────────────── */}
              <thead className="sticky top-0 z-20">
                <tr className="shadow-[0_1px_0_0_#27272a]">

                  {/* Order */}
                  <th className="w-10 px-3 py-3 bg-zinc-900 border-r border-zinc-800 text-center sticky top-0 z-20">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">#</span>
                  </th>

                  {/* Chapter Name */}
                  <th className="sticky left-0 top-0 z-30 bg-zinc-900 border-r border-zinc-800 px-4 py-3 text-left min-w-[200px]">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chapter / Topic</span>
                  </th>

                  {/* Dynamic resource columns */}
                  {cols.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-3 bg-zinc-900 border-r border-zinc-800 text-center min-w-[90px] sticky top-0 z-20"
                    >
                      <EditableColumnHeader
                        subjectId={subject.id}
                        colKey={col.key}
                        label={col.label}
                        bangla={col.bangla}
                        onDelete={() => handleDeleteColumn(col.key)}
                      />
                    </th>
                  ))}

                  {/* Add column button */}
                  <th className="px-2 py-3 bg-zinc-900 border-r border-zinc-800 text-center w-10 sticky top-0 z-20">
                    <button
                      onClick={() => setAddColumnOpen(true)}
                      title="Add a new column"
                      className="w-6 h-6 mx-auto flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 hover:border-cyan-500/60 text-zinc-600 hover:text-cyan-400 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </th>

                  {/* Revision 1 */}
                  <th className="px-3 py-3 bg-zinc-900 border-r border-zinc-800 text-center min-w-[70px] sticky top-0 z-20">
                    <div className="flex flex-col items-center gap-0.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Rev 1st</span>
                      <span className="text-[9px] text-zinc-700">রিভিশন ১</span>
                    </div>
                  </th>

                  {/* Revision 2 */}
                  <th className="px-3 py-3 bg-zinc-900 border-r border-zinc-800 text-center min-w-[70px] sticky top-0 z-20">
                    <div className="flex flex-col items-center gap-0.5">
                      <Check className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Rev 2nd</span>
                      <span className="text-[9px] text-zinc-700">রিভিশন ২</span>
                    </div>
                  </th>

                  {/* Status */}
                  <th className="px-3 py-3 bg-zinc-900 border-r border-zinc-800 text-center min-w-[100px] sticky top-0 z-20">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Status</span>
                  </th>

                  {/* Row Actions */}
                  <th className="px-2 py-3 bg-zinc-900 text-center w-24 sticky top-0 z-20">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase">Actions</span>
                  </th>
                </tr>
              </thead>

              {/* ── Body ────────────────────────────────────────────── */}
              <tbody>
                <AnimatePresence initial={false}>
                  {subject.chapters.map((chapter, idx) => {
                    const isMastered = computeChapterStatus(chapter) === 'mastered';
                    return (
                      <motion.tr
                        key={chapter.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={clsx(
                          'group border-b border-zinc-800/60 transition-colors',
                          isMastered ? 'bg-emerald-500/[0.03]' : 'hover:bg-zinc-800/20'
                        )}
                      >
                        {/* Order # */}
                        <td className="px-3 py-2.5 border-r border-zinc-800/60 text-center">
                          <span className="text-[11px] font-bold text-zinc-600">{idx + 1}</span>
                        </td>

                        {/* Chapter Name */}
                        <td className="sticky left-0 z-10 bg-zinc-900 group-hover:bg-zinc-800/60 border-r border-zinc-800/60 px-4 py-2.5 transition-colors">
                          <EditableChapterName subjectId={subject.id} chapter={chapter} />
                        </td>

                        {/* Dynamic resource bubbles */}
                        {cols.map((col) => (
                          <td key={col.key} className="px-3 py-2.5 border-r border-zinc-800/60 text-center">
                            <div className="flex justify-center">
                              <BubbleIndicator
                                completed={!!(chapter.resources && chapter.resources[col.key])}
                                onClick={() => toggleResource(subject.id, chapter.id, col.key)}
                                colorClass={col.color}
                                label={(chapter.resources && chapter.resources[col.key]) ? '✓' : '○'}
                                title={`${col.label}: ${(chapter.resources && chapter.resources[col.key]) ? 'Done' : 'Pending'}`}
                              />
                            </div>
                          </td>
                        ))}

                        {/* Empty cell under the + column button */}
                        <td className="border-r border-zinc-800/60" />

                        {/* Revision 1 */}
                        <td className="px-3 py-2.5 border-r border-zinc-800/60 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <BubbleIndicator
                              completed={chapter.revisions.firstPass}
                              onClick={() => toggleRevisionPass(subject.id, chapter.id, 'firstPass')}
                              colorClass="cyan"
                              label="①"
                              title={chapter.revisions.firstPassDate ? `Done: ${chapter.revisions.firstPassDate}` : 'Mark 1st revision done'}
                            />
                            {chapter.revisions.firstPassDate && (
                              <span className="text-[9px] text-zinc-600">{chapter.revisions.firstPassDate.slice(5)}</span>
                            )}
                          </div>
                        </td>

                        {/* Revision 2 */}
                        <td className="px-3 py-2.5 border-r border-zinc-800/60 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <BubbleIndicator
                              completed={chapter.revisions.secondPass}
                              disabled={!chapter.revisions.firstPass}
                              onClick={() => toggleRevisionPass(subject.id, chapter.id, 'secondPass')}
                              colorClass="violet"
                              label="②"
                              title={!chapter.revisions.firstPass ? 'Complete 1st revision first' : chapter.revisions.secondPassDate ? `Done: ${chapter.revisions.secondPassDate}` : 'Mark 2nd revision done'}
                            />
                            {chapter.revisions.secondPassDate && (
                              <span className="text-[9px] text-zinc-600">{chapter.revisions.secondPassDate.slice(5)}</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5 border-r border-zinc-800/60 text-center">
                          <div className="flex justify-center">
                            <StatusTag chapter={chapter} />
                          </div>
                        </td>

                        {/* Row actions */}
                        <td className="px-2 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleQuickPlay(chapter)}
                              title="Start focus session for this chapter"
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition"
                            >
                              <Play className="w-2.5 h-2.5 fill-cyan-400" />
                            </button>
                            <button
                              onClick={() => reorderChapter(subject.id, chapter.id, 'up')}
                              disabled={idx === 0}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700 transition disabled:opacity-20"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => reorderChapter(subject.id, chapter.id, 'down')}
                              disabled={idx === subject.chapters.length - 1}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700 transition disabled:opacity-20"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteChapter(subject.id, chapter.id)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-700 hover:text-rose-400 hover:bg-zinc-700 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>

                {/* ── Add Chapter Row ─────────────────────────────── */}
                <tr className="border-t border-zinc-700/50">
                  <td colSpan={totalCols} className="px-4 py-3">
                    <AnimatePresence mode="wait">
                      {adding ? (
                        <motion.div
                          key="input"
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <input
                            autoFocus type="text" value={newChapterName}
                            onChange={(e) => setNewChapterName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddChapter();
                              if (e.key === 'Escape') { setAdding(false); setNewChapterName(''); }
                            }}
                            placeholder="Chapter name… (Enter to save, Esc to cancel)"
                            className="flex-1 bg-zinc-800 border border-cyan-500/40 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            onClick={handleAddChapter}
                            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-xl text-sm font-semibold hover:bg-cyan-500/30 transition"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => { setAdding(false); setNewChapterName(''); }}
                            className="px-3 py-2 text-zinc-600 hover:text-zinc-300 text-sm transition"
                          >
                            Cancel
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="button"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          onClick={() => setAdding(true)}
                          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-300 transition group"
                        >
                          <div className="w-6 h-6 rounded-lg border-2 border-dashed border-zinc-700 group-hover:border-zinc-500 flex items-center justify-center transition">
                            <Plus className="w-3 h-3" />
                          </div>
                          Add chapter / topic
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Column Modal */}
      <AddColumnModal
        isOpen={addColumnOpen}
        onClose={() => setAddColumnOpen(false)}
        onSave={(label, bangla) => addResourceColumn(subject.id, label, bangla)}
      />
    </>
  );
}
