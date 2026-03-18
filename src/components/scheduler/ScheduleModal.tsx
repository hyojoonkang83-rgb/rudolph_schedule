import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Calendar as CalendarIcon, Clock, Globe, Briefcase, Users, AlertTriangle, Trash2, ArrowRight } from 'lucide-react';
import Modal from '../Modal';
import { PRESET_COLORS, TIMEZONES } from './constants';
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
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${editingScheduleId ? 'bg-amber-50 text-amber-500' : 'bg-primary/10 text-primary'}`}>
            {editingScheduleId ? <CalendarIcon className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{editingScheduleId ? '일정 수정' : '일정 추가'}</h3>
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
              {editingScheduleId ? '기존 일정을 편집합니다' : '새로운 계획을 세워보세요'}
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl">
            <button 
              type="button"
              onClick={() => setModalTab('event')}
              className={`px-4 py-2 text-sm font-bold transition-all rounded-xl ${modalTab === 'event' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:bg-muted'}`}
            >
              이벤트
            </button>
            <button 
              type="button"
              onClick={() => setModalTab('task')}
              className={`px-4 py-2 text-sm font-bold transition-all rounded-xl ${modalTab === 'task' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-foreground/40 hover:bg-muted'}`}
            >
              할 일
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-500 border border-red-100">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2 ml-1">일정 제목</label>
          <input
            autoFocus
            required
            type="text"
            placeholder="일정 제목을 입력하세요"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-2xl border border-border bg-muted/30 px-5 py-4 text-sm font-medium transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="space-y-4 rounded-2xl bg-muted/20 p-5 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isAllDay}
                onChange={(e) => setForm({ ...form, isAllDay: e.target.checked })}
                className="peer h-5 w-5 appearance-none rounded-md border border-border bg-white transition-all checked:bg-primary"
              />
              <span className="text-xs font-bold text-foreground/60 group-hover:text-foreground">종일 (All-day)</span>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-xs font-bold"
              />
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.startTime || ''}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-32 rounded-xl border border-border bg-white px-4 py-3 text-xs font-bold"
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
                className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-xs font-bold"
              />
              {!form.isAllDay && (
                <input
                  type="time"
                  value={form.endTime || ''}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-32 rounded-xl border border-border bg-white px-4 py-3 text-xs font-bold"
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-3 ml-1">색상</label>
          <div className="flex flex-wrap gap-3">
            {PRESET_COLORS.map(color => (
              <button
                key={color.id}
                type="button"
                onClick={() => setForm({ ...form, color: color.id })}
                className={`h-8 w-8 rounded-full transition-all ${color.bg} ${form.color === color.id ? 'ring-4 ring-primary/20 scale-110' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'work', label: '실무', icon: <Briefcase className="h-3.5 w-3.5" /> },
            { id: 'meeting', label: '미팅', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'deadline', label: '마감', icon: <AlertTriangle className="h-3.5 w-3.5" /> }
          ].map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => setForm({ ...form, type: type.id as any })}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${form.type === type.id ? 'border-primary bg-primary/5 text-primary' : 'bg-white'}`}
            >
              {type.icon}
              <span className="text-[11px] font-bold">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-4 flex items-center justify-between gap-3">
          {editingScheduleId && (
            <button
              type="button"
              onClick={() => onDelete(editingScheduleId)}
              className="flex items-center gap-2 rounded-2xl bg-red-50 px-6 py-4 text-sm font-bold text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </button>
          )}
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary/90"
          >
            저장하기
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleModal;
