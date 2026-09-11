import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Save, Trash2, Timer, BookOpen, Target, GraduationCap, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useFocusStore } from '../../store/useFocusStore';
import { useHabitStore } from '../../store/useHabitStore';
import { useSyllabusStore } from '../../store/useSyllabusStore';
import { HABIT_COLOR_HEX } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Focus View — Stopwatch + Session Logger
// ─────────────────────────────────────────────────────────────────────────────

function fmtSecs(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusView() {
  const {
    isRunning, startTime, accumulatedTime,
    activeHabitId, activeTitle,
    dailyTargetHours, sessions,
    toggleTimer, resetTimer, saveSession,
    setSessionConfig, setDailyTargetHours, deleteSession,
  } = useFocusStore();

  const habits   = useHabitStore((s) => s.habits);
  const subjects = useSyllabusStore((s) => s.subjects);
  const activeHabits = habits.filter(h => h.status === 'active' || !h.status);

  // Link type: 'habit' | 'subject' | 'none'
  const [linkType, setLinkType] = useState<'none' | 'habit' | 'subject'>('none');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Display ticker
  const [displayTimeMs, setDisplayTimeMs] = useState(accumulatedTime);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      if (isRunning && startTime) {
        setDisplayTimeMs(accumulatedTime + (Date.now() - startTime));
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplayTimeMs(accumulatedTime);
      }
    };
    if (isRunning) rafId = requestAnimationFrame(tick);
    else setDisplayTimeMs(accumulatedTime);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [isRunning, startTime, accumulatedTime]);

  const totalSeconds = Math.floor(displayTimeMs / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Daily aggregation
  const todayStr        = format(new Date(), 'yyyy-MM-dd');
  const todaySessions   = sessions.filter((s) => s.dateStr === todayStr);
  const totalTodaySecs  = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const targetSecs      = (dailyTargetHours || 4) * 3600;
  const progressPct     = Math.min(100, Math.round((totalTodaySecs / targetSecs) * 100));
  const focusHrs        = Math.floor(totalTodaySecs / 3600);
  const focusMins       = Math.floor((totalTodaySecs % 3600) / 60);

  // Handle link type change
  const handleLinkType = (type: typeof linkType) => {
    setLinkType(type);
    if (type === 'none')    setSessionConfig(null, 'Focus Session');
    if (type === 'subject' && selectedSubjectId) {
      const sub = subjects.find(s => s.id === selectedSubjectId);
      if (sub) setSessionConfig(null, sub.name);
    }
  };

  const handleHabitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const habit = habits.find(h => h.id === id);
    setSessionConfig(id || null, habit?.title ?? 'Focus Session');
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedSubjectId(id);
    const sub = subjects.find(s => s.id === id);
    setSessionConfig(null, sub?.name ?? 'Focus Session');
  };

  const isIdle = !isRunning && accumulatedTime === 0;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: Timer ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 min-w-0">

        {/* Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Timer className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100">Focus Timer</h1>
          </div>
          {activeTitle && (
            <p className="text-sm text-zinc-500 font-medium">{activeTitle}</p>
          )}
        </div>

        {/* Timer Display */}
        <div className="relative flex flex-col items-center">
          {/* Outer glow ring */}
          <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isRunning ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', transform: 'scale(1.3)' }}
          />
          <motion.div
            className={`font-mono font-light tracking-tighter tabular-nums select-none transition-all duration-300 ${
              isRunning ? 'text-emerald-400' : 'text-zinc-200'
            }`}
            style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)' }}
            animate={{ scale: isRunning ? 1.03 : 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          >
            {String(hours).padStart(2, '0')}
            <span className={`mx-0.5 ${isRunning ? 'animate-pulse' : ''}`}>:</span>
            {String(minutes).padStart(2, '0')}
            <span className={`mx-0.5 ${isRunning ? 'animate-pulse' : ''}`}>:</span>
            {String(seconds).padStart(2, '0')}
          </motion.div>

          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-3 text-emerald-400 text-sm font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Session in progress
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5">
          <button
            onClick={resetTimer}
            disabled={isIdle}
            title="Reset timer"
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 disabled:opacity-25 transition group"
          >
            <RotateCcw className="w-6 h-6 group-hover:-rotate-90 transition-transform duration-300" />
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTimer}
            className={`p-7 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRunning
                ? 'bg-amber-500/10 border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/20'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]'
            }`}
          >
            {isRunning
              ? <Pause className="w-9 h-9 fill-current" />
              : <Play  className="w-9 h-9 fill-current ml-1" />
            }
          </motion.button>

          <button
            onClick={saveSession}
            disabled={isRunning || accumulatedTime < 10000}
            title="Save session (pause first, min 10s)"
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 disabled:opacity-25 transition"
          >
            <Save className="w-6 h-6" />
          </button>
        </div>

        {/* ── Session Config ─────────────────────────── */}
        <div className="w-full max-w-md space-y-4">
          {/* Link type toggle */}
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {([
              { key: 'none' as const,    label: 'Standalone',     icon: Target },
              { key: 'habit' as const,   label: 'Link to Habit',  icon: BookOpen },
              { key: 'subject' as const, label: 'Link to Subject', icon: GraduationCap },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleLinkType(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                  linkType === key
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Habit selector */}
          <AnimatePresence>
            {linkType === 'habit' && (
              <motion.select
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                value={activeHabitId || ''}
                onChange={handleHabitChange}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-4 py-3 rounded-xl outline-none"
              >
                <option value="">— Choose a habit —</option>
                {activeHabits.map((h) => (
                  <option key={h.id} value={h.id}>{h.title}</option>
                ))}
              </motion.select>
            )}

            {linkType === 'subject' && (
              <motion.select
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                value={selectedSubjectId}
                onChange={handleSubjectChange}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-4 py-3 rounded-xl outline-none"
              >
                <option value="">— Choose a subject —</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </motion.select>
            )}
          </AnimatePresence>

          {/* Session title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Session Title</label>
              <input
                type="text"
                value={activeTitle}
                onChange={(e) => setSessionConfig(activeHabitId, e.target.value)}
                placeholder="What are you working on?"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2.5 rounded-xl outline-none placeholder-zinc-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Daily Target (hours)</label>
              <input
                type="number" min="1" max="24"
                value={dailyTargetHours}
                onChange={(e) => setDailyTargetHours(Number(e.target.value) || 1)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2.5 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Stats + Session Log ────────────────── */}
      <div className="w-80 shrink-0 border-l border-zinc-800 overflow-y-auto bg-zinc-900/30 flex flex-col p-5 gap-5">

        {/* Daily Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Today's Focus</p>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-black text-emerald-400">{focusHrs}h {focusMins}m</span>
          </div>
          <p className="text-[10px] text-zinc-600 mb-3">Target: {dailyTargetHours}h · {progressPct}% complete</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              style={{ boxShadow: '0 0 8px rgba(16,185,129,0.4)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] text-zinc-600 mt-2">{todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''} today</p>
        </div>

        {/* Session History */}
        <div className="flex-1">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Session Log</p>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Clock className="w-8 h-8 text-zinc-700" />
              <p className="text-zinc-600 text-xs">No sessions saved yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...sessions].reverse().slice(0, 30).map((session) => {
                const linkedHabit = session.habitId ? habits.find(h => h.id === session.habitId) : null;
                const habitColor  = linkedHabit ? (HABIT_COLOR_HEX[linkedHabit.color] ?? '#10b981') : '#52525b';
                const isToday     = session.dateStr === todayStr;

                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 group hover:border-zinc-700 transition"
                  >
                    <div className="w-1 h-8 rounded-full shrink-0" style={{ background: habitColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-300 truncate">{session.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-zinc-400">{fmtSecs(session.durationSeconds)}</span>
                        <span className="text-[10px] text-zinc-700">·</span>
                        <span className="text-[10px] text-zinc-600">{isToday ? 'Today' : session.dateStr}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-700 hover:text-rose-400 hover:bg-zinc-800 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
