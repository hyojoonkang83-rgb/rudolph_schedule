import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Link as LinkIcon, Check, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import { Project, Schedule } from '../../types/project';
import { useCalendar } from './useCalendar';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import ScheduleModal from './ScheduleModal';

interface ProjectSchedulerProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
}

const ProjectScheduler: React.FC<ProjectSchedulerProps> = ({ project, onBack, onUpdateProject }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<Date | null>(null);

  const [initialSchedule, setInitialSchedule] = useState<Partial<Schedule>>({});

  const { days, monthStart, scheduleToLaneMap } = useCalendar(currentDate, project);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDayClick = (day: Date) => {
    setEditingScheduleId(null);
    const dateStr = format(day, 'yyyy-MM-dd');
    setInitialSchedule({
      title: '',
      startDate: dateStr,
      endDate: dateStr,
      startTime: '09:00',
      endTime: '10:00',
      isAllDay: false,
      color: 'blue',
      category: 'event'
    });
    setIsModalOpen(true);
  };

  const handleScheduleClick = (schedule: Schedule) => {
    setEditingScheduleId(schedule.id);
    setInitialSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleSubmitSchedule = (scheduleData: Partial<Schedule>) => {
    let updatedSchedules: Schedule[];
    if (editingScheduleId) {
      updatedSchedules = project.schedules.map((s: Schedule) => 
        s.id === editingScheduleId ? { ...s, ...scheduleData } as Schedule : s
      );
    } else {
      updatedSchedules = [...project.schedules, { ...scheduleData, id: `sch_${Date.now()}` } as Schedule];
    }

    onUpdateProject({ ...project, schedules: updatedSchedules });
    setIsModalOpen(false);
    setEditingScheduleId(null);
  };

  const handleDeleteSchedule = (id: string) => {
    const updatedSchedules = project.schedules.filter((s: Schedule) => s.id !== id);
    onUpdateProject({ ...project, schedules: updatedSchedules });
    setIsModalOpen(false);
    setEditingScheduleId(null);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-foreground font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            aria-label="대시보드로 돌아가기"
            className="group flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-muted active:scale-90"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{project.clientName}</span>
            <h1 className="text-base font-bold text-foreground leading-tight">{project.projectName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            aria-label={copied ? "링크 복사됨" : "현재 공유 링크 복사하기"}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold shadow-sm hover:bg-muted active:scale-95"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
              ) : (
                <LinkIcon className="h-3.5 w-3.5 text-foreground/40" aria-hidden="true" />
              )}
            </AnimatePresence>
            {copied ? <span className="text-green-600">링크 복사됨</span> : '링크 공유'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 lg:p-10 relative">
        <CalendarHeader 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate} 
        />
        
        <CalendarGrid
          days={days}
          monthStart={monthStart}
          project={project}
          scheduleToLaneMap={scheduleToLaneMap}
          onDayClick={handleDayClick}
          onScheduleClick={handleScheduleClick}
          onMoreClick={(e: React.MouseEvent, day: Date) => { e.stopPropagation(); setSelectedDayForDetail(day); }}
        />
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
