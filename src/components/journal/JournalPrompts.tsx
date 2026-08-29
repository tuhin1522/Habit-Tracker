import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Journal Prompt Cards — reusable prompt display component
// ─────────────────────────────────────────────────────────────────────────────
interface PromptCardProps {
  emoji: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  delay?: number;
}

export function PromptCard({ emoji, label, value, placeholder, onChange, delay = 0 }: PromptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <p className="text-sm font-semibold text-zinc-200">{label}</p>
      </div>
      <textarea
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-zinc-800 focus:border-zinc-700 text-zinc-300 text-sm px-3 py-2.5 rounded-xl placeholder:text-zinc-700 transition"
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Journal Prompts Section — three reflection prompts grouped
// ─────────────────────────────────────────────────────────────────────────────
interface JournalPromptsProps {
  keptPromises: string;
  distractionNo: string;
  keyWin: string;
  onChangeKeptPromises: (v: string) => void;
  onChangeDistractionNo: (v: string) => void;
  onChangeKeyWin: (v: string) => void;
}

export function JournalPrompts({
  keptPromises, distractionNo, keyWin,
  onChangeKeptPromises, onChangeDistractionNo, onChangeKeyWin,
}: JournalPromptsProps) {
  return (
    <div className="space-y-4">
      <PromptCard
        emoji="🤝"
        label="Did I keep my promises today?"
        placeholder="Be honest with yourself. What did you commit to and actually do?"
        value={keptPromises}
        onChange={onChangeKeptPromises}
        delay={0}
      />
      <PromptCard
        emoji="🚫"
        label="What distraction did I say NO to?"
        placeholder="Social media? Procrastination? A craving? Document your discipline."
        value={distractionNo}
        onChange={onChangeDistractionNo}
        delay={0.08}
      />
      <PromptCard
        emoji="🏆"
        label="Key win of the day"
        placeholder="No matter how small. What happened today that you're proud of?"
        value={keyWin}
        onChange={onChangeKeyWin}
        delay={0.16}
      />
    </div>
  );
}
