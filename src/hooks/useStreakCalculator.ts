import { format, subDays, parseISO } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// Streak Calculator Utility
// ─────────────────────────────────────────────────────────────────────────────

export function calculateStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort((a, b) => b.localeCompare(a));
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  let prev = parseISO(sorted[0]);
  for (let i = 1; i < sorted.length; i++) {
    const curr = parseISO(sorted[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) { streak++; prev = curr; }
    else break;
  }
  return streak;
}

export function getMilestoneThreshold(streak: number): 7 | 30 | 100 | null {
  if (streak >= 100) return 100;
  if (streak >= 30) return 30;
  if (streak >= 7) return 7;
  return null;
}

export function getStreakLabel(streak: number): string {
  if (streak === 0) return 'Start today';
  if (streak === 1) return '1 day';
  return `${streak} days`;
}
