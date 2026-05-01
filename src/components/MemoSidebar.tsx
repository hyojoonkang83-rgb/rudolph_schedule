import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, StickyNote } from 'lucide-react';
import { useMemos } from '../hooks/useMemos';
import MemoCard from './MemoCard';

interface MemoSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MemoSidebar({ open, onClose }: MemoSidebarProps) {
  const { memos, createMemo, updateMemo, deleteMemo } = useMemos();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="memo-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.aside
            key="memo-sidebar"
            role="dialog"
            aria-label="메모 사이드바"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[360px] max-w-[90vw] flex-col border-l border-border bg-card shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <StickyNote className="h-4 w-4 text-foreground/70" />
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  메모
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  {memos.length}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="메모 사이드바 닫기"
                className="grid h-8 w-8 place-items-center rounded-full text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="px-5 pt-4">
              <button
                type="button"
                onClick={() => createMemo('yellow')}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground/40 hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                새 메모
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {memos.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <StickyNote className="h-8 w-8 text-foreground/20" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    아직 메모가 없습니다
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    상단의 + 새 메모로 추가하세요
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {memos.map((m) => (
                      <MemoCard
                        key={m.id}
                        memo={m}
                        onUpdate={updateMemo}
                        onDelete={deleteMemo}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
