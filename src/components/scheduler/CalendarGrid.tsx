import React from 'react';
import DayCell from './DayCell';
import { startOfDay, parseISO, isWithinInterval, isSameDay, format } from 'date-fns';
import { Project, Schedule } from '../../types/project';

interface CalendarGridProps {
  viewMode: 'month' | 'week';
  days: Date[];
  monthStart: Date;
  project: Project;
  scheduleToLaneMap: Map<string, number>;
  onDayClick: (day: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
  onMoreClick: (e: React.MouseEvent, day: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  viewMode,
  days, 
  monthStart, 
  project, 
  scheduleToLaneMap,
  onDayClick,
  onScheduleClick,
  onMoreClick
}) => {
  const getSchedulesForDay = (day: Date) => {
    return project.schedules.filter((s: Schedule) => {
      if (!s.startDate || !s.endDate) return false;
      try {
        const start = startOfDay(parseISO(s.startDate));
        const end = startOfDay(parseISO(s.endDate));
        return isWithinInterval(day, { start, end });
      } catch (e) {
        return false;
      }
    }).map((s: Schedule) => ({
      ...s,
      lane: scheduleToLaneMap.get(s.id)
    })).sort((a, b) => (a.lane ?? 0) - (b.lane ?? 0));
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-border bg-background shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
      <div className="calendar-grid border-b border-border/50 bg-muted/10 py-4 text-center">
        {weekDays.map((dayName, i) => (
          <div key={dayName} className="flex flex-col items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60 leading-none">{dayName}</span>
            {viewMode === 'week' && days[i] && (
              <span className={`mt-1 h-8 w-8 flex items-center justify-center rounded-full text-base font-bold transition-colors ${
                isSameDay(days[i]!, new Date()) ? 'bg-primary text-white' : 'text-foreground/60'
              }`}>
                {format(days[i]!, 'd')}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="calendar-grid border-l border-t border-border/30">
        {days.map((day) => (
          <DayCell
            key={day.toString()}
            viewMode={viewMode}
            day={day}
            monthStart={monthStart}
            schedules={getSchedulesForDay(day)}
            onDayClick={onDayClick}
            onScheduleClick={onScheduleClick}
            onMoreClick={onMoreClick}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
