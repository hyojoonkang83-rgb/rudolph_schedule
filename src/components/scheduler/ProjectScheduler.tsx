import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Link as LinkIcon, Check, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';

import { Project, Schedule } from '../../types/project';
import { generateId } from '../../utils/storage';
import { useCalendar } from './useCalendar';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import WeekView from './WeekView';
import ScheduleModal from './ScheduleModal';

interface ProjectSchedulerProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ProjectScheduler: React.FC<ProjectSchedulerProps> = ({ project, onBack, onUpdateProject, theme, onToggleTheme }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [initialSchedule, setInitialSchedule] = useState<Partial<Schedule>>({});

  const { days, monthStart, scheduleToLaneMap } = useCalendar(currentDate, project, viewMode);

  const handleCopyLink = React.useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleDayClick = React.useCallback((day: Date, hour?: number) => {
    setEditingScheduleId(null);
    const dateStr = format(day, 'yyyy-MM-dd');
    const startTime = hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : '09:00';
    const endTime = hour !== undefined ? `${(hour + 1).toString().padStart(2, '0')}:00` : '10:00';
    
    setInitialSchedule({
      title: '',
      startDate: dateStr,
      endDate: dateStr,
      startTime: startTime,
      endTime: endTime,
      isAllDay: false,
      color: 'blue',
      category: 'event'
    });
    setIsModalOpen(true);
  }, []);

  const handleScheduleClick = React.useCallback((schedule: Schedule) => {
    setEditingScheduleId(schedule.id);
    setInitialSchedule(schedule);
    setIsModalOpen(true);
  }, []);

  const handleSubmitSchedule = React.useCallback((scheduleData: Partial<Schedule>) => {
    let updatedSchedules: Schedule[];
    if (editingScheduleId) {
      updatedSchedules = project.schedules.map((s: Schedule) => 
        s.id === editingScheduleId ? { ...s, ...scheduleData } as Schedule : s
      );
    } else {
      updatedSchedules = [...project.schedules, { 
        ...scheduleData, 
        id: generateId('sch') 
      } as Schedule];
    }

    onUpdateProject({ ...project, schedules: updatedSchedules });
    setIsModalOpen(false);
    setEditingScheduleId(null);
  }, [project, editingScheduleId, onUpdateProject]);

  const handleDeleteSchedule = React.useCallback((id: string) => {
    const updatedSchedules = project.schedules.filter((s: Schedule) => s.id !== id);
    onUpdateProject({ ...project, schedules: updatedSchedules });
    setIsModalOpen(false);
    setEditingScheduleId(null);
  }, [project, onUpdateProject]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            aria-label="대시보드로 돌아가기"
            className="group flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-muted active:scale-90"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          </button>
          <nav className="flex items-center gap-3 overflow-hidden ml-2">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">{project.clientName}</span>
            </div>
            <div className="h-6 w-px bg-border/50 rotate-12" />
            <h1 className="text-lg font-black tracking-tight text-foreground truncate max-w-[300px]">{project.projectName}</h1>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-all hover:bg-muted active:scale-95"
            aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="text-foreground/60"
              >
                {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </motion.div>
            </AnimatePresence>
          </button>

          <button
            onClick={() => handleDayClick(new Date())}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all"
          >
            <span>일정 추가</span>
          </button>
          
          <button
            onClick={handleCopyLink}
            aria-label={copied ? "링크 복사됨" : "현재 공유 링크 복사하기"}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground/60 shadow-sm hover:bg-muted active:scale-95 transition-colors"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <LinkIcon className="h-3.5 w-3.5" />
              )}
            </AnimatePresence>
            {copied ? '복사됨' : '링크 공유'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 lg:p-10 relative">
        <CalendarHeader 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate} 
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        
        {viewMode === 'month' ? (
          <CalendarGrid
            viewMode={viewMode}
            days={days}
            monthStart={monthStart}
            project={project}
            scheduleToLaneMap={scheduleToLaneMap}
            onDayClick={handleDayClick}
            onScheduleClick={handleScheduleClick}
            onMoreClick={(e, day) => { 
              e.stopPropagation();
              handleDayClick(day);
            }}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            project={project}
            onDayClick={handleDayClick}
            onScheduleClick={handleScheduleClick}
          />
        )}
      </main>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingScheduleId={editingScheduleId}
        initialSchedule={initialSchedule}
        onSubmit={handleSubmitSchedule}
        onDelete={handleDeleteSchedule}
      />
    </div>
  );
};

export default ProjectScheduler;
