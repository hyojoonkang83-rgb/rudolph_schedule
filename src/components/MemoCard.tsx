import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Memo, MemoColor } from '../types/memo';

interface MemoCardProps {
  memo: Memo;
  onUpdate: (id: string, updates: Partial<Pick<Memo, 'content' | 'color'>>) => void;
  onDelete: (id: string) => void;
}

const COLOR_BG: Record<MemoColor, string> = {
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
  pink: 'bg-pink-100 dark:bg-pink-900/30',
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
  gray: 'bg-gray-100 dark:bg-gray-800',
};

const COLOR_DOT: Record<MemoColor, string> = {
  yellow: 'bg-yellow-300 dark:bg-yellow-500',
  pink: 'bg-pink-300 dark:bg-pink-500',
  blue: 'bg-blue-300 dark:bg-blue-500',
  green: 'bg-green-300 dark:bg-green-500',
  gray: 'bg-gray-300 dark:bg-gray-500',
};

const COLOR_KEYS: MemoColor[] = ['yellow', 'pink', 'blue', 'green', 'gray'];
const DEBOUNCE_MS = 500;

export default function MemoCard({ memo, onUpdate, onDelete }: MemoCardProps) {
  const [draft, setDraft] = useState(memo.content);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setDraft(memo.content);
  }, [memo.id]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (next: string) => {
    setDraft(next);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onUpdate(memo.id, { content: next });
    }, DEBOUNCE_MS);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-xl shadow-sm hover:shadow-md transition-shadow ${COLOR_BG[memo.color]} p-4`}
    >
      <button
        type="button"
        onClick={() => onDelete(memo.id)}
        aria-label="메모 삭제"
        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-card/40 text-foreground/60 opacity-0 transition-opacity hover:bg-card/80 hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <textarea
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="메모를 입력하세요"
        aria-label="메모 내용"
        className="w-full min-h-[100px] resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-0"
        style={{ fontFamily: '"Caveat", "Patrick Hand", "Bradley Hand", cursive' }}
      />

      <div className="mt-3 flex items-center justify-between border-t border-foreground/10 pt-2.5">
        <div className="flex items-center gap-1.5">
          {COLOR_KEYS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onUpdate(memo.id, { color: c })}
              aria-label={`${c} 색상 선택`}
              aria-pressed={memo.color === c}
              className={`h-3.5 w-3.5 rounded-full ${COLOR_DOT[c]} transition-transform hover:scale-110 ${
                memo.color === c
                  ? 'ring-2 ring-foreground/60 ring-offset-1 ring-offset-transparent scale-110'
                  : ''
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-foreground/40">
          {new Date(memo.updatedAt).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </motion.article>
  );
}
