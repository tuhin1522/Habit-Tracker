import { clsx } from 'clsx';

// ─────────────────────────────────────────────────────────────────────────────
// Mood & Energy Slider (1–10)
// ─────────────────────────────────────────────────────────────────────────────
interface MoodSliderProps {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
  color?: string;
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Terrible', 2: 'Very Low', 3: 'Low', 4: 'Below Average', 5: 'Neutral',
  6: 'Decent', 7: 'Good', 8: 'Great', 9: 'Excellent', 10: 'Peak',
};

export function MoodSlider({ label, emoji, value, onChange, color = '#10b981' }: MoodSliderProps) {
  const percent = ((value - 1) / 9) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-medium text-zinc-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{MOOD_LABELS[value]}</span>
          <span
            className="text-sm font-bold w-6 text-center"
            style={{ color }}
          >
            {value}
          </span>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="mood-slider"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, #3f3f46 ${percent}%, #3f3f46 100%)`
          }}
        />
        {/* Tick marks */}
        <div className="flex justify-between mt-1 px-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={clsx('text-xs', value === i + 1 ? 'text-zinc-300' : 'text-zinc-700')}>
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
