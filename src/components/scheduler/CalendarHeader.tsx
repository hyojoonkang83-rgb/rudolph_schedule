import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, setCurrentDate }) => {
  return (
    <div className="mb-10 flex items-end justify-between">
      <div>
        <span className="text-sm font-bold text-primary/50">{format(currentDate, 'yyyy')}</span>
        <h2 className="text-4xl font-extrabold tracking-tight">
          {format(currentDate, 'MMMM', { locale: ko })}
        </h2>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-white border border-border p-1.5 shadow-sm">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 transition-all hover:bg-muted rounded-xl"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 text-xs font-bold text-foreground/50 transition-colors hover:text-primary"
        >
          오늘
        </button>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 transition-all hover:bg-muted rounded-xl"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
