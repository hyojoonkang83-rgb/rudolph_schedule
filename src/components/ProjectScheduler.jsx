import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight as ChevronRightIcon, 
  Plus, 
  Link as LinkIcon, 
  ArrowLeft,
  Check,
  Trash2,
  AlertTriangle,
  Users,
  Briefcase,
  Clock,
  Calendar as CalendarIcon,
  ArrowRight,
  Globe
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import Modal from './Modal';

const PRESET_COLORS = [
  { id: 'blue', bg: 'bg-blue-500', text: 'text-white', light: 'bg-blue-50', border: 'border-blue-100' },
  { id: 'purple', bg: 'bg-purple-500', text: 'text-white', light: 'bg-purple-50', border: 'border-purple-100' },
  { id: 'green', bg: 'bg-emerald-500', text: 'text-white', light: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 'yellow', bg: 'bg-amber-400', text: 'text-amber-900', light: 'bg-amber-50', border: 'border-amber-100' },
  { id: 'red', bg: 'bg-rose-500', text: 'text-white', light: 'bg-rose-50', border: 'border-rose-100' },
  { id: 'indigo', bg: 'bg-indigo-500', text: 'text-white', light: 'bg-indigo-50', border: 'border-indigo-100' },
];

const TIMEZONES = [
  { id: 'Asia/Seoul', label: '서울 (GMT+9)', offset: '+09:00' },
  { id: 'Asia/Tokyo', label: '도쿄 (GMT+9)', offset: '+09:00' },
  { id: 'America/New_York', label: '뉴욕 (GMT-5)', offset: '-05:00' },
  { id: 'Europe/London', label: '런던 (GMT+0)', offset: '+00:00' },
  { id: 'Europe/Paris', label: '파리 (GMT+1)', offset: '+01:00' },
  { id: 'Asia/Dubai', label: '두바이 (GMT+4)', offset: '+04:00' },
  { id: 'Australia/Sydney', label: '시드니 (GMT+11)', offset: '+11:00' },
];

