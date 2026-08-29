import Dexie, { type Table } from 'dexie';
import type { Habit, Goal, JournalEntry } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Dexie.js Database — Offline-First IndexedDB
// ─────────────────────────────────────────────────────────────────────────────

export class HabitTrackerDB extends Dexie {
  habits!: Table<Habit, string>;
  goals!: Table<Goal, string>;
  journalEntries!: Table<JournalEntry, string>;

  constructor() {
    super('HabitTrackerDB');
    this.version(1).stores({
      habits:         '&id, category, timeSlot, createdAt',
      goals:          '&id, category, status, createdAt',
      journalEntries: '&id, date, createdAt',
    });
  }
}

export const db = new HabitTrackerDB();

// ─── Habit Operations ──────────────────────────────────────────────────────

export async function dbGetAllHabits(): Promise<Habit[]> {
  return db.habits.orderBy('createdAt').toArray();
}

export async function dbSaveHabit(habit: Habit): Promise<void> {
  await db.habits.put(habit);
}

export async function dbDeleteHabit(id: string): Promise<void> {
  await db.habits.delete(id);
}

// ─── Goal Operations ───────────────────────────────────────────────────────

export async function dbGetAllGoals(): Promise<Goal[]> {
  return db.goals.orderBy('createdAt').toArray();
}

export async function dbSaveGoal(goal: Goal): Promise<void> {
  await db.goals.put(goal);
}

export async function dbDeleteGoal(id: string): Promise<void> {
  await db.goals.delete(id);
}

// ─── Journal Operations ────────────────────────────────────────────────────

export async function dbGetAllJournalEntries(): Promise<JournalEntry[]> {
  return db.journalEntries.orderBy('date').reverse().toArray();
}

export async function dbSaveJournalEntry(entry: JournalEntry): Promise<void> {
  await db.journalEntries.put(entry);
}

export async function dbDeleteJournalEntry(id: string): Promise<void> {
  await db.journalEntries.delete(id);
}
