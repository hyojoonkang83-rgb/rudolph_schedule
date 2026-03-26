import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfToday } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewMode: 'month' | 'week';
  setViewMode: (mode: 'month' | 'week') => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  currentDate, 
  setCurrentDate, 
  viewMode, 
  setViewMode 
}) => {
  const handlePrev = () => {
    setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(startOfToday());
  };

  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground min-w-[150px]">
          {format(currentDate, 'yyyy년 M월', { locale: ko })}
        </h2>
        
        <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1 border border-border/50">
          <button
            onClick={handlePrev}
            className="p-1.5 transition-all hover:bg-card rounded-lg text-foreground/60 hover:text-primary active:scale-90"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-foreground/40 hover:text-primary transition-colors"
          >
            오늘
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 transition-all hover:bg-card rounded-lg text-foreground/60 hover:text-primary active:scale-90"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="flex bg-muted/40 p-1.5 rounded-2xl border border-border/40 relative">
        <div className="flex items-center gap-1.5 isolate">
          {(['month', 'week'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`relative px-6 py-2 text-[12px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${
                viewMode === mode 
                  ? 'text-white' 
                  : 'text-foreground/40 hover:text-foreground/60'
              }`}
            >
              {viewMode === mode && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-xl z-[-1] shadow-lg shadow-primary/25"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
