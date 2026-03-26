import React from 'react';
import DayCell from './DayCell';
import { startOfDay, parseISO, isWithinInterval } from 'date-fns';
import { Project, Schedule } from '../../types/project';

interface CalendarGridProps {
  days: Date[];
  monthStart: Date;
  project: Project;
  scheduleToLaneMap: Map<string, number>;
  onDayClick: (day: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
  onMoreClick: (e: React.MouseEvent, day: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
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
      const start = startOfDay(parseISO(s.startDate));
      const end = startOfDay(parseISO(s.endDate));
      return isWithinInterval(day, { start, end });
    }).map((s: Schedule) => ({
      ...s,
      lane: scheduleToLaneMap.get(s.id)
    })).sort((a: any, b: any) => (a.lane || 0) - (b.lane || 0));
  };

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-border bg-background shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
      <div className="calendar-grid border-b border-border/50 bg-muted/30 py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/30">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-grid border-l border-t border-border/30">
        {days.map((day) => (
          <DayCell
            key={day.toString()}
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
