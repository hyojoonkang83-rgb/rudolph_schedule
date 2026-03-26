import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "삭제", 
  type = "danger" 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-border"
        >
          <div className="flex flex-col items-center text-center">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-foreground/60 leading-relaxed">
              {message}
            </p>
          </div>
          
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-white dark:bg-zinc-900 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              취소
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
