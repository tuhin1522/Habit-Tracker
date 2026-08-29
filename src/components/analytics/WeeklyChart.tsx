import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subDays, format } from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';

// ─────────────────────────────────────────────────────────────────────────────
// Weekly Completion Bar Chart
// ─────────────────────────────────────────────────────────────────────────────
export function WeeklyChart() {
  const habits = useHabitStore((s) => s.habits);

  const data = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const total = habits.length;
      const completed = habits.filter((h) => h.completedDates.includes(dateStr)).length;
      const pct = total ? Math.round((completed / total) * 100) : 0;
      return {
        day: format(date, 'EEE'),
        dateStr,
        completed,
        total,
        pct,
        isToday: i === 6,
      };
    });
  }, [habits]);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">7-Day Completion</h3>
      <p className="text-xs text-zinc-500 mb-4">Daily habit completion rate this week</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs shadow-xl">
                  <p className="font-semibold text-zinc-200">{d.day} — {d.pct}%</p>
                  <p className="text-zinc-400">{d.completed}/{d.total} habits</p>
                </div>
              );
            }}
          />
          <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isToday ? '#10b981' : entry.pct >= 80 ? '#059669' : entry.pct >= 50 ? '#f59e0b' : '#27272a'}
                opacity={entry.pct === 0 ? 0.4 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
