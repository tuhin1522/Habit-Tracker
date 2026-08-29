import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Flame, Target, BookOpen, BarChart3,
  Settings, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import type { NavPage } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS: { page: NavPage; icon: React.ElementType; label: string }[] = [
  { page: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { page: 'habits',     icon: Flame,           label: 'Habits'     },
  { page: 'goals',      icon: Target,          label: 'Goals'      },
  { page: 'journal',    icon: BookOpen,         label: 'Journal'    },
  { page: 'analytics',  icon: BarChart3,        label: 'Analytics'  },
];

export function Sidebar() {
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <motion.aside
      className="relative flex flex-col h-screen bg-[#111113] border-r border-zinc-800 overflow-hidden shrink-0"
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-zinc-800 overflow-hidden">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              className="font-bold text-sm tracking-wide text-zinc-200 whitespace-nowrap overflow-hidden"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              Self-Discipline
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
        {NAV_ITEMS.map(({ page, icon: Icon, label }) => {
          const isActive = activePage === page;
          return (
            <button
              key={page}
              id={`nav-${page}`}
              onClick={() => setActivePage(page)}
              className={clsx(
                'relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 group',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <Icon className={clsx('w-4 h-4 relative shrink-0', isActive ? 'text-emerald-400' : 'group-hover:text-zinc-200')} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    className="relative text-sm font-medium whitespace-nowrap"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Settings + Collapse */}
      <div className="p-2 border-t border-zinc-800 space-y-1">
        <button
          id="nav-settings"
          onClick={() => setActivePage('settings')}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition',
            activePage === 'settings'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                className="text-sm font-medium"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          id="sidebar-toggle"
          onClick={toggleSidebar}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition"
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4 shrink-0" />
            : <ChevronLeft className="w-4 h-4 shrink-0" />
          }
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                className="text-xs font-medium"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
