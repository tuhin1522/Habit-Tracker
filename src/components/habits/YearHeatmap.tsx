import { useMemo, useState } from 'react';
import { format, subDays, eachDayOfInterval, getDay } from 'date-fns';
import { motion } from 'framer-motion';
import { useHabitStore } from '../../store/useHabitStore';
import { Tooltip } from '../ui/Tooltip';

// ─────────────────────────────────────────────────────────────────────────────
// GitHub-style Year Heatmap
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function YearHeatmap() {
  const habits = useHabitStore((s) => s.habits);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Build day-by-day completion map for the past year
  const { weeks, completionMap, maxCount } = useMemo(() => {
    const today = new Date();
    const yearAgo = subDays(today, 364);
    const allDays = eachDayOfInterval({ start: yearAgo, end: today });

    // Count how many habits were completed per day
    const completionMap: Record<string, number> = {};
    allDays.forEach((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      completionMap[dateStr] = habits.filter((h) => h.completedDates.includes(dateStr)).length;
    });

    const maxCount = Math.max(1, ...Object.values(completionMap));

    // Pad start to Sunday
    const startPad = getDay(yearAgo);
    const paddedDays: (Date | null)[] = [
      ...Array(startPad).fill(null),
      ...allDays,
    ];

    // Chunk into weeks
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }

    return { weeks, completionMap, maxCount };
  }, [habits]);

  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5)  return 2;
    if (ratio <= 0.75) return 3;
    if (ratio < 1)     return 4;
    return 5;
  };

  const totalCompleted = Object.values(completionMap).filter((v) => v > 0).length;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Activity Heatmap</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{totalCompleted} active days in the past year</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600">Less</span>
          {[0,1,2,3,4,5].map((level) => (
            <div key={level} className={`heatmap-cell heatmap-${level}`} />
          ))}
          <span className="text-xs text-zinc-600">More</span>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-[3px] mb-1 ml-7">
        {MONTHS.map((m) => (
          <span key={m} className="text-zinc-600" style={{ fontSize: 9, width: 'calc(100% / 12)' }}>{m}</span>
        ))}
      </div>

      <div className="flex gap-[3px]">
        {/* Weekday labels */}
        <div className="flex flex-col gap-[3px] mr-1">
          {DAYS.map((d, i) => (
            <span key={d} className="text-zinc-700 flex items-center justify-end" style={{ fontSize: 9, height: 13, width: 20 }}>
              {i % 2 !== 0 ? d : ''}
            </span>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-[3px] flex-wrap" style={{ display: 'flex', gap: '3px' }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="heatmap-cell opacity-0" />;
                const dateStr = format(day, 'yyyy-MM-dd');
                const count = completionMap[dateStr] ?? 0;
                const level = getIntensity(count);
                const isHovered = hoveredDate === dateStr;
                return (
                  <Tooltip
                    key={di}
                    content={`${format(day, 'MMM d, yyyy')} · ${count} completed`}
                  >
                    <motion.div
                      className={`heatmap-cell heatmap-${level}`}
                      animate={isHovered ? { scale: 1.4 } : { scale: 1 }}
                      onMouseEnter={() => setHoveredDate(dateStr)}
                      onMouseLeave={() => setHoveredDate(null)}
                    />
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
