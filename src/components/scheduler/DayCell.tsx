import React from 'react';
import { format, isSameMonth, isSameDay } from 'date-fns';
import { isHoliday, isSunday, getHolidayName } from '../../utils/calendar';
import { Schedule } from '../../types/project';
import ScheduleItem from './ScheduleItem';

interface DayCellProps {
  viewMode: 'month' | 'week';
  day: Date;
  monthStart: Date;
  schedules: Schedule[];
  onDayClick: (day: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
  onMoreClick: (e: React.MouseEvent, day: Date) => void;
}

const DayCell: React.FC<DayCellProps> = ({ 
  viewMode,
  day, 
  monthStart, 
  schedules, 
  onDayClick, 
  onScheduleClick,
  onMoreClick
}) => {
  const isCurrentMonth = isSameMonth(day, monthStart);
  const isToday = isSameDay(day, new Date());
  
  const isHolidayDate = isHoliday(day);
  const isSun = isSunday(day);
  const shouldBeRed = isHolidayDate || isSun;
  const holidayName = getHolidayName(day);
  
  const displayLimit = viewMode === 'month' ? 4 : 15;

  return (
    <div
      onClick={() => onDayClick(day)}
      className={`group relative flex cursor-pointer flex-col bg-background border-r border-b border-border/45 transition-all hover:bg-primary/[0.02] ${
        viewMode === 'month' ? 'min-h-0 h-full' : 'min-h-[400px] sm:min-h-[500px]'
      } ${
        !isCurrentMonth && viewMode === 'month' ? 'bg-muted/30' : ''
      }`}
    >
      {viewMode === 'month' && (
        <div className="p-3 pb-0.5">
          <span className={`text-sm font-black transition-colors ${
            isToday ? 'text-primary' : (shouldBeRed ? 'text-red-500' : (isCurrentMonth ? 'text-foreground/40' : 'text-foreground/20'))
          } group-hover:text-foreground/60`}>
            {format(day, 'd')}
          </span>
          {holidayName && isCurrentMonth && (
            <p className="text-[9px] font-bold text-red-400/80 truncate leading-tight mt-0.5">
              {holidayName}
            </p>
          )}
        </div>
      )}
      
      <div className={`mt-1 relative flex-1 ${viewMode === 'week' ? 'pt-4' : ''}`}>
        {schedules.map(schedule => {
          if ((schedule.lane || 0) >= displayLimit) return null;
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
        {schedules.length > displayLimit && (
          <div 
            onClick={(e) => onMoreClick(e, day)}
            className="absolute left-1 bottom-1.5 text-[10px] font-bold text-foreground/40 hover:text-primary transition-colors bg-background/90 py-0.5 px-1.5 rounded-md border border-border/50 shadow-sm"
          >
            +{schedules.length - displayLimit}개 더보기
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCell;
