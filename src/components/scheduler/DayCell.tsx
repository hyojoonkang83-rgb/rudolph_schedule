import React from 'react';
import { format, isSameMonth, isSameDay } from 'date-fns';
import { Schedule } from '../../types/project';
import ScheduleItem from './ScheduleItem';

interface DayCellProps {
  day: Date;
  monthStart: Date;
  schedules: Schedule[];
  onDayClick: (day: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
  onMoreClick: (e: React.MouseEvent, day: Date) => void;
}

const DayCell: React.FC<DayCellProps> = ({ 
  day, 
  monthStart, 
  schedules, 
  onDayClick, 
  onScheduleClick,
  onMoreClick
}) => {
  const isCurrentMonth = isSameMonth(day, monthStart);
  const isToday = isSameDay(day, new Date());

  return (
    <div
      onClick={() => onDayClick(day)}
      className={`group relative flex min-h-[140px] cursor-pointer flex-col bg-white border-r border-b border-border/30 transition-all hover:bg-primary/[0.01] ${
        !isCurrentMonth ? 'bg-muted/10' : ''
      }`}
    >
      <div className="p-3 pb-1">
        <span className={`text-sm font-black transition-colors ${
          isToday ? 'text-primary' : (isCurrentMonth ? 'text-foreground/40' : 'text-foreground/10')
        } group-hover:text-foreground/60`}>
          {format(day, 'd')}
        </span>
      </div>
      
      <div className="mt-1 relative flex-1">
        {schedules.map(schedule => {
          if ((schedule.lane || 0) > 3) return null;
          return (
            <ScheduleItem
              key={schedule.id}
              schedule={schedule}
              day={day}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onScheduleClick(schedule);
              }}
            />
          );
        })}
        {schedules.length > 4 && (
          <div 
            onClick={(e) => onMoreClick(e, day)}
            className="absolute left-1 bottom-1.5 text-[10px] font-bold text-foreground/40 hover:text-primary transition-colors bg-white/90 py-0.5 px-1.5 rounded-md border border-border/50 shadow-sm"
          >
            + {schedules.length - 4} more
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCell;
