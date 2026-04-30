import { format, getDay } from 'date-fns';

// 2026년 한국 공휴일 데이터
const HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': '신정',
  '2026-02-16': '설날',
  '2026-02-17': '설날',
  '2026-02-18': '설날',
  '2026-03-01': '3.1절',
  '2026-03-02': '3.1절 대체공휴일',
  '2026-05-05': '어린이날',
  '2026-05-24': '부처님 오신 날',
  '2026-05-25': '부처님 오신 날 대체공휴일',
  '2026-06-02': '제9회 전국동시지방선거',
  '2026-06-06': '현충일',
  '2026-08-15': '광복절',
  '2026-08-17': '광복절 대체공휴일',
  '2026-09-24': '추석',
  '2026-09-25': '추석',
  '2026-09-26': '추석',
  '2026-10-03': '개천절',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',
};

/**
 * 해당 날짜가 일요일인지 확인합니다.
 */
export const isSunday = (date: Date): boolean => {
  return getDay(date) === 0;
};

/**
 * 해당 날짜가 공휴일인지 확인합니다.
 */
export const isHoliday = (date: Date): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return !!HOLIDAYS_2026[dateStr];
};

/**
 * 공휴일 이름을 반환합니다.
 */
export const getHolidayName = (date: Date): string | null => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return HOLIDAYS_2026[dateStr] || null;
};
