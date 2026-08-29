import { useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { useHabitStore } from '../../store/useHabitStore';
import type { HabitCategory } from '../../types';
import { CATEGORY_COLORS } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Category Radar Chart
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES: HabitCategory[] = ['Health', 'Mindset', 'Skills', 'Productivity'];

export function CategoryRadar() {
  const habits = useHabitStore((s) => s.habits);

  const data = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return CATEGORIES.map((cat) => {
      const catHabits = habits.filter((h) => h.category === cat);
      const completed = catHabits.filter((h) => h.completedDates.includes(today)).length;
      const pct = catHabits.length ? Math.round((completed / catHabits.length) * 100) : 0;
      return { category: cat, score: pct, total: catHabits.length };
    });
  }, [habits]);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">Category Breakdown</h3>
      <p className="text-xs text-zinc-500 mb-4">Today's performance by habit category</p>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#71717a', fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs shadow-xl">
                  <p className="font-semibold text-zinc-200">{d.category}</p>
                  <p className="text-zinc-400">{d.score}% · {d.total} habits</p>
                </div>
              );
            }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
            dot={{ fill: '#10b981', r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((d) => (
          <div key={d.category} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[d.category as HabitCategory] }} />
              <span className="text-xs text-zinc-400">{d.category}</span>
            </div>
            <span className="text-xs font-semibold text-zinc-200">{d.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
