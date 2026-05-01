import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isLockedOut, saveAuthToken, verifyPassword } from '../utils/auth';

interface PasswordGateProps {
  onSuccess: () => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tick = () => {
      const lock = isLockedOut();
      setLockRemaining(lock.locked ? Math.ceil(lock.remainingMs / 1000) : 0);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (lockRemaining === 0) {
      inputRef.current?.focus();
    }
  }, [lockRemaining]);

  const locked = lockRemaining > 0;
  const disabled = submitting || locked;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (disabled || !password) return;

    setSubmitting(true);
    setError(null);

    const result = await verifyPassword(password);

    if (result.ok) {
      saveAuthToken();
      setSubmitting(false);
      onSuccess();
      return;
    }

    setError(result.reason ?? '비밀번호가 일치하지 않습니다');
    setShakeKey((k) => k + 1);
    setPassword('');
    setSubmitting(false);

    const lock = isLockedOut();
    if (lock.locked) {
      setLockRemaining(Math.ceil(lock.remainingMs / 1000));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background text-foreground px-6 py-16">
      {/* atmospheric background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 20%, color-mix(in oklab, var(--color-primary) 22%, transparent) 0%, transparent 55%), radial-gradient(circle at 82% 78%, color-mix(in oklab, var(--color-primary) 14%, transparent) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border/80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/80"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* eyebrow */}
        <div className="mb-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          <span className="h-px w-8 bg-border" />
          <span>Private Studio</span>
        </div>

        {/* title block */}
        <h1
          className="text-[44px] leading-[1.05] font-light tracking-tight text-foreground"
          style={{ fontFamily: '"Iowan Old Style", "Apple Garamond", "Cormorant Garamond", Georgia, serif' }}
        >
          Rudolph
          <span className="block italic font-normal text-foreground/80">Schedule</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          디자인 에이전시 일정 관리 — 인가된 스튜디오 멤버에게만 열립니다.
        </p>

        {/* form */}
        <motion.form
          key={shakeKey}
          onSubmit={handleSubmit}
          animate={
            error
              ? { x: [-6, 6, -4, 4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.32 }}
          className="mt-12"
        >
          <label
            htmlFor="rs-password"
            className="block text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-3"
          >
            Access Key
          </label>

          <div className="relative">
            <input
              ref={inputRef}
              id="rs-password"
              type="password"
              autoFocus
              autoComplete="current-password"
              aria-label="비밀번호"
              aria-invalid={Boolean(error)}
              placeholder={locked ? '잠금 중' : '비밀번호 입력'}
              disabled={disabled}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-border focus:border-foreground focus-visible:ring-0 focus-visible:outline-none px-0 py-3 text-lg tracking-wide placeholder:text-muted-foreground/60 disabled:opacity-50 transition-colors"
            />
            <motion.span
              aria-hidden
              className="absolute left-0 bottom-0 h-px bg-foreground"
              initial={false}
              animate={{ width: password ? '100%' : '0%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <button
            type="submit"
            disabled={disabled || !password}
            className="group mt-8 w-full inline-flex items-center justify-between border border-border hover:border-foreground bg-card hover:bg-foreground hover:text-background disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-foreground disabled:hover:border-border px-5 py-4 transition-all duration-300"
          >
            <span className="text-sm tracking-[0.18em] uppercase">
              {submitting ? '확인 중' : locked ? `${lockRemaining}초 후 재시도` : '입장'}
            </span>
            <span
              aria-hidden
              className="text-base translate-x-0 group-hover:translate-x-1 group-disabled:translate-x-0 transition-transform duration-300"
            >
              →
            </span>
          </button>

          <div className="mt-5 min-h-[1.25rem]">
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key={error + shakeKey}
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-[13px] text-rose-500 dark:text-rose-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.form>

        {/* footer */}
        <div className="mt-16 pt-6 border-t border-border/70 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          <span>회사 직원 전용</span>
          <span className="font-mono normal-case tracking-normal">v1.0-α</span>
        </div>
      </motion.div>
    </div>
  );
}