const ProjectScheduler = ({ project, onBack, onUpdateProject }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // New Schedule State
  const [newSchedule, setNewSchedule] = useState({ 
    title: '', 
    type: 'work',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '10:00',
    isAllDay: false,
    color: 'blue',
    startTimezone: 'Asia/Seoul',
    endTimezone: 'Asia/Seoul'
  });
  const [error, setError] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  const [selectedDayForDetail, setSelectedDayForDetail] = useState(null);
  const [modalTab, setModalTab] = useState('event'); // 'event' or 'task'

  const handleStartDateChange = (val) => {
    setNewSchedule(prev => {
      const newState = { ...prev, startDate: val };
      if (prev.endDate < val) {
        newState.endDate = val;
      }
      return newState;
    });
    if (error) setError('');
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setEditingScheduleId(null);
    const dateStr = format(day, 'yyyy-MM-dd');
    setNewSchedule({ 
      title: '', 
      type: modalTab === 'event' ? 'work' : 'deadline',
      startDate: dateStr,
      endDate: dateStr,
      startTime: '09:00',
      endTime: '10:00',
      isAllDay: false,
      color: modalTab === 'event' ? 'blue' : 'purple',
      startTimezone: 'Asia/Seoul',
      endTimezone: 'Asia/Seoul'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleScheduleClick = (schedule) => {
    setEditingScheduleId(schedule.id);
    setModalTab(schedule.category || 'event');
    setNewSchedule({
      title: schedule.title,
      type: schedule.type,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      startTime: schedule.startTime || '09:00',
      endTime: schedule.endTime || '10:00',
      isAllDay: schedule.isAllDay,
      color: schedule.color || 'blue',
      startTimezone: schedule.startTimezone || schedule.timezone || 'Asia/Seoul',
      endTimezone: schedule.endTimezone || schedule.timezone || 'Asia/Seoul'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmitSchedule = (e) => {
    e.preventDefault();
    if (!newSchedule.title.trim()) return;

    if (newSchedule.endDate < newSchedule.startDate) {
      setError('마감일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    const scheduleData = {
      title: newSchedule.title.trim(),
      startDate: newSchedule.startDate,
      endDate: newSchedule.endDate,
      startTime: newSchedule.isAllDay ? null : newSchedule.startTime,
      endTime: newSchedule.isAllDay ? null : newSchedule.endTime,
      isAllDay: newSchedule.isAllDay,
      color: newSchedule.color,
      type: modalTab === 'event' ? newSchedule.type : 'deadline',
      category: modalTab,
      startTimezone: newSchedule.startTimezone,
      endTimezone: newSchedule.endTimezone
    };

    let updatedSchedules;
    if (editingScheduleId) {
      updatedSchedules = project.schedules.map(s => 
        s.id === editingScheduleId ? { ...s, ...scheduleData } : s
      );
    } else {
      updatedSchedules = [...project.schedules, { ...scheduleData, id: `sch_${Date.now()}` }];
    }

    onUpdateProject({ ...project, schedules: updatedSchedules });
    setIsModalOpen(false);
    setEditingScheduleId(null);
  };

  // ... (previous logic stays same, adding helper for popover)
  const renderDayDetails = () => {
    if (!selectedDayForDetail) return null;
    const dayLanes = getLanesForDay(selectedDayForDetail);
    
    return (
      <AnimatePresence>
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 10 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 10 }}
           className="absolute z-[100] w-72 rounded-2xl bg-white p-4 shadow-2xl border border-border ring-1 ring-black/5"
           style={{ 
             top: '50%', 
             left: '50%', 
             transform: 'translate(-50%, -50%)' 
           }}
        >
          <div className="flex items-center justify-between mb-4">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{format(selectedDayForDetail, 'EEEE', { locale: ko })}</span>
               <span className="text-xl font-black">{format(selectedDayForDetail, 'd')}</span>
             </div>
             <button onClick={() => setSelectedDayForDetail(null)} className="p-1 hover:bg-muted rounded-full">
               <Plus className="h-4 w-4 rotate-45 text-foreground/40" />
             </button>
          </div>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto no-scrollbar">
            {dayLanes.map(s => (
              <div 
                key={s.id} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleScheduleClick(s);
                  setSelectedDayForDetail(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 text-xs font-bold cursor-pointer hover:bg-white/50 transition-colors ${PRESET_COLORS.find(c => c.id === s.color)?.light || 'bg-muted/30'}`}
              >
                <div className={`h-2 w-2 rounded-full ${PRESET_COLORS.find(c => c.id === s.color)?.bg}`} />
                <span className="flex-1 truncate">{s.title}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };


  // --- Global Lane Assignment Engine (Google Calendar Style) ---
  // Calculates fixed vertical positions for all schedules for the current view
  const getAssignedLanes = () => {
    const sortedSchedules = [...project.schedules].sort((a, b) => {
      const aStart = parseISO(a.startDate);
      const bStart = parseISO(b.startDate);
      if (aStart.getTime() !== bStart.getTime()) return aStart.getTime() - bStart.getTime();
      
      const aEnd = parseISO(a.endDate);
      const bEnd = parseISO(b.endDate);
      return bEnd.getTime() - aEnd.getTime(); // Longer first
    });

    const lanes = []; // Array of arrays, each sub-array is a lane (row) of schedules
    const scheduleToLaneMap = new Map();

    sortedSchedules.forEach(schedule => {
      const sStart = startOfDay(parseISO(schedule.startDate));
      const sEnd = endOfDay(parseISO(schedule.endDate));

      let placed = false;
      for (let i = 0; i < lanes.length; i++) {
        // Check if this lane is free for the entire duration of this schedule
        const isOverlap = lanes[i].some(existing => {
          const eStart = startOfDay(parseISO(existing.startDate));
          const eEnd = endOfDay(parseISO(existing.endDate));
          return (sStart <= eEnd && sEnd >= eStart);
        });

        if (!isOverlap) {
          lanes[i].push(schedule);
          scheduleToLaneMap.set(schedule.id, i);
          placed = true;
          break;
        }
      }

      if (!placed) {
        lanes.push([schedule]);
        scheduleToLaneMap.set(schedule.id, lanes.length - 1);
      }
    });

    return scheduleToLaneMap;
  };

  const scheduleToLaneMap = getAssignedLanes();

  const getLanesForDay = (day) => {
    const daySchedules = project.schedules.filter(s => {
      const start = startOfDay(parseISO(s.startDate));
      const end = endOfDay(parseISO(s.endDate));
      return isWithinInterval(day, { start, end });
    });

    // Return schedules mapped to their global lane index
    return daySchedules.map(s => ({
      ...s,
      lane: scheduleToLaneMap.get(s.id)
    })).sort((a, b) => a.lane - b.lane);
  };

  const getSegmentType = (schedule, day) => {
    const start = startOfDay(parseISO(schedule.startDate || schedule.date));
    const end = startOfDay(parseISO(schedule.endDate || schedule.date));
    const current = startOfDay(day);
    
    const isMultiDay = !isSameDay(start, end);
    const isAllDay = schedule.isAllDay;
    
    // Bar type if multi-day OR all-day
    const isBar = isMultiDay || isAllDay;
    
    // Position within bar
    const isStart = isSameDay(current, start) || format(day, 'E', { locale: ko }) === '일';
    const isEnd = isSameDay(current, end) || format(day, 'E', { locale: ko }) === '토';

    return { isBar, isStart, isEnd };
  };

  const getScheduleStyle = (schedule, day) => {
    const { isBar, isStart, isEnd } = getSegmentType(schedule, day);
    const colorData = PRESET_COLORS.find(c => c.id === (schedule.color || 'blue')) || PRESET_COLORS[0];
    
    if (!isBar) {
      // Dot style (Single day, timed)
      return `flex items-center gap-1.5 px-3 py-0.5 text-[10px] font-medium text-foreground/70 hover:bg-muted/50 rounded-md transition-colors mx-1`;
    }

    // Bar style (Multi-day or All-day)
    return `
      ${colorData.light} ${colorData.border} text-foreground/80
      ${isStart ? 'rounded-l-lg ml-1 border-l' : 'rounded-l-none ml-0 border-l-0'}
      ${isEnd ? 'rounded-r-lg mr-1 border-r' : 'rounded-r-none mr-0 border-r-0'}
      flex items-center justify-start h-[24px] border-y transition-all group/item
    `;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return <Users className="h-2.5 w-2.5" />;
      case 'deadline': return <AlertTriangle className="h-2.5 w-2.5" />;
      default: return <Briefcase className="h-2.5 w-2.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-foreground font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="group flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-muted active:scale-90"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{project.clientName}</span>
            <h1 className="text-base font-bold text-foreground leading-tight">{project.projectName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold transition-all hover:bg-muted active:scale-95 shadow-sm"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                </motion.div>
              ) : (
                <motion.div key="link" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                  <LinkIcon className="h-3.5 w-3.5 text-foreground/40" />
                </motion.div>
              )}
            </AnimatePresence>
            {copied ? <span className="text-green-600">링크가 복사되었습니다</span> : '공유 링크 복사'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 lg:p-10 relative">
        {renderDayDetails()}
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
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-border bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
          <div className="calendar-grid border-b border-border/50 bg-[#FBFBFC] py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/30">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="calendar-grid border-l border-t border-border/30">
            {days.map((day, idx) => {
              const daySchedules = getLanesForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={`group relative flex min-h-[140px] cursor-pointer flex-col bg-white border-r border-b border-border/30 transition-all hover:bg-primary/[0.01] ${
                    !isCurrentMonth ? 'bg-muted/10' : ''
                  }`}
                >
                  <div className="p-3 pb-1">
                    <span className={`text-sm font-black transition-colors ${isToday ? 'text-primary' : (isCurrentMonth ? 'text-foreground/40' : 'text-foreground/10')} group-hover:text-foreground/60`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="mt-1 relative flex-1">
                    {daySchedules.map(schedule => {
                      const { isBar, isStart, isEnd } = getSegmentType(schedule, day);
                      const colorData = PRESET_COLORS.find(c => c.id === (schedule.color || 'blue')) || PRESET_COLORS[0];
                      
                      // Lane based vertical position
                      const topPos = schedule.lane * 28; 
                      
                      if (schedule.lane > 3) return null;

                      return (
                        <div
                          key={schedule.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScheduleClick(schedule);
                          }}
                          style={{ top: `${topPos}px` }}
                          className={`absolute left-0 right-0 ${getScheduleStyle(schedule, day)}`}
                        >
                           {isBar ? (
                             // Bar Style
                             <>
                               {isStart && (
                                 <div className="flex items-center gap-1.5 px-2 w-full h-full overflow-hidden">
                                   <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${colorData.bg}`} />
                                   <span className="truncate flex-1 font-bold text-[11px] tracking-tight">{schedule.title}</span>
                                 </div>
                               )}
                               {!isStart && <div className="h-full w-full" />}
                             </>
                           ) : (
                             // Dot Style
                             <div className="flex items-center gap-1.5 px-1.5 h-full overflow-hidden">
                               <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${colorData.bg}`} />
                               <span className="text-[9px] font-bold text-foreground/40 flex-shrink-0">{schedule.startTime}</span>
                               <span className="truncate flex-1 font-bold text-[11px] tracking-tight">{schedule.title}</span>
                             </div>
                           )}
                        </div>
                      );
                    })}
                    {/* Overflow label */}
                    {daySchedules.length > 4 && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayForDetail(day);
                        }}
                        className="absolute left-1 bottom-1.5 text-[10px] font-bold text-foreground/40 hover:text-primary transition-colors bg-white/90 py-0.5 px-1.5 rounded-md border border-border/50 shadow-sm"
                      >
                        + {daySchedules.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingScheduleId(null);
        }}
        title={
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${editingScheduleId ? 'bg-amber-50 text-amber-500' : 'bg-primary/10 text-primary'}`}>
              {editingScheduleId ? <CalendarIcon className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{editingScheduleId ? '일정 수정' : '일정 추가'}</h3>
              <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                {editingScheduleId ? '기존 일정을 편집합니다' : '새로운 계획을 세워보세요'}
              </p>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl">
            <button 
              onClick={() => setModalTab('event')}
              className={`px-4 py-2 text-sm font-bold transition-all rounded-xl ${modalTab === 'event' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:bg-muted'}`}
            >
              이벤트
            </button>
            <button 
              onClick={() => setModalTab('task')}
              className={`px-4 py-2 text-sm font-bold transition-all rounded-xl ${modalTab === 'task' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-foreground/40 hover:bg-muted'}`}
            >
              할 일 (Task)
            </button>
          </div>
        </div>
        }
      >
        <form onSubmit={handleSubmitSchedule} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-500 border border-red-100"
            >
              <AlertTriangle className="h-4 w-4" />
              {error}
            </motion.div>
          )}
          {/* Title Input */}
          <div>
            <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2 ml-1">일정 제목</label>
            <input
              autoFocus
              required
              type="text"
              placeholder="예: 디자인 중간 보고 피드백"
              value={newSchedule.title}
              onChange={(e) => {
                setNewSchedule({ ...newSchedule, title: e.target.value });
                if (error) setError('');
              }}
              className="w-full rounded-2xl border border-border bg-muted/30 px-5 py-4 text-sm font-medium transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>

          {/* Date, Time and All-day Selection */}
          <div className="space-y-4 rounded-2xl bg-muted/20 p-5 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={newSchedule.isAllDay}
                    onChange={(e) => setNewSchedule({ ...newSchedule, isAllDay: e.target.checked })}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border bg-white transition-all checked:border-primary checked:bg-primary"
                  />
                  <Check className="absolute left-1 top-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-xs font-bold text-foreground/60 group-hover:text-foreground transition-colors">종일 (All-day)</span>
              </label>
            </div>

            <div className="flex flex-col gap-3">
              {/* Start Row */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <CalendarIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/20" />
                  <input
                    required
                    type="date"
                    value={newSchedule.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white pl-11 pr-4 py-3 text-xs font-bold transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                  />
                </div>
                {!newSchedule.isAllDay && (
                  <div className="w-32 relative">
                    <Clock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/20" />
                    <input
                      type="time"
                      value={newSchedule.startTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                      className="w-full rounded-xl border border-border bg-white pl-9 pr-2 py-3 text-xs font-bold transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-center -my-1">
                 <div className="h-4 w-px bg-border/50" />
              </div>

              {/* End Row */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <CalendarIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/20" />
                  <input
                    required
                    type="date"
                    min={newSchedule.startDate}
                    value={newSchedule.endDate}
                    onChange={(e) => {
                      setNewSchedule({ ...newSchedule, endDate: e.target.value });
                      if (error) setError('');
                    }}
                    className="w-full rounded-xl border border-border bg-white pl-11 pr-4 py-3 text-xs font-bold transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                  />
                </div>
                {!newSchedule.isAllDay && (
                  <div className="w-32 relative">
                    <Clock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/20" />
                    <input
                      type="time"
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                      className="w-full rounded-xl border border-border bg-white pl-9 pr-2 py-3 text-xs font-bold transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Timezone Selection */}
            {!newSchedule.isAllDay && (
              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-4">
                {/* Start Timezone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest ml-1">시작 시간대</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/20" />
                    <select
                      value={newSchedule.startTimezone}
                      onChange={(e) => setNewSchedule({ ...newSchedule, startTimezone: e.target.value })}
                      className="w-full appearance-none rounded-xl border border-border bg-white pl-11 pr-10 py-3 text-xs font-bold transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer"
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz.id} value={tz.id}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20">
                      <ChevronLeft className="h-4 w-4 -rotate-90" />
                    </div>
                  </div>
                </div>

                {/* End Timezone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest ml-1">마감 시간대</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/20" />
                    <select
                      value={newSchedule.endTimezone}
                      onChange={(e) => setNewSchedule({ ...newSchedule, endTimezone: e.target.value })}
                      className="w-full appearance-none rounded-xl border border-border bg-white pl-11 pr-10 py-3 text-xs font-bold transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer"
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz.id} value={tz.id}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20">
                      <ChevronLeft className="h-4 w-4 -rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-3 ml-1">일정 색상</label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(color => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setNewSchedule({ ...newSchedule, color: color.id })}
                  className={`relative h-8 w-8 rounded-full transition-all hover:scale-110 ${color.bg} ${
                    newSchedule.color === color.id ? 'ring-4 ring-primary/20 scale-110' : ''
                  }`}
                >
                  {newSchedule.color === color.id && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className={`h-4 w-4 ${color.text}`} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'work', label: '실무', icon: <Briefcase className="h-3.5 w-3.5" /> },
              { id: 'meeting', label: '미팅', icon: <Users className="h-3.5 w-3.5" /> },
              { id: 'deadline', label: '마감', icon: <AlertTriangle className="h-3.5 w-3.5" /> }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setNewSchedule({ ...newSchedule, type: type.id })}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${
                  newSchedule.type === type.id 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border bg-white text-foreground/40 hover:bg-muted/50'
                }`}
              >
                {type.icon}
                <span className="text-[11px] font-bold">{type.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            {editingScheduleId && (
              <button
                type="button"
                onClick={() => {
                  const updatedSchedules = project.schedules.filter(s => s.id !== editingScheduleId);
                  onUpdateProject({ ...project, schedules: updatedSchedules });
                  setIsModalOpen(false);
                  setEditingScheduleId(null);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-bold text-red-500 transition-all hover:bg-red-100 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                삭제하기
              </button>
            )}
            <button
              type="submit"
              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-95 shadow-xl shadow-primary/20"
            >
              <span>{editingScheduleId ? '수정 사항 저장하기' : '일정 저장하기'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectScheduler;
