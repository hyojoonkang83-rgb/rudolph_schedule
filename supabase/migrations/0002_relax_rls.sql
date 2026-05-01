-- RLS 정책 완화: 인증 없이 모든 사용자 접근 허용
-- 회사 내부 5명 사용 + Vercel.app URL 비공개 의존
-- 보안 강화는 PasswordGate (다음 STEP)에서 추가

DROP POLICY IF EXISTS "authenticated_users_all_access_projects" ON projects;
DROP POLICY IF EXISTS "authenticated_users_all_access_schedules" ON schedules;

CREATE POLICY "all_users_access_projects"
  ON projects FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "all_users_access_schedules"
  ON schedules FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
