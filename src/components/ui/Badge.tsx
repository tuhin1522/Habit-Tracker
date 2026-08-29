import { motion } from 'framer-motion';
import { Flame, Shield, Trophy, Star } from 'lucide-react';
import { clsx } from 'clsx';

// ─────────────────────────────────────────────────────────────────────────────
// Streak & Achievement Badges
// ─────────────────────────────────────────────────────────────────────────────

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const sizeClass = { sm: 'text-xs px-2 py-0.5', md: 'text-xs px-2.5 py-1', lg: 'text-sm px-3 py-1.5' }[size];
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (streak === 0) return null;

  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full font-semibold', sizeClass,
      'bg-amber-500/10 text-amber-400 border border-amber-500/20')}>
      <Flame className={iconSize} />
      {streak}d
    </span>
  );
}

interface MilestoneBadgeProps {
  days: 7 | 30 | 100;
  unlocked?: boolean;
}

const MILESTONE_CONFIG = {
  7:   { icon: Shield, label: '7-Day Shield',   color: 'sky',     hex: '#0ea5e9' },
  30:  { icon: Trophy, label: '30-Day Trophy',  color: 'violet',  hex: '#8b5cf6' },
  100: { icon: Star,   label: '100-Day Legend', color: 'amber',   hex: '#f59e0b' },
} as const;

export function MilestoneBadge({ days, unlocked = false }: MilestoneBadgeProps) {
  const { icon: Icon, label, hex } = MILESTONE_CONFIG[days];
  return (
    <motion.div
      className={clsx(
        'relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition',
        unlocked
          ? 'bg-zinc-900 border-zinc-700'
          : 'bg-zinc-900/40 border-zinc-800/50 opacity-40 grayscale'
      )}
      initial={false}
      animate={unlocked ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {unlocked && (
        <div
          className="absolute inset-0 rounded-2xl opacity-20 blur-md"
          style={{ background: hex }}
        />
      )}
      <div
        className={clsx('relative p-3 rounded-xl', unlocked ? 'badge-shimmer' : '')}
        style={{ background: unlocked ? `${hex}20` : '#27272a', border: `1px solid ${unlocked ? hex + '40' : '#3f3f46'}` }}
      >
        <Icon className="w-6 h-6" style={{ color: unlocked ? hex : '#52525b' }} />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold" style={{ color: unlocked ? hex : '#52525b' }}>{days} Days</p>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

interface CategoryBadgeProps {
  category: string;
}

const CAT_STYLES: Record<string, string> = {
  Health:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Mindset:      'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Skills:       'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Productivity: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Other:        'bg-zinc-700/30 text-zinc-400 border-zinc-600/20',
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', CAT_STYLES[category] ?? CAT_STYLES.Other)}>
      {category}
    </span>
  );
}
