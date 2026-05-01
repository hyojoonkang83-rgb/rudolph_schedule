-- 사이트 설정 테이블 (비밀번호 해시 등)
-- Phase 1: 단순 KV 구조
-- Phase 2: 멀티 테넌시 시 organization_id 컬럼 추가 가능

CREATE TABLE IF NOT EXISTS site_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS update_site_config_updated_at ON site_config;
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- 익명 SELECT 허용 (해시만 저장하니 안전)
DROP POLICY IF EXISTS "site_config_public_read" ON site_config;
CREATE POLICY "site_config_public_read"
  ON site_config FOR SELECT
  TO public
  USING (true);

-- INSERT/UPDATE/DELETE는 service_role만 (joon님이 Supabase 대시보드에서)
