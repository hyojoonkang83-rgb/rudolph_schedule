import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../Modal';
import { PRESET_COLORS } from './constants';
import { Schedule } from '../../types/project';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingScheduleId: string | null;
  initialSchedule: Partial<Schedule>;
  onSubmit: (scheduleData: Partial<Schedule>) => void;
  onDelete: (id: string) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  editingScheduleId, 
  initialSchedule, 
  onSubmit, 
  onDelete 
}) => {
  const [modalTab, setModalTab] = useState<'event' | 'task'>(initialSchedule.category || 'event');
  const [form, setForm] = useState<Partial<Schedule>>(initialSchedule);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(initialSchedule);
    setModalTab(initialSchedule.category || 'event');
    setError('');
  }, [initialSchedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;

    if (form.endDate! < form.startDate!) {
      setError('마감일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    if (!form.startTime && !form.isAllDay) {
      setError('시간을 설정하거나 종일 일정을 선택해주세요.');
      return;
    }

    onSubmit({
      ...form,
      category: modalTab,
      type: modalTab === 'event' ? (form.type || 'work') : 'deadline'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${editingScheduleId ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-primary/10 text-primary'}`}>
            {editingScheduleId ? <CalendarIcon className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">{editingScheduleId ? '일정 수정' : '일정 추가'}</h3>
            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
              {editingScheduleId ? 'Edit Schedule' : 'New Schedule'}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => setModalTab('event')}
            className={`flex-1 py-1.5 text-[11px] font-black transition-all rounded-lg uppercase tracking-widest ${modalTab === 'event' ? 'bg-primary/90 text-white shadow-md' : 'text-foreground/40 hover:bg-muted/50'}`}
          >
            이벤트
          </button>
          <button
            type="button"
            onClick={() => setModalTab('task')}
            className={`flex-1 py-1.5 text-[11px] font-black transition-all rounded-lg uppercase tracking-widest ${modalTab === 'task' ? 'bg-foreground/90 text-background shadow-md' : 'text-foreground/40 hover:bg-muted/50'}`}
          >
            할 일
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs font-black text-red-500 border border-red-200 dark:border-red-900/50">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1.5 ml-1">일정 제목</label>
          <input
            autoFocus
            required
            type="text"
            placeholder="일정 제목을 입력하세요"
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm font-bold transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="space-y-2 rounded-2xl bg-muted/10 px-4 py-3 border border-border/40">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.isAllDay}
              onChange={(e) => setForm({ ...form, isAllDay: e.target.checked })}
              className="peer h-4 w-4 appearance-none rounded-md border border-border bg-background transition-all checked:bg-primary/80 shrink-0"
            />
            <span className="text-xs font-black text-foreground/50 group-hover:text-foreground">종일 일정 (All-day)</span>
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest w-7 shrink-0">시작</span>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-black text-foreground/80"
              />
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.startTime || ''}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-36 rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-black text-foreground/80"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest w-7 shrink-0">종료</span>
              <input
                required
                type="date"
                min={form.startDate}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-black text-foreground/80"
              />
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.endTime || ''}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-36 rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-black text-foreground/80"
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">색상</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color.id}
                type="button"
                onClick={() => setForm({ ...form, color: color.id })}
                className={`h-6 w-6 rounded-full transition-all ${color.bg} ${form.color === color.id ? 'ring-4 ring-primary/20 scale-110 shadow-md' : 'opacity-80 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1.5 ml-1">메모</label>
          <textarea
            rows={2}
            placeholder="할 일이나 메모를 입력하세요"
            value={form.memo || ''}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm font-medium text-foreground/80 placeholder:text-foreground/30 transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 resize-none"
          />
        </div>

        <div className="pt-1 flex items-center justify-between gap-2">
          {editingScheduleId && (
            <button
              type="button"
              onClick={() => onDelete(editingScheduleId)}
              className="flex items-center gap-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 px-5 py-3 text-xs font-black text-red-500 transition-all hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          )}
          <button
            type="submit"
            className="flex-1 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            {editingScheduleId ? '일정 수정 완료' : '새 일정 저장'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleModal;
