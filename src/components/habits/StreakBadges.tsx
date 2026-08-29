import { MilestoneBadge } from '../ui/Badge';
import { useHabitStore } from '../../store/useHabitStore';

// ─────────────────────────────────────────────────────────────────────────────
// Streak Milestone Badges — 7 / 30 / 100 day shields
// ─────────────────────────────────────────────────────────────────────────────
export function StreakBadges() {
  const habits = useHabitStore((s) => s.habits);
  const maxStreak = Math.max(0, ...habits.map((h) => h.streak));

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">Streak Milestones</h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Current best streak: <span className="text-amber-400 font-semibold">{maxStreak} days</span>
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MilestoneBadge days={7}   unlocked={maxStreak >= 7}   />
        <MilestoneBadge days={30}  unlocked={maxStreak >= 30}  />
        <MilestoneBadge days={100} unlocked={maxStreak >= 100} />
      </div>
    </div>
  );
}
