export interface Schedule {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  isAllDay: boolean;
  color: string;
  type: 'work' | 'meeting' | 'deadline';
  category?: 'event' | 'task';
  startTimezone?: string;
  endTimezone?: string;
  lane?: number;
}

export interface Project {
  id: string;
  clientName: string;
  projectName: string;
  imageUrl?: string;
  schedules: Schedule[];
}
