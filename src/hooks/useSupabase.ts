import { supabase, isSupabaseEnabled } from '../lib/supabase';

/**
 * Supabase 통합 훅 (스켈레톤)
 * 실제 CRUD 함수는 다음 STEP에서 구현됩니다.
 * 현재는 isSupabaseEnabled() === false면 자동으로 localStorage 사용.
 */

export function useSupabaseStatus() {
  return {
    enabled: isSupabaseEnabled(),
    client: supabase,
  };
}

// TODO: 다음 STEP에서 구현
// export function useProjects() { ... }
// export function useSchedules(projectId: string) { ... }
