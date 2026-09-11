import { motion } from 'framer-motion';
import { clsx } from 'clsx';

// ─────────────────────────────────────────────────────────────────────────────
// BubbleIndicator — Clickable circular glow bubble for syllabus tracker
// ─────────────────────────────────────────────────────────────────────────────

interface BubbleIndicatorProps {
  completed: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;       // e.g. "①", "②", or short icon character
  colorClass?: string;  // tailwind: 'emerald' | 'cyan' | 'violet' | 'amber'
  size?: 'sm' | 'md';
  title?: string;
}

const COLOR_MAP = {
  emerald: {
    active: 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    text: 'text-white',
    ring: 'border-emerald-800 text-emerald-800 hover:border-emerald-600 hover:text-emerald-600',
  },
  cyan: {
    active: 'bg-cyan-500 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    text: 'text-white',
    ring: 'border-cyan-800 text-cyan-900 hover:border-cyan-600 hover:text-cyan-600',
  },
  violet: {
    active: 'bg-violet-500 border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]',
    text: 'text-white',
    ring: 'border-violet-800 text-violet-900 hover:border-violet-600 hover:text-violet-600',
  },
  amber: {
    active: 'bg-amber-500 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    text: 'text-white',
    ring: 'border-amber-800 text-amber-900 hover:border-amber-600 hover:text-amber-600',
  },
  sky: {
    active: 'bg-sky-500 border-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.6)]',
    text: 'text-white',
    ring: 'border-sky-800 text-sky-900 hover:border-sky-600 hover:text-sky-600',
  },
};

export function BubbleIndicator({
  completed,
  disabled = false,
  onClick,
  label = '●',
  colorClass = 'emerald',
  size = 'md',
  title,
}: BubbleIndicatorProps) {
  const colors = COLOR_MAP[colorClass as keyof typeof COLOR_MAP] ?? COLOR_MAP.emerald;
  const dim = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-[11px]';

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.82 }}
      whileHover={disabled ? {} : { scale: 1.12 }}
      onClick={disabled ? undefined : onClick}
      title={title}
      className={clsx(
        'rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200 select-none',
        dim,
        disabled
          ? 'opacity-25 cursor-not-allowed border-zinc-800 text-zinc-800'
          : completed
          ? `${colors.active} ${colors.text} cursor-pointer`
          : `${colors.ring} bg-transparent cursor-pointer`
      )}
    >
      {label}
    </motion.button>
  );
}
