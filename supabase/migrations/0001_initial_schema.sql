-- Rudolph Schedule v1.0-alpha 초기 스키마
-- 디자인 에이전시 프로젝트 일정 관리

-- 1. projects 테이블
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  client_name text NOT NULL,
  project_name text NOT NULL,
  color_id text NOT NULL DEFAULT 'blue',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);

-- 2. schedules 테이블
CREATE TABLE IF NOT EXISTS schedules (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('event', 'deadline', 'milestone', 'note')),
  content text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  memo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedules_project ON schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start ON schedules(start_date);

-- 3. RLS (Row Level Security)
-- 공용 계정 방식이므로 인증된 사용자는 모든 데이터 접근 가능
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_users_all_access_projects"
  ON projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_users_all_access_schedules"
  ON schedules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
