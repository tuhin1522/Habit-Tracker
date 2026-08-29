import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Simple Tooltip wrapper
// ─────────────────────────────────────────────────────────────────────────────
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => { timeout.current = setTimeout(() => setVisible(true), 300); };
  const hide = () => { if (timeout.current) clearTimeout(timeout.current); setVisible(false); };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            className={`absolute ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 z-50 whitespace-nowrap`}
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
          >
            <div className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg shadow-xl">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
