import { create } from 'zustand';
import { nanoid } from './nanoid';
import { format } from 'date-fns';
import type { Subject, Chapter, ChapterStatus, ResourceColumn } from '../types';
import { dbGetAllSubjects, dbSaveSubject, dbDeleteSubject } from '../db/database';

// ─────────────────────────────────────────────────────────────────────────────
// Default column set — all new subjects start with these
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_RESOURCE_COLUMNS: ResourceColumn[] = [
  { key: 'boardBook',      label: 'Board Book',    bangla: 'বোর্ড বই',    color: 'emerald' },
  { key: 'classCompleted', label: 'Class',         bangla: 'ক্লাস',       color: 'sky'     },
  { key: 'mathPdf',        label: 'Math PDF',      bangla: 'পিডিএফ',      color: 'amber'   },
  { key: 'lectureBook',    label: 'Lecture Guide', bangla: 'লেকচার শীট',  color: 'violet'  },
];

// Cycle through these colors when adding new columns
const COLUMN_COLORS = ['emerald', 'sky', 'amber', 'violet', 'cyan', 'rose'];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export function computeChapterStatus(chapter: Chapter): ChapterStatus {
  const { revisions } = chapter;
  if (revisions.secondPass) return 'mastered';
  const anyResource = Object.values(chapter.resources || {}).some(Boolean);
  if (anyResource || revisions.firstPass) return 'in_progress';
  return 'not_started';
}

