import { create } from 'zustand';
import { nanoid } from './nanoid';
import type { Goal } from '../types';
import { dbGetAllGoals, dbSaveGoal, dbDeleteGoal } from '../db/database';
import { addMonths, format } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// Goal Store
// ─────────────────────────────────────────────────────────────────────────────
function seedGoals(): Goal[] {
  const threeMonths = format(addMonths(new Date(), 3), 'yyyy-MM-dd');
  const sixMonths   = format(addMonths(new Date(), 6), 'yyyy-MM-dd');
  return [
    {
      id: nanoid(),
      title: 'Build 90-Day Discipline Protocol',
      description: 'Complete all daily habits for 90 consecutive days with zero missed days.',
      category: 'Mindset',
      targetDate: threeMonths,
      progress: 5,
      status: 'active',
      weeklyTarget: 'Complete 7/7 days this week with no misses',
      milestones: [
        { id: nanoid(), title: '7-day perfect week', completed: false },
        { id: nanoid(), title: '30-day streak achieved', completed: false },
        { id: nanoid(), title: '60-day streak achieved', completed: false },
        { id: nanoid(), title: '90-day protocol complete', completed: false },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      title: 'Read 12 Books This Quarter',
      description: 'Average 1 book per week across mindset, skills, and philosophy.',
      category: 'Skills',
      targetDate: threeMonths,
      progress: 8,
      status: 'active',
      weeklyTarget: 'Finish 1 book per week, minimum 20 pages/day',
      milestones: [
        { id: nanoid(), title: '3 books completed', completed: false },
        { id: nanoid(), title: '6 books completed', completed: false },
        { id: nanoid(), title: '9 books completed', completed: false },
        { id: nanoid(), title: '12 books completed', completed: false },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      title: 'Launch Side Project',
      description: 'Design, build, and ship a product to at least 100 users.',
      category: 'Productivity',
      targetDate: sixMonths,
      progress: 20,
      status: 'active',
      weeklyTarget: '10+ hours of deep work on the project',
      milestones: [
        { id: nanoid(), title: 'Idea validated & scoped', completed: true },
        { id: nanoid(), title: 'MVP built & tested', completed: false },
        { id: nanoid(), title: 'First 10 users onboarded', completed: false },
        { id: nanoid(), title: '100 users milestone', completed: false },
      ],
      createdAt: new Date().toISOString(),
    },
  ];
}

interface GoalStore {
  goals: Goal[];
  isLoaded: boolean;
  loadGoals: () => Promise<void>;
  addGoal: (data: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  updateProgress: (goalId: string, progress: number) => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  isLoaded: false,

  loadGoals: async () => {
    let goals = await dbGetAllGoals();
    if (goals.length === 0) {
      const seeds = seedGoals();
      for (const g of seeds) await dbSaveGoal(g);
      goals = seeds;
    }
    set({ goals, isLoaded: true });
  },

  addGoal: async (data) => {
    const goal: Goal = { ...data, id: nanoid(), createdAt: new Date().toISOString() };
    await dbSaveGoal(goal);
    set((s) => ({ goals: [...s.goals, goal] }));
  },

  updateGoal: async (id, updates) => {
    const goals = get().goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    const updated = goals.find((g) => g.id === id)!;
    await dbSaveGoal(updated);
    set({ goals });
  },

  deleteGoal: async (id) => {
    await dbDeleteGoal(id);
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
  },

  toggleMilestone: async (goalId, milestoneId) => {
    const goals = get().goals.map((g) => {
      if (g.id !== goalId) return g;
      const milestones = g.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const completedCount = milestones.filter((m) => m.completed).length;
      const progress = milestones.length
        ? Math.round((completedCount / milestones.length) * 100)
        : g.progress;
      return { ...g, milestones, progress };
    });
    const updated = goals.find((g) => g.id === goalId)!;
    await dbSaveGoal(updated);
    set({ goals });
  },

  updateProgress: async (goalId, progress) => {
    const goals = get().goals.map((g) => (g.id === goalId ? { ...g, progress } : g));
    const updated = goals.find((g) => g.id === goalId)!;
    await dbSaveGoal(updated);
    set({ goals });
  },
}));
