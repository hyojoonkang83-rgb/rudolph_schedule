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
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${editingScheduleId ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-primary/10 text-primary'}`}>
            {editingScheduleId ? <CalendarIcon className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-xl font-black text-foreground">{editingScheduleId ? '일정 수정' : '일정 추가'}</h3>
            <p className="text-[11px] font-black text-foreground/30 uppercase tracking-[0.2em] mt-0.5">
              {editingScheduleId ? 'Edit Schedule' : 'New Schedule'}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/50">
          <button 
            type="button"
            onClick={() => setModalTab('event')}
            className={`flex-1 py-2.5 text-xs font-black transition-all rounded-xl uppercase tracking-widest ${modalTab === 'event' ? 'bg-primary/90 text-white shadow-lg' : 'text-foreground/40 hover:bg-muted/50'}`}
          >
            이벤트
          </button>
          <button 
            type="button"
            onClick={() => setModalTab('task')}
            className={`flex-1 py-2.5 text-xs font-black transition-all rounded-xl uppercase tracking-widest ${modalTab === 'task' ? 'bg-zinc-700 text-white shadow-lg' : 'text-foreground/40 hover:bg-muted/50'}`}
          >
            할 일
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-950/30 p-4 text-xs font-black text-red-500 border border-red-200 dark:border-red-900/50">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">일정 제목</label>
          <input
            autoFocus
            required
            type="text"
            placeholder="일정 제목을 입력하세요"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-2xl border border-border bg-muted/20 dark:bg-zinc-800/20 px-5 py-4 text-sm font-bold transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="space-y-4 rounded-[1.5rem] bg-muted/10 p-5 border border-border/40">
          <div className="flex items-center justify-between mb-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isAllDay}
                onChange={(e) => setForm({ ...form, isAllDay: e.target.checked })}
                className="peer h-5 w-5 appearance-none rounded-lg border border-border bg-background transition-all checked:bg-primary/80"
              />
              <span className="text-xs font-black text-foreground/50 group-hover:text-foreground">종일 일정 (All-day)</span>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="flex-1 rounded-xl border border-border/60 bg-background px-4 py-3.5 text-xs font-black text-foreground/80"
              />
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.startTime || ''}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-32 rounded-xl border border-border/60 bg-background px-4 py-3.5 text-xs font-black text-foreground/80"
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                required
                type="date"
                min={form.startDate}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="flex-1 rounded-xl border border-border/60 bg-background px-4 py-3.5 text-xs font-black text-foreground/80"
              />
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.endTime || ''}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-32 rounded-xl border border-border/60 bg-background px-4 py-3.5 text-xs font-black text-foreground/80"
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-3 ml-1">색상</label>
          <div className="flex flex-wrap gap-3">
            {PRESET_COLORS.map(color => (
              <button
                key={color.id}
                type="button"
                onClick={() => setForm({ ...form, color: color.id })}
                className={`h-8 w-8 rounded-full transition-all ${color.bg} ${form.color === color.id ? 'ring-4 ring-primary/20 scale-110 shadow-lg' : 'opacity-80 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'work', label: '실무', icon: <Briefcase className="h-4 w-4" /> },
            { id: 'meeting', label: '미팅', icon: <Users className="h-4 w-4" /> },
            { id: 'deadline', label: '마감', icon: <AlertTriangle className="h-4 w-4" /> }
          ].map(type => {
            const isActive = form.type === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setForm({ ...form, type: type.id as Schedule['type'] })}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all duration-300 ${
                  isActive 
                    ? 'border-primary bg-primary/10 text-primary scale-[1.02] shadow-sm' 
                    : 'border-border/50 bg-muted/20 dark:bg-muted/5 text-foreground/40 hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                {type.icon}
                <span className="text-[11px] font-black uppercase tracking-widest">{type.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 flex items-center justify-between gap-3">
          {editingScheduleId && (
            <button
              type="button"
              onClick={() => onDelete(editingScheduleId)}
              className="flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-950/20 px-7 py-4.5 text-sm font-black text-red-500 transition-all hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </button>
          )}
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-primary px-8 py-4.5 text-sm font-black text-white shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            {editingScheduleId ? '일정 수정 완료' : '새 일정 저장'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleModal;
