import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { subDays, format } from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';

// ─────────────────────────────────────────────────────────────────────────────
// 30-Day Monthly Trend Area Chart
// ─────────────────────────────────────────────────────────────────────────────
export function MonthlyTrend() {
  const habits = useHabitStore((s) => s.habits);

  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const total = habits.length;
      const completed = habits.filter((h) => h.completedDates.includes(dateStr)).length;
      const pct = total ? Math.round((completed / total) * 100) : 0;
      return { date: format(date, 'MMM d'), pct };
    });
  }, [habits]);

  const avg = Math.round(data.reduce((s, d) => s + d.pct, 0) / data.length);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">30-Day Trend</h3>
          <p className="text-xs text-zinc-500">Rolling completion rate</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-emerald-400">{avg}%</p>
          <p className="text-xs text-zinc-500">30-day avg</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#52525b', fontSize: 10 }}
            axisLine={false} tickLine={false}
            interval={4}
          />
          <YAxis domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs shadow-xl">
                  <p className="font-semibold text-zinc-200">{d.date}</p>
                  <p className="text-emerald-400">{d.pct}% completed</p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="pct"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#trendGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#10b981', stroke: '#09090b', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
