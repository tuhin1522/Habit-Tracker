import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from './nanoid';
import { format } from 'date-fns';
import type { TimeSession } from '../types';
import { dbGetAllTimeSessions, dbSaveTimeSession, dbDeleteTimeSession } from '../db/database';

interface FocusStore {
  // Timer State
  isRunning: boolean;
  startTime: number | null;
  accumulatedTime: number; // in milliseconds
  activeHabitId: string | null;
  activeTitle: string;
  dailyTargetHours: number;
  
  // Data State
  sessions: TimeSession[];
  isLoaded: boolean;

  // Actions
  loadSessions: () => Promise<void>;
  toggleTimer: () => void;
  resetTimer: () => void;
  saveSession: () => Promise<void>;
  setSessionConfig: (habitId: string | null, title: string) => void;
  setDailyTargetHours: (hours: number) => void;
  deleteSession: (id: string) => Promise<void>;
}

export const useFocusStore = create<FocusStore>()(
  persist(
    (set, get) => ({
      isRunning: false,
      startTime: null,
      accumulatedTime: 0,
      activeHabitId: null,
      activeTitle: 'Focus Session',
      dailyTargetHours: 4,
      
      sessions: [],
      isLoaded: false,

      loadSessions: async () => {
        const sessions = await dbGetAllTimeSessions();
        set({ sessions, isLoaded: true });
      },

      toggleTimer: () => {
        const { isRunning, startTime, accumulatedTime } = get();
        if (isRunning) {
          // Pause
          const now = Date.now();
          const sessionElapsed = startTime ? now - startTime : 0;
          set({
            isRunning: false,
            startTime: null,
            accumulatedTime: accumulatedTime + sessionElapsed,
          });
        } else {
          // Play
          set({
            isRunning: true,
            startTime: Date.now(),
          });
        }
      },

      resetTimer: () => {
        set({
          isRunning: false,
          startTime: null,
          accumulatedTime: 0,
        });
      },

      saveSession: async () => {
        const { isRunning, startTime, accumulatedTime, activeHabitId, activeTitle } = get();
        
        let totalElapsedMs = accumulatedTime;
        if (isRunning && startTime) {
          totalElapsedMs += (Date.now() - startTime);
        }

        const durationSeconds = Math.floor(totalElapsedMs / 1000);
        
        // Don't save empty sessions (less than 10 seconds)
        if (durationSeconds < 10) {
          get().resetTimer();
          return;
        }

        const session: TimeSession = {
          id: nanoid(),
          habitId: activeHabitId || undefined,
          title: activeTitle.trim() || 'Focus Session',
          durationSeconds,
          dateStr: format(new Date(), 'yyyy-MM-dd'),
          timestamp: new Date().toISOString(),
        };

        await dbSaveTimeSession(session);
        set((state) => ({
          sessions: [...state.sessions, session],
          isRunning: false,
          startTime: null,
          accumulatedTime: 0,
        }));
      },

      setSessionConfig: (habitId, title) => {
        set({ activeHabitId: habitId, activeTitle: title });
      },

      setDailyTargetHours: (hours) => {
        set({ dailyTargetHours: hours });
      },

      deleteSession: async (id) => {
        await dbDeleteTimeSession(id);
        set((state) => ({ sessions: state.sessions.filter(s => s.id !== id) }));
      }
    }),
    {
      name: 'focus-storage',
      partialize: (state) => ({
        isRunning: state.isRunning,
        startTime: state.startTime,
        accumulatedTime: state.accumulatedTime,
        activeHabitId: state.activeHabitId,
        activeTitle: state.activeTitle,
        dailyTargetHours: state.dailyTargetHours,
      }), // only persist timer state, not db sessions
    }
  )
);
