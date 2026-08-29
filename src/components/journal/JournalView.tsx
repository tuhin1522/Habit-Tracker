import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useJournalStore } from '../../store/useJournalStore';
import { useHabitStore } from '../../store/useHabitStore';
import { MoodSlider } from './MoodSlider';
import { JournalPrompts } from './JournalPrompts';

// ─────────────────────────────────────────────────────────────────────────────
// Journal Page
// ─────────────────────────────────────────────────────────────────────────────
export default function JournalView() {
  const { todayEntry, entries, saveEntry } = useJournalStore();
  const habits = useHabitStore((s) => s.habits);
  const today = format(new Date(), 'yyyy-MM-dd');

  const [keptPromises, setKeptPromises] = useState('');
  const [distractionNo, setDistractionNo] = useState('');
  const [keyWin, setKeyWin] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [saved, setSaved] = useState(false);

  // Pre-fill from today's entry if it exists
  useEffect(() => {
    if (todayEntry) {
      setKeptPromises(todayEntry.keptPromises);
      setDistractionNo(todayEntry.distractionNo);
      setKeyWin(todayEntry.keyWin);
      setNotes(todayEntry.notes ?? '');
      setMood(todayEntry.mood);
      setEnergy(todayEntry.energy);
    }
  }, [todayEntry]);

  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const completionPct = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;

  const handleSave = async () => {
    await saveEntry({ date: today, keptPromises, distractionNo, keyWin, notes, mood, energy });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100">Daily Reflection</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {format(new Date(), 'EEEE, MMMM do')} · {completionPct}% habit completion
          </p>
        </div>
        <BookOpen className="w-6 h-6 text-zinc-600" />
      </div>

      {/* Today's stats banner */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
          {completionPct >= 80 ? '🔥' : completionPct >= 50 ? '💪' : '😤'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-200">
            {completedToday} of {habits.length} habits completed
          </p>
          <div className="mt-1.5 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
        <span className="text-2xl font-bold text-emerald-400">{completionPct}%</span>
      </div>

      {/* Reflection Prompts */}
      <JournalPrompts
        keptPromises={keptPromises}
        distractionNo={distractionNo}
        keyWin={keyWin}
        onChangeKeptPromises={setKeptPromises}
        onChangeDistractionNo={setDistractionNo}
        onChangeKeyWin={setKeyWin}
      />

      {/* Mood & Energy */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-5">
        <p className="text-sm font-semibold text-zinc-200">How do you feel?</p>
        <MoodSlider label="Mood" emoji="😊" value={mood} onChange={setMood} color="#10b981" />
        <MoodSlider label="Energy" emoji="⚡" value={energy} onChange={setEnergy} color="#f59e0b" />
      </div>

      {/* Free Notes */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-zinc-200">Additional Notes</p>
        <textarea
          rows={3}
          placeholder="Anything else on your mind today…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-transparent border border-zinc-800 focus:border-zinc-700 text-zinc-300 text-sm px-3 py-2.5 rounded-xl placeholder:text-zinc-700 transition"
        />
      </div>

      {/* Save Button */}
      <motion.button
        id="journal-save-btn"
        onClick={handleSave}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-2xl font-semibold text-sm transition flex items-center justify-center gap-2"
        style={{
          background: saved ? 'rgba(16,185,129,0.15)' : '#10b981',
          color: saved ? '#10b981' : '#000',
          border: saved ? '1px solid rgba(16,185,129,0.4)' : 'none',
        }}
      >
        {saved ? (
          <><CheckCircle2 className="w-4 h-4" /> Reflection Saved!</>
        ) : (
          <><Save className="w-4 h-4" /> Save Today's Reflection</>
        )}
      </motion.button>

      {/* Past Entries */}
      {entries.filter((e) => e.date !== today).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Past Entries</h2>
          {entries.filter((e) => e.date !== today).slice(0, 7).map((entry) => (
            <div key={entry.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400">
                  {format(new Date(entry.date), 'EEEE, MMM d')}
                </span>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-400">😊 {entry.mood}/10</span>
                  <span className="text-amber-400">⚡ {entry.energy}/10</span>
                </div>
              </div>
              {entry.keyWin && (
                <p className="text-xs text-zinc-500 line-clamp-2">
                  <span className="text-zinc-400">🏆</span> {entry.keyWin}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
