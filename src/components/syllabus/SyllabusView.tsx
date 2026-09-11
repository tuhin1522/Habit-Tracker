import { useMemo } from 'react';
import { GraduationCap, BookCheck, Layers, CheckCircle2, Circle } from 'lucide-react';
import { useSyllabusStore, computeChapterStatus, computeSubjectProgress } from '../../store/useSyllabusStore';
import { SubjectTabBar } from './SubjectTabBar';
import { ChapterMatrix } from './ChapterMatrix';

// ─────────────────────────────────────────────────────────────────────────────
// SyllabusView — Main Academic Preparation Matrix Page
// ─────────────────────────────────────────────────────────────────────────────
export default function SyllabusView() {
  const { subjects, activeSubjectId, isLoaded } = useSyllabusStore();
  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!activeSubject) return { total: 0, notStarted: 0, inProgress: 0, mastered: 0, resourcesDone: 0, resourcesTotal: 0 };
    const chapters = activeSubject.chapters;
    const total = chapters.length;
    const numCols = activeSubject.resourceColumns?.length ?? 4;
    let notStarted = 0, inProgress = 0, mastered = 0, resourcesDone = 0;
    const resourcesTotal = total * numCols;

    for (const c of chapters) {
      const status = computeChapterStatus(c);
      if (status === 'not_started') notStarted++;
      else if (status === 'in_progress') inProgress++;
      else mastered++;

      resourcesDone += Object.values(c.resources || {}).filter(Boolean).length;
    }

    return { total, notStarted, inProgress, mastered, resourcesDone, resourcesTotal };
  }, [activeSubject]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b]">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-zinc-800 flex items-start justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100">Academic Matrix</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-semibold">
              Preparation Tracker
            </span>
          </div>
          <p className="text-xs text-zinc-600 ml-10.5">
            Track chapter coverage · resources · revision passes per subject
          </p>
        </div>

        {/* Stats row */}
        {activeSubject && (
          <div className="flex items-center gap-3">
            {[
              { icon: Circle,       label: 'Not Started', value: stats.notStarted, color: 'text-zinc-500'  },
              { icon: Layers,       label: 'In Progress',  value: stats.inProgress, color: 'text-amber-400' },
              { icon: CheckCircle2, label: 'Mastered',     value: stats.mastered,   color: 'text-emerald-400' },
              { icon: BookCheck,    label: 'Resources',    value: `${stats.resourcesDone}/${stats.resourcesTotal}`, color: 'text-cyan-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 min-w-[70px]">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className={`text-base font-black ${color}`}>{value}</span>
                <span className="text-[9px] text-zinc-600 uppercase tracking-wide font-semibold">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Subject Tab Bar ──────────────────────────────── */}
      <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/30">
        <SubjectTabBar />
        {/* Tab bottom connector */}
        <div className="h-px" />
      </div>

      {/* ── Matrix Grid ──────────────────────────────────── */}
      {activeSubject ? (
        <div className="flex-1 overflow-hidden flex flex-col pt-4">
          {/* Chapter count badge */}
          <div className="px-6 pb-3 flex items-center gap-2 shrink-0">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: activeSubject.themeColor }}
            />
            <span className="text-sm font-semibold text-zinc-300">{activeSubject.name}</span>
            <span className="text-xs text-zinc-600">
              · {activeSubject.chapters.length} chapter{activeSubject.chapters.length !== 1 ? 's' : ''}
              {stats.total > 0 && ` · ${computeSubjectProgress(activeSubject)}% mastered`}
            </span>
            <div className="flex-1 h-px bg-zinc-800 ml-2" />
          </div>

          {/* The matrix */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChapterMatrix subject={activeSubject} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <GraduationCap className="w-12 h-12 text-zinc-700" />
          <p className="text-zinc-500 text-sm">No subjects yet. Add one using the tab bar above.</p>
        </div>
      )}
    </div>
  );
}
