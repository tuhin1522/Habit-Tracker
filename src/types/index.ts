// ─────────────────────────────────────────────────────────────────────────────
// Data Models & TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export type HabitCategory = 'Health' | 'Mindset' | 'Skills' | 'Productivity' | 'Other';
export type HabitFrequency = 'daily' | 'weekly' | '1x/week' | '2x/week' | '3x/week' | '4x/week' | '5x/week' | '6x/week';
export type TimeSlot = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type NavPage = 'dashboard' | 'habits' | 'goals' | 'journal' | 'analytics' | 'settings' | 'focus' | 'syllabus' | 'archive';

// ── Time Tracking ──────────────────────────────────────────────────────────
export interface TimeSession {
  id: string;
  habitId?: string;       // Optional link to a specific habit
  subjectId?: string;     // Optional link to an academic subject
  title: string;          // e.g., "English Reading", "Deep Work"
  durationSeconds: number;
  dateStr: string;        // 'YYYY-MM-DD'
  timestamp: string;      // ISO string
}

export interface DailyTimeTarget {
  targetSeconds: number;
}

// ── Habit ──────────────────────────────────────────────────────────────────
export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  timeSlot: TimeSlot;
  frequency: HabitFrequency;
  targetValue?: number; // e.g. 8 glasses of water
  streak: number;
  longestStreak: number;
  color: string;       // tailwind color key: 'emerald' | 'violet' | 'sky' | 'rose' | 'amber'
  completedDates: string[]; // ISO date strings 'YYYY-MM-DD'
  createdAt: string;
  status: 'active' | 'completed' | 'archived';
  completedAt?: string;
  totalDaysTracked: number;

  // Sprint / Numeric properties
  habitType?: 'boolean' | 'numeric_countdown';
  durationDaysTarget?: number;
  numericGoal?: {
    totalUnits: number;
    remainingUnits: number;
    unitLabel: string;
    dailyQuota: number;
  };
}

// ── Goal ───────────────────────────────────────────────────────────────────
export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  targetDate: string; // ISO date 'YYYY-MM-DD'
  progress: number;   // 0–100
  milestones: Milestone[];
  weeklyTarget?: string;
  status: GoalStatus;
  createdAt: string;
}

// ── Journal Entry ──────────────────────────────────────────────────────────
export interface JournalEntry {
  id: string;
  date: string;              // 'YYYY-MM-DD'
  keptPromises: string;      // "Did I keep my promises today?"
  distractionNo: string;     // "What distraction did I say NO to?"
  keyWin: string;            // "Key win of the day"
  mood: number;              // 1–10
  energy: number;            // 1–10
  notes?: string;
  createdAt: string;
}

// ── Academic Syllabus ──────────────────────────────────────────────────────
export type ChapterStatus = 'not_started' | 'in_progress' | 'mastered';

// Flexible per-subject resource columns — keys are arbitrary column IDs
export type ChapterResources = Record<string, boolean>;

// Definition of a resource column stored on the Subject
export interface ResourceColumn {
  key: string;    // unique identifier, e.g. 'boardBook'
  label: string;  // display label, e.g. 'Board Book'
  bangla: string; // Bengali subtitle shown under the label
  color: string;  // bubble color: 'emerald' | 'sky' | 'amber' | 'violet' | 'cyan'
}

export interface ChapterRevisions {
  firstPass: boolean;
  firstPassDate?: string;   // 'YYYY-MM-DD'
  secondPass: boolean;
  secondPassDate?: string;  // 'YYYY-MM-DD'
}

export interface Chapter {
  id: string;
  name: string;
  order: number;
  resources: ChapterResources;
  revisions: ChapterRevisions;
}

export interface Subject {
  id: string;
  name: string;
  themeColor: string; // hex color
  chapters: Chapter[];
  resourceColumns: ResourceColumn[]; // ordered, user-configurable columns
  createdAt: string;
}

// ── Analytics Helpers ──────────────────────────────────────────────────────
export interface DailyCompletionData {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface CategoryData {
  category: HabitCategory;
  completed: number;
  total: number;
  percentage: number;
}

// ── Color Map ──────────────────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Health:       '#10b981', // emerald
  Mindset:      '#8b5cf6', // violet
  Skills:       '#0ea5e9', // sky
  Productivity: '#f59e0b', // amber
  Other:        '#6b7280', // gray
};

export const HABIT_COLORS: string[] = [
  'emerald', 'violet', 'sky', 'rose', 'amber'
];

export const HABIT_COLOR_HEX: Record<string, string> = {
  emerald: '#10b981',
  violet:  '#8b5cf6',
  sky:     '#0ea5e9',
  rose:    '#f43f5e',
  amber:   '#f59e0b',
};

export const TIME_SLOT_EMOJI: Record<TimeSlot, string> = {
  Morning:   '🌅',
  Afternoon: '☀️',
  Evening:   '🌆',
  Night:     '🌙',
};

// Preset subject theme colors
export const SUBJECT_THEME_COLORS: string[] = [
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6366f1', // indigo
];
