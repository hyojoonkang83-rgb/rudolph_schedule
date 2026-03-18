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

export const useCalendar = (currentDate: Date, project: Project) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = useMemo(() => 
    eachDayOfInterval({ start: startDate, end: endDate }), 
    [startDate, endDate]
  );

  const scheduleToLaneMap = useMemo(() => {
    const sortedSchedules = [...project.schedules].sort((a, b) => {
      const aStart = parseISO(a.startDate).getTime();
      const bStart = parseISO(b.startDate).getTime();
      if (aStart !== bStart) return aStart - bStart;
      
      const aEnd = parseISO(a.endDate).getTime();
      const bEnd = parseISO(b.endDate).getTime();
      return bEnd - aEnd; // Longer first
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