export function computeSubjectProgress(subject: Subject): number {
  if (!subject.chapters.length) return 0;
  const mastered = subject.chapters.filter(c => computeChapterStatus(c) === 'mastered').length;
  return Math.round((mastered / subject.chapters.length) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed Data
// ─────────────────────────────────────────────────────────────────────────────
function makeChapter(name: string, order: number, columns: ResourceColumn[]): Chapter {
  const resources: Record<string, boolean> = {};
  for (const col of columns) resources[col.key] = false;
  return {
    id: nanoid(),
    name,
    order,
    resources,
    revisions: { firstPass: false, secondPass: false },
  };
}

function seedSubjects(): Subject[] {
  const now = new Date().toISOString();
  const cols = DEFAULT_RESOURCE_COLUMNS;
  return [
    {
      id: nanoid(), name: 'Physics', themeColor: '#0ea5e9',
      createdAt: now, resourceColumns: cols,
      chapters: [
        makeChapter('Kinematics', 1, cols),
        makeChapter('Laws of Motion', 2, cols),
        makeChapter('Work, Energy & Power', 3, cols),
        makeChapter('Rotational Motion', 4, cols),
        makeChapter('Gravitation', 5, cols),
        makeChapter('Waves & Oscillations', 6, cols),
      ],
    },
    {
      id: nanoid(), name: 'Chemistry', themeColor: '#10b981',
      createdAt: now, resourceColumns: cols,
      chapters: [
        makeChapter('Atomic Structure', 1, cols),
        makeChapter('Chemical Bonding', 2, cols),
        makeChapter('Thermodynamics', 3, cols),
        makeChapter('Equilibrium', 4, cols),
        makeChapter('Electrochemistry', 5, cols),
        makeChapter('Organic Chemistry Basics', 6, cols),
      ],
    },
    {
      id: nanoid(), name: 'Biology', themeColor: '#84cc16',
      createdAt: now, resourceColumns: cols,
      chapters: [
        makeChapter('Cell Structure & Function', 1, cols),
        makeChapter('Biomolecules', 2, cols),
        makeChapter('Photosynthesis', 3, cols),
        makeChapter('Respiration', 4, cols),
        makeChapter('Genetics & Evolution', 5, cols),
        makeChapter('Human Physiology', 6, cols),
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Interface
// ─────────────────────────────────────────────────────────────────────────────
interface SyllabusStore {
  subjects: Subject[];
  activeSubjectId: string | null;
  isLoaded: boolean;

  loadSubjects: () => Promise<void>;
  addSubject: (name: string, themeColor: string) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Pick<Subject, 'name' | 'themeColor'>>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  setActiveSubject: (id: string) => void;

  addChapter: (subjectId: string, name: string) => Promise<void>;
  updateChapterName: (subjectId: string, chapterId: string, name: string) => Promise<void>;
  deleteChapter: (subjectId: string, chapterId: string) => Promise<void>;
  reorderChapter: (subjectId: string, chapterId: string, direction: 'up' | 'down') => Promise<void>;

  toggleResource: (subjectId: string, chapterId: string, resourceKey: string) => Promise<void>;
  toggleRevisionPass: (subjectId: string, chapterId: string, pass: 'firstPass' | 'secondPass') => Promise<void>;

  // Column management
  addResourceColumn: (subjectId: string, label: string, bangla: string) => Promise<void>;
  deleteResourceColumn: (subjectId: string, columnKey: string) => Promise<void>;
  renameResourceColumn: (subjectId: string, columnKey: string, label: string, bangla: string) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Zustand Store
// ─────────────────────────────────────────────────────────────────────────────
export const useSyllabusStore = create<SyllabusStore>((set, get) => ({
  subjects: [],
  activeSubjectId: null,
  isLoaded: false,

  loadSubjects: async () => {
    try {
      let subjects = await dbGetAllSubjects();
      if (subjects.length === 0) {
        const seeds = seedSubjects();
        for (const s of seeds) await dbSaveSubject(s);
        subjects = seeds;
      } else {
        // Migrate: add resourceColumns if missing (older data)
        subjects = subjects.map(s => ({
          ...s,
          resourceColumns: s.resourceColumns?.length ? s.resourceColumns : DEFAULT_RESOURCE_COLUMNS,
        }));
      }
      set({ subjects, isLoaded: true, activeSubjectId: subjects[0]?.id ?? null });
    } catch (err) {
      console.error('Failed to load subjects:', err);
      set({ isLoaded: true });
    }
  },

  addSubject: async (name, themeColor) => {
    const subject: Subject = {
      id: nanoid(), name, themeColor,
      chapters: [],
      resourceColumns: DEFAULT_RESOURCE_COLUMNS,
      createdAt: new Date().toISOString(),
    };
    await dbSaveSubject(subject);
    set((s) => ({ subjects: [...s.subjects, subject], activeSubjectId: subject.id }));
  },

  updateSubject: async (id, updates) => {
    const subjects = get().subjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
    const updated = subjects.find((s) => s.id === id)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },

  deleteSubject: async (id) => {
    await dbDeleteSubject(id);
    const remaining = get().subjects.filter((s) => s.id !== id);
    set({ subjects: remaining, activeSubjectId: remaining[0]?.id ?? null });
  },

  setActiveSubject: (id) => set({ activeSubjectId: id }),

  addChapter: async (subjectId, name) => {
    const subjects = get().subjects.map((s) => {
      if (s.id !== subjectId) return s;
      // Initialize resources for every current column
      const resources: Record<string, boolean> = {};
      for (const col of s.resourceColumns) resources[col.key] = false;
      const chapter: Chapter = {
        id: nanoid(), name, order: s.chapters.length + 1, resources,
        revisions: { firstPass: false, secondPass: false },
      };
      return { ...s, chapters: [...s.chapters, chapter] };
    });
    const updated = subjects.find((s) => s.id === subjectId)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },

  updateChapterName: async (subjectId, chapterId, name) => {
    const subjects = get().subjects.map((s) => {
      if (s.id !== subjectId) return s;
      return { ...s, chapters: s.chapters.map((c) => (c.id === chapterId ? { ...c, name } : c)) };
    });
    const updated = subjects.find((s) => s.id === subjectId)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },

  deleteChapter: async (subjectId, chapterId) => {
    const subjects = get().subjects.map((s) => {
      if (s.id !== subjectId) return s;
      const chapters = s.chapters.filter((c) => c.id !== chapterId).map((c, i) => ({ ...c, order: i + 1 }));
      return { ...s, chapters };
    });
    const updated = subjects.find((s) => s.id === subjectId)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },

  reorderChapter: async (subjectId, chapterId, direction) => {
    const subjects = get().subjects.map((s) => {
      if (s.id !== subjectId) return s;
      const chapters = [...s.chapters];
      const idx = chapters.findIndex((c) => c.id === chapterId);
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= chapters.length) return s;
      [chapters[idx], chapters[newIdx]] = [chapters[newIdx], chapters[idx]];
      return { ...s, chapters: chapters.map((c, i) => ({ ...c, order: i + 1 })) };
    });
    const updated = subjects.find((s) => s.id === subjectId)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },

  toggleResource: async (subjectId, chapterId, resourceKey) => {
    const subjects = get().subjects.map((s) => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: s.chapters.map((c) => {
          if (c.id !== chapterId) return c;
          return { ...c, resources: { ...c.resources, [resourceKey]: !c.resources[resourceKey] } };
        }),
      };
    });
    const updated = subjects.find((s) => s.id === subjectId)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },

  toggleRevisionPass: async (subjectId, chapterId, pass) => {
    const subjects = get().subjects.map((s) => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: s.chapters.map((c) => {
          if (c.id !== chapterId) return c;
          const today = format(new Date(), 'yyyy-MM-dd');
          if (pass === 'firstPass') {
            const newVal = !c.revisions.firstPass;
            return {
              ...c,
              revisions: {
                firstPass: newVal, firstPassDate: newVal ? today : undefined,
                secondPass: newVal ? c.revisions.secondPass : false,
                secondPassDate: newVal ? c.revisions.secondPassDate : undefined,
              },
            };
          } else {
            if (!c.revisions.firstPass) return c;
            const newVal = !c.revisions.secondPass;
            return { ...c, revisions: { ...c.revisions, secondPass: newVal, secondPassDate: newVal ? today : undefined } };
          }
        }),
      };
    });
    const updated = subjects.find((s) => s.id === subjectId)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },

  // ── Column management ──────────────────────────────────────────────────────

  addResourceColumn: async (subjectId, label, bangla) => {
    const subjects = get().subjects.map((s) => {
      if (s.id !== subjectId) return s;
      const key = `col_${nanoid()}`;
      const usedColors = s.resourceColumns.map(c => c.color);
      const color = COLUMN_COLORS.find(c => !usedColors.includes(c)) ?? COLUMN_COLORS[s.resourceColumns.length % COLUMN_COLORS.length];
      const newCol: ResourceColumn = { key, label, bangla, color };
      // Add the new key to all existing chapters with value false
      const chapters = s.chapters.map(c => ({ ...c, resources: { ...c.resources, [key]: false } }));
      return { ...s, resourceColumns: [...s.resourceColumns, newCol], chapters };
    });
    const updated = subjects.find((s) => s.id === subjectId)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },

  deleteResourceColumn: async (subjectId, columnKey) => {
    const subjects = get().subjects.map((s) => {
      if (s.id !== subjectId) return s;
      const resourceColumns = s.resourceColumns.filter(c => c.key !== columnKey);
      // Remove the key from all chapters
      const chapters = s.chapters.map(c => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [columnKey]: _removed, ...rest } = c.resources;
        return { ...c, resources: rest };
      });
      return { ...s, resourceColumns, chapters };
    });
    const updated = subjects.find((s) => s.id === subjectId)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },

  renameResourceColumn: async (subjectId, columnKey, label, bangla) => {
    const subjects = get().subjects.map((s) => {
      if (s.id !== subjectId) return s;
      const resourceColumns = s.resourceColumns.map(c => c.key === columnKey ? { ...c, label, bangla } : c);
      return { ...s, resourceColumns };
    });
    const updated = subjects.find((s) => s.id === subjectId)!;
    await dbSaveSubject(updated);
    set({ subjects });
  },
}));
