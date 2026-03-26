import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, Briefcase, Users, AlertTriangle, Trash2 } from 'lucide-react';
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
  }, [initialSchedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;

    if (form.endDate! < form.startDate!) {
      setError('마감일은 시작일보다 빠를 수 없습니다.');
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
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${editingScheduleId ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-primary/10 text-primary'}`}>
            {editingScheduleId ? <CalendarIcon className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">{editingScheduleId ? '일정 수정' : '일정 추가'}</h3>
            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mt-0">
              {editingScheduleId ? 'Edit Schedule' : 'New Schedule'}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50">
          <button 
            type="button"
            onClick={() => setModalTab('event')}
            className={`flex-1 py-1.5 text-[10px] font-black transition-all rounded-lg uppercase tracking-widest ${modalTab === 'event' ? 'bg-primary/90 text-white shadow-md' : 'text-foreground/40 hover:bg-muted/50'}`}
          >
            이벤트
          </button>
          <button 
            type="button"
            onClick={() => setModalTab('task')}
            className={`flex-1 py-1.5 text-[10px] font-black transition-all rounded-lg uppercase tracking-widest ${modalTab === 'task' ? 'bg-zinc-700 text-white shadow-md' : 'text-foreground/40 hover:bg-muted/50'}`}
          >
            할 일
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-xs font-black text-red-500 border border-red-200 dark:border-red-900/50">
            <AlertTriangle className="h-3.5 w-3.5" />
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
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 text-foreground placeholder-foreground/20"
          />
        </div>

        <div className="space-y-3 rounded-2xl bg-muted/40 p-4 border border-border/40">
          <div className="flex items-center justify-between mb-0.5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isAllDay}
                onChange={(e) => setForm({ ...form, isAllDay: e.target.checked })}
                className="peer h-4 w-4 appearance-none rounded border border-border bg-background transition-all checked:bg-primary"
              />
              <span className="text-[11px] font-black text-foreground/70 group-hover:text-foreground">종일 일정 (All-day)</span>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-black text-foreground/90 transition-colors focus:border-primary focus:outline-none"
              />
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.startTime || ''}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-black text-foreground/90 transition-colors focus:border-primary focus:outline-none"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                required
                type="date"
                min={form.startDate}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-black text-foreground/90 transition-colors focus:border-primary focus:outline-none"
              />
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.endTime || ''}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-black text-foreground/90 transition-colors focus:border-primary focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2.5 ml-1">색상</label>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_COLORS.map(color => (
              <button
                key={color.id}
                type="button"
                onClick={() => setForm({ ...form, color: color.id })}
                className={`h-7 w-7 rounded-full transition-all ${color.bg} ${form.color === color.id ? 'ring-2 ring-primary/20 ring-offset-2 scale-110 shadow-md' : 'opacity-80 hover:opacity-100 hover:scale-105'}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'work', label: '실무', icon: <Briefcase className="h-3.5 w-3.5" /> },
            { id: 'meeting', label: '미팅', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'deadline', label: '마감', icon: <AlertTriangle className="h-3.5 w-3.5" /> }
          ].map(type => {
            const isActive = form.type === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setForm({ ...form, type: type.id as Schedule['type'] })}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all duration-300 ${
                  isActive 
                    ? 'border-primary bg-primary/20 text-primary scale-[1.02] shadow-sm ring-2 ring-primary/10' 
                    : 'border-border bg-muted/10 text-foreground/60 hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                {type.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-3 flex items-center justify-between gap-2.5">
          {editingScheduleId && (
            <button
              type="button"
              onClick={() => onDelete(editingScheduleId)}
              className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 px-5 py-3.5 text-[13px] font-black text-red-500 transition-all hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          )}
          <button
            type="submit"
            className="flex-1 rounded-xl bg-primary px-7 py-3.5 text-[13px] font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            {editingScheduleId ? '일정 수정 완료' : '새 일정 저장'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleModal;
