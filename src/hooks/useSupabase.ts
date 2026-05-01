import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { Project, Schedule } from '../types/project';

/**
 * Supabase 통합 훅 + CRUD
 * isSupabaseEnabled() === false일 때 호출하면 throw — 호출자(storage.ts)가 fallback 분기.
 */

export function useSupabaseStatus() {
  return {
    enabled: isSupabaseEnabled(),
    client: supabase,
  };
}

function ensureClient() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  return supabase;
}

interface ProjectRow {
  id: string;
  client_name: string;
  project_name: string;
  color_id: string;
  image_url: string | null;
}

interface ScheduleRow {
  id: string;
  project_id: string;
  type: Schedule['type'];
  title: string | null;
  content: string | null;
  color: string | null;
  is_all_day: boolean | null;
  start_time: string | null;
  end_time: string | null;
  category: string | null;
  start_date: string;
  end_date: string;
  memo: string | null;
}

export function projectToRow(p: Project): ProjectRow {
  return {
    id: p.id,
    client_name: p.clientName,
    project_name: p.projectName,
    color_id: 'blue',
    image_url: p.imageUrl ?? null,
  };
}

export function scheduleToRow(projectId: string, s: Schedule): Omit<ScheduleRow, 'created_at' | 'updated_at'> {
  return {
    id: s.id,
    project_id: projectId,
    type: s.type,
    title: s.title,
    content: s.title,
    color: s.color ?? null,
    is_all_day: s.isAllDay ?? true,
    start_time: s.startTime ?? null,
    end_time: s.endTime ?? null,
    category: s.category ?? null,
    start_date: s.startDate,
    end_date: s.endDate,
    memo: s.memo ?? null,
  };
}

export function rowToSchedule(r: ScheduleRow): Schedule {
  const validTypes: Schedule['type'][] = ['work', 'meeting', 'deadline'];
  const t = (validTypes as string[]).includes(r.type) ? r.type : 'work';
  const sched: Schedule = {
    id: r.id,
    title: r.title ?? r.content ?? '',
    startDate: typeof r.start_date === 'string' ? r.start_date.slice(0, 10) : r.start_date,
    endDate: typeof r.end_date === 'string' ? r.end_date.slice(0, 10) : r.end_date,
    isAllDay: r.is_all_day ?? true,
    color: r.color ?? 'blue',
    type: t as Schedule['type'],
  };
  if (r.start_time) sched.startTime = r.start_time;
  if (r.end_time) sched.endTime = r.end_time;
  if (r.category === 'event' || r.category === 'task') sched.category = r.category;
  if (r.memo) sched.memo = r.memo;
  return sched;
}

export function rowToProject(p: ProjectRow, schedules: Schedule[]): Project {
  return {
    id: p.id,
    clientName: p.client_name,
    projectName: p.project_name,
    imageUrl: p.image_url ?? undefined,
    schedules,
  };
}

// ===== Projects CRUD =====

export async function fetchAllProjects(): Promise<Project[]> {
  const client = ensureClient();
  const { data: pData, error: pErr } = await client.from('projects').select('*');
  if (pErr) throw new Error(`fetchAllProjects: ${pErr.message}`);
  const { data: sData, error: sErr } = await client.from('schedules').select('*');
  if (sErr) throw new Error(`fetchAllSchedules: ${sErr.message}`);

  const schedulesByProject = new Map<string, Schedule[]>();
  (sData as ScheduleRow[] | null)?.forEach(row => {
    const list = schedulesByProject.get(row.project_id) ?? [];
    list.push(rowToSchedule(row));
    schedulesByProject.set(row.project_id, list);
  });

  return ((pData as ProjectRow[] | null) ?? []).map(p =>
    rowToProject(p, schedulesByProject.get(p.id) ?? [])
  );
}

export async function upsertProject(project: Project): Promise<void> {
  const client = ensureClient();
  const { error: pErr } = await client.from('projects').upsert(projectToRow(project));
  if (pErr) throw new Error(`upsertProject: ${pErr.message}`);

  // 자식 schedules: 기존 삭제 후 재삽입 (단순 동기화)
  const { error: dErr } = await client.from('schedules').delete().eq('project_id', project.id);
  if (dErr) throw new Error(`upsertProject(delete schedules): ${dErr.message}`);

  if (project.schedules && project.schedules.length > 0) {
    const rows = project.schedules.map(s => scheduleToRow(project.id, s));
    const { error: sErr } = await client.from('schedules').insert(rows);
    if (sErr) throw new Error(`upsertProject(insert schedules): ${sErr.message}`);
  }
}

export async function deleteProjectRow(id: string): Promise<void> {
  const client = ensureClient();
  // schedules는 ON DELETE CASCADE로 자동 삭제됨
  const { error } = await client.from('projects').delete().eq('id', id);
  if (error) throw new Error(`deleteProjectRow: ${error.message}`);
}

// ===== Schedules CRUD (개별 단위, 필요 시 호출) =====

export async function fetchSchedulesByProject(projectId: string): Promise<Schedule[]> {
  const client = ensureClient();
  const { data, error } = await client.from('schedules').select('*').eq('project_id', projectId);
  if (error) throw new Error(`fetchSchedulesByProject: ${error.message}`);
  return ((data as ScheduleRow[] | null) ?? []).map(rowToSchedule);
}

export async function upsertSchedule(projectId: string, schedule: Schedule): Promise<void> {
  const client = ensureClient();
  const { error } = await client.from('schedules').upsert(scheduleToRow(projectId, schedule));
  if (error) throw new Error(`upsertSchedule: ${error.message}`);
}

export async function deleteScheduleRow(id: string): Promise<void> {
  const client = ensureClient();
  const { error } = await client.from('schedules').delete().eq('id', id);
  if (error) throw new Error(`deleteScheduleRow: ${error.message}`);
}
