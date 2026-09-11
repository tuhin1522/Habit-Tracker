import Dexie, { type Table } from 'dexie';
import type { Habit, Goal, JournalEntry, TimeSession, Subject } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Dexie.js Database — Offline-First IndexedDB
// ─────────────────────────────────────────────────────────────────────────────

export class HabitTrackerDB extends Dexie {
  habits!: Table<Habit, string>;
  goals!: Table<Goal, string>;
  journalEntries!: Table<JournalEntry, string>;
  timeSessions!: Table<TimeSession, string>;
  subjects!: Table<Subject, string>;

  constructor() {
    super('HabitTrackerDB');
    this.version(1).stores({
      habits:         '&id, category, timeSlot, createdAt',
      goals:          '&id, category, status, createdAt',
      journalEntries: '&id, date, createdAt',
    });
    this.version(2).stores({
      timeSessions: '&id, dateStr, habitId',
    });
    this.version(3).stores({
      subjects: '&id, createdAt',
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

// ─── TimeSession Operations ────────────────────────────────────────────────
export async function dbGetAllTimeSessions(): Promise<TimeSession[]> {
  return db.timeSessions.orderBy('timestamp').toArray();
}

export async function dbSaveTimeSession(session: TimeSession): Promise<void> {
  await db.timeSessions.put(session);
}

export async function dbDeleteTimeSession(id: string): Promise<void> {
  await db.timeSessions.delete(id);
}

// ─── Subject Operations ────────────────────────────────────────────────────
export async function dbGetAllSubjects(): Promise<Subject[]> {
  return db.subjects.orderBy('createdAt').toArray();
}

export async function dbSaveSubject(subject: Subject): Promise<void> {
  await db.subjects.put(subject);
}

export async function dbDeleteSubject(id: string): Promise<void> {
  await db.subjects.delete(id);
}
