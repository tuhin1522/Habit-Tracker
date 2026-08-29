import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, AlertTriangle, Info } from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useJournalStore } from '../../store/useJournalStore';
import { db } from '../../db/database';

// ─────────────────────────────────────────────────────────────────────────────
// Settings Page
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsView() {
  const habits = useHabitStore((s) => s.habits);
  const goals = useGoalStore((s) => s.goals);
  const entries = useJournalStore((s) => s.entries);
  const [cleared, setCleared] = useState(false);

  const exportData = () => {
    const data = { habits, goals, journalEntries: entries, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = async () => {
    if (!window.confirm('⚠️ This will permanently delete ALL your habits, goals, and journal entries. Are you sure?')) return;
    await db.habits.clear();
    await db.goals.clear();
    await db.journalEntries.clear();
    setCleared(true);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-100">Settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Manage your data and preferences</p>
      </div>

      {/* Stats */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Local Data Summary</h2>
        {[
          { label: 'Habits stored', value: habits.length },
          { label: 'Goals stored', value: goals.length },
          { label: 'Journal entries', value: entries.length },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
            <span className="text-sm text-zinc-400">{label}</span>
            <span className="text-sm font-semibold text-zinc-200">{value}</span>
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-zinc-200">About</h2>
        </div>
        {[
          ['App', 'Self-Discipline · Habit Tracker'],
          ['Stack', 'Tauri + React + TypeScript + Vite'],
          ['Storage', 'Dexie.js (IndexedDB) — 100% Offline'],
          ['Version', '1.0.0'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between items-center py-1.5">
            <span className="text-xs text-zinc-500">{k}</span>
            <span className="text-xs text-zinc-300">{v}</span>
          </div>
        ))}
      </div>

      {/* Export */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-zinc-200 mb-2">Export Data</h2>
        <p className="text-xs text-zinc-500 mb-4">Download all your habits, goals, and journal entries as a JSON backup.</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={exportData}
          id="settings-export-btn"
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium px-4 py-2.5 rounded-xl transition"
        >
          <Download className="w-4 h-4" /> Export JSON Backup
        </motion.button>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-semibold text-rose-400">Danger Zone</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-4">This will permanently erase all stored data. This action cannot be undone.</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={clearAllData}
          disabled={cleared}
          id="settings-clear-btn"
          className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm font-medium px-4 py-2.5 rounded-xl transition disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {cleared ? 'Data cleared, reloading…' : 'Clear All Data'}
        </motion.button>
      </div>
    </div>
  );
}
