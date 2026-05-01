import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { Project } from '../types/project';
import { projectToRow, scheduleToRow } from '../hooks/useSupabase';

const MIGRATION_FLAG_KEY = 'rudolph_migrated_to_supabase';
const PROJECTS_KEY = 'rudolph_schedule_data';

export interface MigrationResult {
  success: boolean;
  migratedProjects: number;
  migratedSchedules: number;
  reason?: string;
}

/**
 * localStorage → Supabase 1회 마이그레이션
 * - 이미 완료된 경우 스킵
 * - 실패해도 localStorage 데이터 유지 (안전)
 */
export async function migrateLocalStorageToSupabase(): Promise<MigrationResult> {
  if (!isSupabaseEnabled() || !supabase) {
    return { success: false, migratedProjects: 0, migratedSchedules: 0, reason: 'Supabase 미활성화' };
  }

  if (localStorage.getItem(MIGRATION_FLAG_KEY) === 'true') {
    return { success: true, migratedProjects: 0, migratedSchedules: 0, reason: '이미 완료됨' };
  }

  const rawData = localStorage.getItem(PROJECTS_KEY);
  if (!rawData) {
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
    return { success: true, migratedProjects: 0, migratedSchedules: 0, reason: '데이터 없음' };
  }

  try {
    const parsed = JSON.parse(rawData);
    const projects: Project[] = Array.isArray(parsed) ? parsed : [];

    if (projects.length === 0) {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return { success: true, migratedProjects: 0, migratedSchedules: 0, reason: '프로젝트 0개' };
    }

    const projectRows = projects.map(projectToRow);
    const { error: pError } = await supabase.from('projects').upsert(projectRows);
    if (pError) throw new Error(`projects: ${pError.message}`);

    const scheduleRows = projects.flatMap(p =>
      (p.schedules || []).map(s => scheduleToRow(p.id, s))
    );

    if (scheduleRows.length > 0) {
      const { error: sError } = await supabase.from('schedules').upsert(scheduleRows);
      if (sError) throw new Error(`schedules: ${sError.message}`);
    }

    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

    return {
      success: true,
      migratedProjects: projectRows.length,
      migratedSchedules: scheduleRows.length,
    };
  } catch (e) {
    return {
      success: false,
      migratedProjects: 0,
      migratedSchedules: 0,
      reason: (e as Error).message,
    };
  }
}
