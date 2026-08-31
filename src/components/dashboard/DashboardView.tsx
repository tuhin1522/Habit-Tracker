import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format,
  getDay, addMonths, subMonths, getDaysInMonth, isFuture, isToday
} from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';
import { useAppStore } from '../../store/useAppStore';

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Habit Grid Dashboard
// ─────────────────────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export default function DashboardView() {
  const { habits, toggleHabit } = useHabitStore();
  const openHabitCreator = useAppStore((s) => s.openHabitCreator);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Only show active habits in the monthly tracker grid
  const activeHabits = habits.filter(h => h.status === 'active' || !h.status);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group days into weeks (Su-Sa)
  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    let week: (Date | null)[] = Array(getDay(monthStart)).fill(null);
    allDays.forEach((d) => {
      week.push(d);
      if (week.length === 7) { result.push(week); week = []; }
    });
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      result.push(week);
    }
    return result;
  }, [currentMonth]);

  // Per-habit stats for this month
  const habitStats = useMemo(() => {
    return activeHabits.map((h) => {
      const completions = allDays.filter((d) =>
        h.completedDates.includes(format(d, 'yyyy-MM-dd'))
      ).length;
      const goal = daysInMonth;
      const left = Math.max(0, goal - completions);
      const pct = goal ? Math.round((completions / goal) * 100) : 0;
      return { ...h, completions, goal, left, pct };
    });
  }, [habits, currentMonth]);

  // Overall stats
  const totalGoal      = activeHabits.length * daysInMonth;
  const totalCompleted = habitStats.reduce((s, h) => s + h.completions, 0);
  const totalLeft      = Math.max(0, totalGoal - totalCompleted);
  const overallPct     = totalGoal ? Math.round((totalCompleted / totalGoal) * 100) : 0;

  // Daily progress data (bars per day of month)
  const dailyProgress = useMemo(() => {
    return allDays.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const done = activeHabits.filter((h) => h.completedDates.includes(dateStr)).length;
      const pct  = activeHabits.length ? Math.round((done / activeHabits.length) * 100) : 0;
      return { day: format(d, 'd'), pct, done, total: activeHabits.length };
    });
  }, [habits, currentMonth]);

  // Top habits by completion %
  const topHabits = [...habitStats].sort((a, b) => b.pct - a.pct).slice(0, 10);

  const handleToggle = (habitId: string, date: Date) => {
    if (isFuture(date) && !isToday(date)) return;
    toggleHabit(habitId, format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Main Grid Area ───────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[700px] p-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                Habit Tracker
              </div>
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-zinc-500 hover:text-zinc-200 transition p-0.5">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-zinc-200 px-2 min-w-[80px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-zinc-500 hover:text-zinc-200 transition p-0.5">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-zinc-600">
              {activeHabits.length} habits · {daysInMonth} days
            </div>
          </div>

          {/* Grid */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 600 }}>
                {/* Week headers */}
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-zinc-900 border-b border-r border-zinc-800 px-4 py-2 text-left min-w-[160px]">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">My Habits</span>
                    </th>
                    {weeks.map((_, wi) => (
                      <th
                        key={wi}
                        colSpan={7}
                        className="border-b border-r border-zinc-800 py-2 text-center"
                        style={{ background: wi % 2 === 0 ? 'rgba(24,24,27,0.8)' : 'rgba(39,39,42,0.3)' }}
                      >
                        <span className="text-xs font-bold text-zinc-300">Week {wi + 1}</span>
                      </th>
                    ))}
                  </tr>
                  {/* Day-of-week sub-headers */}
                  <tr>
                    <th className="sticky left-0 z-10 bg-zinc-900 border-b border-r border-zinc-800 px-4 py-1.5" />
                    {weeks.map((week, wi) =>
                      week.map((day, di) => {
                        const isTod = day ? isToday(day) : false;
                        return (
                          <th
                            key={`${wi}-${di}`}
                            className="border-b border-zinc-800 py-1.5 text-center"
                            style={{
                              minWidth: 32,
                              background: isTod
                                ? 'rgba(16,185,129,0.15)'
                                : wi % 2 === 0 ? 'rgba(24,24,27,0.8)' : 'rgba(39,39,42,0.3)',
                              borderRight: di === 6 ? '1px solid #3f3f46' : '1px solid #27272a',
                            }}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`text-[9px] font-medium ${isTod ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                {WEEK_DAYS[di]}
                              </span>
                              {day && (
                                <span className={`text-[9px] font-bold ${isTod ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                  {format(day, 'd')}
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })
                    )}
                  </tr>
                </thead>

                {/* Habit rows */}
                <tbody>
                  {activeHabits.length === 0 ? (
                    <tr>
                      <td colSpan={weeks.length * 7 + 1} className="py-12 text-center text-zinc-600 text-sm">
                        No habits yet — add one using the + button in the Habits page
                      </td>
                    </tr>
                  ) : (
                    activeHabits.map((habit) => {
                      return (
                        <tr
                          key={habit.id}
                          className="group hover:bg-zinc-800/20 transition-colors"
                          style={{ borderBottom: '1px solid #1f1f23' }}
                        >
                          {/* Habit name cell */}
                          <td className="sticky left-0 z-10 bg-zinc-900 group-hover:bg-zinc-800/80 border-r border-zinc-800 px-4 py-2 transition-colors">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: colorToHex(habit.color) }}
                              />
                              <span 
                                className="text-xs font-medium text-zinc-300 whitespace-nowrap max-w-[130px] truncate cursor-pointer hover:text-emerald-400 hover:underline"
                                onClick={() => openHabitCreator(habit.id)}
                              >
                                {habit.title}
                              </span>
                            </div>
                          </td>

                          {/* Day cells */}
                          {weeks.map((week, wi) =>
                            week.map((day, di) => {
                              const dateStr = day ? format(day, 'yyyy-MM-dd') : null;
                              const isDone  = dateStr ? habit.completedDates.includes(dateStr) : false;
                              const future  = day ? (isFuture(day) && !isToday(day)) : false;
                              const isTod   = day ? isToday(day) : false;

                              return (
                                <td
                                  key={`${wi}-${di}`}
                                  className="text-center py-1"
                                  style={{
                                    borderRight: di === 6 ? '1px solid #3f3f46' : '1px solid #1f1f23',
                                    background: isTod
                                      ? 'rgba(16,185,129,0.06)'
                                      : wi % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                                  }}
                                >
                                  {day ? (
                                    <button
                                      onClick={() => handleToggle(habit.id, day)}
                                      disabled={future}
                                      className={`w-5 h-5 mx-auto flex items-center justify-center rounded transition-all duration-150 ${
                                        future
                                          ? 'opacity-20 cursor-not-allowed'
                                          : 'hover:scale-110 cursor-pointer'
                                      }`}
                                    >
                                      {isDone ? (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="w-4 h-4 rounded-sm flex items-center justify-center"
                                          style={{ background: colorToHex(habit.color) }}
                                        >
                                          <span className="text-[9px] font-black text-white">✓</span>
                                        </motion.div>
                                      ) : (
                                        <div className="w-4 h-4 rounded-sm border border-zinc-700 hover:border-zinc-500" />
                                      )}
                                    </button>
                                  ) : null}
                                </td>
                              );
                            })
                          )}
                        </tr>
                      );
                    })
                  )}

                  {/* Completion % row */}
                  {activeHabits.length > 0 && (
                    <tr style={{ borderTop: '1px solid #3f3f46' }}>
                      <td className="sticky left-0 z-10 bg-zinc-900 border-r border-zinc-800 px-4 py-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Daily %</span>
                      </td>
                      {weeks.map((week, wi) =>
                        week.map((day, di) => {
                          const dateStr = day ? format(day, 'yyyy-MM-dd') : null;
                          const done    = dateStr ? activeHabits.filter((h) => h.completedDates.includes(dateStr)).length : 0;
                          const pct     = activeHabits.length ? Math.round((done / activeHabits.length) * 100) : 0;
                          return (
                            <td
                              key={`pct-${wi}-${di}`}
                              className="text-center py-2"
                              style={{ borderRight: di === 6 ? '1px solid #3f3f46' : '1px solid #1f1f23' }}
                            >
                              {day && (
                                <span className={`text-[9px] font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-zinc-600'}`}>
                                  {pct}%
                                </span>
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Stats Panel ────────────────────────────────── */}
      <div className="w-72 shrink-0 border-l border-zinc-800 overflow-y-auto bg-zinc-900/40 flex flex-col gap-4 p-4">

        {/* Daily Progress chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">Daily Progress</p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={dailyProgress} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#52525b', fontSize: 8 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs shadow-xl">
                      <p className="text-zinc-200 font-semibold">Day {d.day} — {d.pct}%</p>
                      <p className="text-zinc-400">{d.done}/{d.total} habits</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
                {dailyProgress.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.pct >= 80 ? '#10b981' : d.pct >= 50 ? '#f59e0b' : '#3f3f46'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overall Stats */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">Overall Stats</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              {[
                { label: 'Goal',      value: totalGoal,      color: 'text-zinc-300' },
                { label: 'Completed', value: totalCompleted, color: 'text-emerald-400' },
                { label: 'Left',      value: totalLeft,      color: 'text-zinc-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between bg-zinc-800/60 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] text-zinc-500 font-medium">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="relative">
              <PieChart width={72} height={72}>
                <Pie
                  data={[
                    { value: overallPct },
                    { value: 100 - overallPct },
                  ]}
                  cx={36} cy={36}
                  innerRadius={22} outerRadius={34}
                  startAngle={90} endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#27272a" />
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-black text-emerald-400">{overallPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">Analysis</p>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-zinc-600 border-b border-zinc-800">
                <th className="pb-1.5 text-left font-semibold">Goal</th>
                <th className="pb-1.5 font-semibold">Done</th>
                <th className="pb-1.5 font-semibold">Left</th>
                <th className="pb-1.5 font-semibold w-16">Progress</th>
                <th className="pb-1.5 font-semibold text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {habitStats.map((h) => (
                <tr key={h.id} className="border-b border-zinc-800/50">
                  <td className="py-1.5 text-zinc-400">{h.goal}</td>
                  <td className="text-center text-zinc-300 font-semibold">{h.completions}</td>
                  <td className="text-center text-zinc-500">{h.left}</td>
                  <td className="py-1.5 px-1">
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${h.pct}%`,
                          background: colorToHex(h.color),
                        }}
                      />
                    </div>
                  </td>
                  <td className="text-right font-bold" style={{ color: h.pct >= 80 ? '#10b981' : h.pct >= 50 ? '#f59e0b' : '#71717a' }}>
                    {h.pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top 10 Habits */}
        {topHabits.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">Top Habits</p>
            <div className="space-y-1.5">
              {topHabits.map((h, i) => (
                <div key={h.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-zinc-600 w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-zinc-400 truncate">{h.title}</span>
                      <span className="text-[10px] font-bold ml-1 shrink-0" style={{ color: colorToHex(h.color) }}>
                        {h.pct}%
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${h.pct}%`, background: colorToHex(h.color) }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Map habit color name → hex
function colorToHex(color: string): string {
  const map: Record<string, string> = {
    emerald: '#10b981', violet: '#8b5cf6', sky: '#0ea5e9',
    rose: '#f43f5e', amber: '#f59e0b', default: '#10b981',
  };
  return map[color] ?? map.default;
}
