import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl bg-card text-card-foreground p-6 shadow-2xl border border-border"
          >
            <div className="relative">
              {title && (
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex-1">{title}</div>
                  <button
                    onClick={onClose}
                    aria-label="닫기"
                    className="ml-4 rounded-full p-2 text-foreground/40 transition-all hover:bg-muted hover:text-foreground active:scale-90 shrink-0"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              )}
              {!title && (
                <button
                  onClick={onClose}
                  aria-label="닫기"
                  className="absolute top-0 right-0 p-2 text-foreground/40 transition-all hover:bg-muted hover:text-foreground active:scale-90 z-10"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
