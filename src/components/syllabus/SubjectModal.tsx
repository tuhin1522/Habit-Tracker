import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette } from 'lucide-react';
import { SUBJECT_THEME_COLORS } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// SubjectModal — Create or Edit a Subject
// ─────────────────────────────────────────────────────────────────────────────

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  initial?: { name: string; themeColor: string };
  title?: string;
}

export function SubjectModal({ isOpen, onClose, onSave, initial, title = 'Add Subject' }: SubjectModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.themeColor ?? SUBJECT_THEME_COLORS[0]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, color);
    setName('');
    setColor(SUBJECT_THEME_COLORS[0]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-sm bg-[#18181b] border border-zinc-700 rounded-2xl p-6 shadow-2xl"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-zinc-100">{title}</h3>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Subject Name
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="e.g. Physics, Chemistry..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500/50 transition"
              />
            </div>

            {/* Color picker */}
            <div className="mb-6">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                <Palette className="w-3.5 h-3.5" />
                Theme Color
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_THEME_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-all duration-150"
                    style={{
                      background: c,
                      borderColor: color === c ? '#fff' : 'transparent',
                      boxShadow: color === c ? `0 0 0 2px ${c}55` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2 mb-5 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="text-sm font-semibold text-zinc-200">{name || 'Subject Name'}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-40"
                style={{ background: color, color: '#fff' }}
              >
                {title === 'Add Subject' ? 'Add Subject' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
