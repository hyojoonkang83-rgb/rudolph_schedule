import { useMemo } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  parseISO, 
  startOfDay, 
  endOfDay 
} from 'date-fns';
import { Project, Schedule } from '../../types/project';

export const useCalendar = (currentDate: Date, project: Project, viewMode: 'month' | 'week' = 'month') => {
  const { monthStart, startDate, endDate } = useMemo(() => {
    if (viewMode === 'month') {
      const mStart = startOfMonth(currentDate);
      const mEnd = endOfMonth(mStart);
      const sDate = startOfWeek(mStart);
      const eDate = endOfWeek(mEnd);
      return { monthStart: mStart, startDate: sDate, endDate: eDate };
    } else {
      const sDate = startOfWeek(currentDate);
      const eDate = endOfWeek(currentDate);
      return { monthStart: startOfMonth(currentDate), startDate: sDate, endDate: eDate };
    }
  }, [currentDate, viewMode]);

  const days = useMemo(() => 
    eachDayOfInterval({ start: startDate, end: endDate }), 
    [startDate, endDate]
  );

  const scheduleToLaneMap = useMemo(() => {
    // Filter out invalid schedules to prevent crash
    const validSchedules = project.schedules.filter(s => {
      if (!s.startDate || !s.endDate) return false;
      try {
        parseISO(s.startDate);
        parseISO(s.endDate);
        return true;
      } catch (e) {
        return false;
      }
    });

    const sortedSchedules = [...validSchedules].sort((a, b) => {
      try {
        const aStart = parseISO(a.startDate).getTime();
        const bStart = parseISO(b.startDate).getTime();
        if (aStart !== bStart) return aStart - bStart;
        
        const aEnd = parseISO(a.endDate).getTime();
        const bEnd = parseISO(b.endDate).getTime();
        return bEnd - aEnd; // Longer first
      } catch (e) {
        return 0;
      }
    });

    const lanes: Schedule[][] = []; 
    const map = new Map<string, number>();

    sortedSchedules.forEach(schedule => {
      const sStart = startOfDay(parseISO(schedule.startDate));
      const sEnd = endOfDay(parseISO(schedule.endDate));

      let placed = false;
      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i]!;
        const isOverlap = lane.some(existing => {
          const eStart = startOfDay(parseISO(existing.startDate));
          const eEnd = endOfDay(parseISO(existing.endDate));
          return (sStart <= eEnd && sEnd >= eStart);
        });

        if (!isOverlap) {
          lanes[i]!.push(schedule);
          map.set(schedule.id, i);
          placed = true;
          break;
        }
      }

      if (!placed) {
        lanes.push([schedule]);
        map.set(schedule.id, lanes.length - 1);
      }
    });

    return map;
  }, [project.schedules]);

  return { days, monthStart, scheduleToLaneMap };
};
