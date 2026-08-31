import { create } from 'zustand';
import { nanoid } from './nanoid';
import { format, subDays, parseISO } from 'date-fns';
import type { Habit } from '../types';
import { dbGetAllHabits, dbSaveHabit, dbDeleteHabit } from '../db/database';

// ─────────────────────────────────────────────────────────────────────────────
// Streak Calculator
// ─────────────────────────────────────────────────────────────────────────────
function calculateStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort((a, b) => b.localeCompare(a));
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Streak must include today or yesterday to be active
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  let prev = parseISO(sorted[0]);
  for (let i = 1; i < sorted.length; i++) {
    const curr = parseISO(sorted[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      prev = curr;
    } else {
      break;
    }
  }
  return streak;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Seed Habits
// ─────────────────────────────────────────────────────────────────────────────
function seedHabits(): Habit[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  return [
    { id: nanoid(), title: 'Morning Meditation', description: '10 minutes mindfulness', category: 'Mindset', timeSlot: 'Morning', frequency: 'daily', streak: 1, longestStreak: 1, color: 'violet', completedDates: [today], createdAt: new Date().toISOString(), status: 'active', totalDaysTracked: 0 },
    { id: nanoid(), title: 'Exercise / Workout', description: '30+ min physical activity', category: 'Health', timeSlot: 'Morning', frequency: 'daily', streak: 0, longestStreak: 0, color: 'emerald', completedDates: [], createdAt: new Date().toISOString(), status: 'active', totalDaysTracked: 0 },
    { id: nanoid(), title: 'Read 20 Pages', description: 'Non-fiction or skill book', category: 'Skills', timeSlot: 'Afternoon', frequency: 'daily', streak: 0, longestStreak: 0, color: 'sky', completedDates: [], createdAt: new Date().toISOString(), status: 'active', totalDaysTracked: 0 },
    { id: nanoid(), title: 'Deep Work Block', description: 'No phone, 90-min focus session', category: 'Productivity', timeSlot: 'Afternoon', frequency: 'daily', streak: 0, longestStreak: 0, color: 'amber', completedDates: [], createdAt: new Date().toISOString(), status: 'active', totalDaysTracked: 0 },
    { id: nanoid(), title: 'No Social Media', description: 'Digital discipline', category: 'Mindset', timeSlot: 'Evening', frequency: 'daily', streak: 0, longestStreak: 0, color: 'rose', completedDates: [], createdAt: new Date().toISOString(), status: 'active', totalDaysTracked: 0 },
    { id: nanoid(), title: 'Evening Walk', description: '20 minute walk outside', category: 'Health', timeSlot: 'Evening', frequency: 'daily', streak: 0, longestStreak: 0, color: 'emerald', completedDates: [], createdAt: new Date().toISOString(), status: 'active', totalDaysTracked: 0 },
    { id: nanoid(), title: 'Plan Tomorrow', description: 'Write top 3 tasks for tomorrow', category: 'Productivity', timeSlot: 'Night', frequency: 'daily', streak: 0, longestStreak: 0, color: 'amber', completedDates: [], createdAt: new Date().toISOString(), status: 'active', totalDaysTracked: 0 },
    { id: nanoid(), title: 'Sleep by 11pm', description: '7-8 hours sleep target', category: 'Health', timeSlot: 'Night', frequency: 'daily', streak: 0, longestStreak: 0, color: 'sky', completedDates: [], createdAt: new Date().toISOString(), status: 'active', totalDaysTracked: 0 },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Interface
// ─────────────────────────────────────────────────────────────────────────────
interface HabitStore {
  habits: Habit[];
  isLoaded: boolean;
  loadHabits: () => Promise<void>;
  addHabit: (data: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'completedDates' | 'createdAt' | 'status' | 'totalDaysTracked' | 'completedAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
  markHabitCompleted: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  reactivateHabit: (id: string) => Promise<void>;
  logDailyProgress: (id: string, unitsCompleted: number, dateStr: string) => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  isLoaded: false,

  loadHabits: async () => {
    let habits = await dbGetAllHabits();
    if (habits.length === 0) {
      // Seed defaults on first launch
      const seeds = seedHabits();
      for (const h of seeds) await dbSaveHabit(h);
      habits = seeds;
    }
    set({ habits, isLoaded: true });
  },

  addHabit: async (data) => {
    const habit: Habit = {
      ...data,
      id: nanoid(),
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      status: 'active',
      totalDaysTracked: 0,
    };
    await dbSaveHabit(habit);
    set((s) => ({ habits: [...s.habits, habit] }));
  },

  updateHabit: async (id, updates) => {
    const habits = get().habits.map((h) => (h.id === id ? { ...h, ...updates } : h));
    const updated = habits.find((h) => h.id === id)!;
    await dbSaveHabit(updated);
    set({ habits });
  },

  deleteHabit: async (id) => {
    await dbDeleteHabit(id);
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
  },

  toggleHabit: async (id, date) => {
    const habits = get().habits.map((h) => {
      if (h.id !== id) return h;
      const isCompleted = h.completedDates.includes(date);
      const completedDates = isCompleted
        ? h.completedDates.filter((d) => d !== date)
        : [...h.completedDates, date];
      const streak = calculateStreak(completedDates);
      const longestStreak = Math.max(h.longestStreak, streak);
      
      let status = h.status;
      let completedAt = h.completedAt;
      
      // Auto-complete if day challenge target reached
      if (h.durationDaysTarget && completedDates.length >= h.durationDaysTarget && !isCompleted) {
         status = 'completed';
         completedAt = new Date().toISOString();
      }

      return { ...h, completedDates, streak, longestStreak, status, completedAt };
    });
    const updated = habits.find((h) => h.id === id)!;
    await dbSaveHabit(updated);
    set({ habits });
  },

  markHabitCompleted: async (id) => {
    const habits = get().habits.map((h) => {
      if (h.id !== id) return h;
      // Calculate total days tracked
      const start = parseISO(h.createdAt);
      const diff = Math.round((new Date().getTime() - start.getTime()) / 86400000);
      return { 
        ...h, 
        status: 'completed' as const, 
        completedAt: new Date().toISOString(),
        totalDaysTracked: Math.max(1, diff)
      };
    });
    const updated = habits.find((h) => h.id === id)!;
    await dbSaveHabit(updated);
    set({ habits });
  },

  archiveHabit: async (id) => {
    const habits = get().habits.map((h) => (h.id === id ? { ...h, status: 'archived' as const } : h));
    const updated = habits.find((h) => h.id === id)!;
    await dbSaveHabit(updated);
    set({ habits });
  },

  reactivateHabit: async (id) => {
    const habits = get().habits.map((h) => (h.id === id ? { ...h, status: 'active' as const, completedAt: undefined } : h));
    const updated = habits.find((h) => h.id === id)!;
    await dbSaveHabit(updated);
    set({ habits });
  },

  logDailyProgress: async (id, unitsCompleted, dateStr) => {
    const habits = get().habits.map((h) => {
      if (h.id !== id || h.habitType !== 'numeric_countdown' || !h.numericGoal) return h;
      
      const remainingUnits = Math.max(0, h.numericGoal.remainingUnits - unitsCompleted);
      const isCompletedToday = unitsCompleted >= h.numericGoal.dailyQuota || h.completedDates.includes(dateStr);
      
      let completedDates = h.completedDates;
      if (isCompletedToday && !completedDates.includes(dateStr)) {
        completedDates = [...completedDates, dateStr];
      }
      
      const streak = calculateStreak(completedDates);
      const longestStreak = Math.max(h.longestStreak, streak);
      
      let status = h.status;
      let completedAt = h.completedAt;
      if (remainingUnits <= 0) {
        status = 'completed';
        completedAt = new Date().toISOString();
      }
      
      return { 
        ...h, 
        completedDates, 
        streak, 
        longestStreak,
        status,
        completedAt,
        numericGoal: { ...h.numericGoal, remainingUnits }
      };
    });
    
    const updated = habits.find((h) => h.id === id)!;
    await dbSaveHabit(updated);
    set({ habits });
  },
}));
