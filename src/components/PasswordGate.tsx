import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { isLockedOut, saveAuthToken, verifyPassword } from '../utils/auth';

interface PasswordGateProps {
  onSuccess: () => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const lock = isLockedOut();
    if (lock.locked) {
      setLockoutSeconds(Math.ceil(lock.remainingMs / 1000));
    }
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (verifying || lockoutSeconds > 0) return;

    setVerifying(true);
    setError(null);

    const result = await verifyPassword(password);
    setVerifying(false);

    if (result.ok) {
      saveAuthToken();
      onSuccess();
    } else {
      setError(result.reason || '인증에 실패했습니다');
      const lock = isLockedOut();
      if (lock.locked) {
        setLockoutSeconds(Math.ceil(lock.remainingMs / 1000));
      }
      setPassword('');
    }
  };

  const isDisabled = verifying || lockoutSeconds > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl px-8 py-12">
          {/* 로고 */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-3xl font-bold text-white">R</span>
            </div>
          </div>

          {/* 타이틀 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Rudolph Schedule
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              회사 직원 전용입니다.
              <br />
              비밀번호를 입력해주세요.
            </p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              aria-label="비밀번호"
              disabled={isDisabled}
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all"
            />

            {error && (
              <motion.p
                key={error}
                animate={{ x: [-4, 4, -4, 4, 0] }}
                transition={{ duration: 0.3 }}
                className="text-sm text-rose-500 dark:text-rose-400 text-center"
                role="alert"
              >
                {error}
              </motion.p>
            )}

            {lockoutSeconds > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                {lockoutSeconds}초 후 다시 시도하세요
              </p>
            )}

            <button
              type="submit"
              disabled={isDisabled || !password}
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20"
            >
              {verifying ? '확인 중...' : '입장'}
            </button>
          </form>
        </div>

        {/* 푸터 */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Rudolph
        </p>
      </motion.div>
    </div>
  );
}
