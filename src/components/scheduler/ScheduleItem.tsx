import React from 'react';
import { Schedule } from '../../types/project';
import { PRESET_COLORS } from './constants';
import { isSameDay, startOfDay, parseISO } from 'date-fns';

interface ScheduleItemProps {
  schedule: Schedule;
  day: Date;
  onClick: (e: React.MouseEvent) => void;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ schedule, day, onClick }) => {
  if (!schedule.startDate || !schedule.endDate) return null;

  let start: Date;
  let end: Date;
  try {
    start = startOfDay(parseISO(schedule.startDate));
    end = startOfDay(parseISO(schedule.endDate));
  } catch (e) {
    return null;
  }
  
  const current = startOfDay(day);
  
  const isMultiDay = !isSameDay(start, end);
  const isBar = isMultiDay || schedule.isAllDay;
  
  const isStart = isSameDay(current, start) || day.getDay() === 0; // Sunday wraps
  const isEnd = isSameDay(current, end) || day.getDay() === 6; // Saturday wraps

  const colorData = PRESET_COLORS.find((c: { id: string }) => c.id === schedule.color) || PRESET_COLORS[0]!;
  
  const topPos = (schedule.lane || 0) * 28;

  if (isBar) {
    return (
      <div
        onClick={onClick}
        style={{ top: `${topPos}px` }}
        className={`absolute left-0 right-0 flex items-center justify-start h-[24px] border-y transition-all group/item
          ${colorData.light} ${colorData.border} text-foreground/80
          ${isStart ? 'rounded-l-lg ml-1 border-l' : 'rounded-l-none ml-0 border-l-0'}
          ${isEnd ? 'rounded-r-lg mr-1 border-r' : 'rounded-r-none mr-0 border-r-0'}
        `}
      >
        {isStart && (
          <div className="flex items-center gap-1.5 px-2 w-full h-full overflow-hidden">
            <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${colorData.bg}`} />
            <span className="truncate flex-1 font-bold text-[11px] tracking-tight">{schedule.title}</span>
          </div>
        )}
        {!isStart && <div className="h-full w-full" />}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{ top: `${topPos}px` }}
      className={`absolute left-0 right-0 flex items-center justify-start h-[24px] border-y transition-all group/item
        bg-transparent border-transparent text-foreground/80
      `}
    >
      <div className="flex items-center gap-1.5 px-1.5 h-full overflow-hidden w-full">
        <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${colorData.bg}`} />
        <span className="text-[9px] font-bold text-foreground/40 flex-shrink-0">{schedule.startTime}</span>
        <span className="truncate flex-1 font-bold text-[11px] tracking-tight">{schedule.title}</span>
      </div>
    </div>
  );
};

export default ScheduleItem;
