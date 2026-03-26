import React, { useEffect, useRef, useState } from 'react';
import { format, startOfDay, addHours, startOfWeek, addDays, getMinutes, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Project, Schedule } from '../../types/project';
import { PRESET_COLORS } from './constants';

interface WeekViewProps {
  currentDate: Date;
  project: Project;
  onDayClick: (day: Date, hour?: number) => void;
  onScheduleClick: (schedule: Schedule) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ 
  currentDate, 
  project, 
  onDayClick, 
  onScheduleClick 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to 8 AM (60px * 8 = 480px) on mount
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 480;
    }
  }, []);
  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events: Timed vs All-Day
  const allDaySchedules = project.schedules.filter(s => s.isAllDay || (!s.startTime && !s.endTime));
  const timedSchedules = project.schedules.filter(s => !s.isAllDay && s.startTime);

  const getAllDaySchedulesForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return allDaySchedules.filter(s => {
      return dayStr >= s.startDate && dayStr <= s.endDate;
    });
  };

  const getMinutesFromTime = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const getEventStyle = (schedule: Schedule) => {
    const startMins = getMinutesFromTime(schedule.startTime || '00:00');
    const endMins = getMinutesFromTime(schedule.endTime || '23:59');
    let durationMins = endMins - startMins;
    if (durationMins <= 0) durationMins = 30; // Min 30 min duration for visibility

    const top = (startMins / 60) * 60; // 60px per hour
    const height = (durationMins / 60) * 60;

    const colorData = PRESET_COLORS.find(c => c.id === (schedule.color || 'blue')) || PRESET_COLORS[0]!;

    return {
      top: `${top}px`,
      height: `${Math.max(height, 24)}px`,
      backgroundColor: `var(--color-${schedule.color || 'primary'})`,
    };
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border/50 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
      {/* Header Area */}
      <div className="flex border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-30">
        {/* Timezone and Empty corner */}
        <div className="w-16 flex flex-col items-center justify-end pb-2 border-r border-border/50 shrink-0">
          <span className="text-[10px] font-black text-foreground/40 tracking-tighter uppercase whitespace-nowrap">
            GMT+09
          </span>
        </div>
        <div className="flex-1 grid grid-cols-7">
          {days.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={i} className="pt-4 pb-2 text-center border-r border-border/35 last:border-r-0">
                <span className={`text-[12px] font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-foreground/70'}`}>
                  {format(day, 'EEE', { locale: ko })}
                </span>
                <div className={`mt-1.5 h-10 w-10 mx-auto flex items-center justify-center rounded-full text-xl font-black transition-all duration-300 ${
                  isToday 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10' 
                    : 'text-foreground/80 hover:bg-muted/50'
                }`}>
                  {format(day, 'd')}
                </div>
                
                {/* All-day events badges */}
                <div className="mt-3 px-1 space-y-1 min-h-[24px]">
                  {getAllDaySchedulesForDay(day).map(s => {
                     const colorData = PRESET_COLORS.find(c => c.id === (s.color || 'blue')) || PRESET_COLORS[0]!;
                     return (
                      <div 
                        key={s.id}
                        onClick={() => onScheduleClick(s)}
                        className={`text-[10px] font-black px-2 py-1 rounded-full truncate cursor-pointer shadow-sm hover:brightness-110 active:scale-95 transition-all text-white`}
                        style={{ backgroundColor: `var(--color-${s.color || 'primary'})` }}
                      >
                        {s.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Scrollable Grid */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar relative scroll-smooth" 
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        <div className="flex min-h-full">
          {/* Hour Labels */}
          <div className="w-16 bg-muted/5 z-20 sticky left-0 border-r border-border/50 shrink-0">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] relative border-b border-border/15 last:border-b-0">
                <span className="absolute -top-2.5 right-2 text-[10px] font-black text-foreground/50 uppercase tracking-tighter">
                  {hour === 0 ? '' : format(addHours(startOfDay(new Date()), hour), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Day Grid Columns */}
          <div className="flex-1 grid grid-cols-7 relative bg-grid-slate-100/50 dark:bg-grid-slate-900/50">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {hours.map(hour => (
                <div key={hour} className="h-[60px] border-b border-border/25 last:border-b-0" />
              ))}
            </div>

            {/* Now Indicator Line */}
            {isSameDay(startOfWeek(currentDate), startOfWeek(new Date())) && (
              <NowIndicator />
            )}

            {/* Vertical Day Lines */}
            {days.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div key={i} className={`relative h-[1440px] border-r border-border/35 last:border-r-0 group ${isToday ? 'bg-primary/[0.02]' : ''}`}>
                {/* Clickable slots */}
                {hours.map(hour => (
                  <div 
                    key={hour} 
                    className="h-[60px] w-full cursor-cell transition-colors hover:bg-primary/[0.03]"
                    onClick={() => onDayClick(day, hour)}
                  />
                ))}

                {/* Timed Events Layer */}
                <div className="absolute inset-0 pointer-events-none">
                  {timedSchedules.filter(s => s.startDate === format(day, 'yyyy-MM-dd')).map(s => {
                    return (
                      <div
                        key={s.id}
                        onClick={(e) => { e.stopPropagation(); onScheduleClick(s); }}
                        style={getEventStyle(s)}
                        className={`absolute left-1 right-1 pointer-events-auto rounded-xl p-2 border border-black/10 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] transition-all z-10`}
                      >
                        <div className="text-[11px] font-black leading-tight text-white mb-0.5 truncate">{s.title}</div>
                        <div className="text-[9px] font-bold text-white/70">{s.startTime} - {s.endTime}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
};

const NowIndicator = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentDayIndex = now.getDay(); 
  const mins = now.getHours() * 60 + now.getMinutes();
  const top = (mins / 60) * 60;

  return (
    <div 
      className="absolute left-0 right-0 z-40 pointer-events-none flex items-center h-0.5"
      style={{ top: `${top}px` }}
    >
      <div className="absolute -left-14 w-12 flex justify-end">
        <span className="text-[10px] font-black text-red-500 bg-background px-1 rounded-sm shadow-sm">{format(now, 'HH:mm')}</span>
      </div>
      <div className="flex-1 relative flex items-center">
        <div className="h-0.5 w-full bg-red-500/40" />
        <div 
          className="absolute h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 -translate-x-1/2"
          style={{ left: `${((currentDayIndex + 0.5) / 7) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default WeekView;
