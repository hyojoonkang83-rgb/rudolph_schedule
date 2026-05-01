-- Schedule 컬럼을 실제 TS 타입(Schedule)에 맞게 확장
-- 추가 필드: title, color, is_all_day, start_time, end_time, category
-- 기존 content는 호환을 위해 nullable로 완화
-- type CHECK 제약을 TS 값('work', 'meeting', 'deadline')까지 허용

-- 1) 컬럼 확장 (additive, 기존 데이터 영향 없음)
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS is_all_day boolean DEFAULT true;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS start_time text;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS end_time text;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS category text;

-- 2) content NOT NULL 제약 완화 (title 사용 시 content는 비어 있을 수 있음)
ALTER TABLE schedules ALTER COLUMN content DROP NOT NULL;

-- 3) type CHECK 확장 (기존 4종 + TS 3종 모두 허용)
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_type_check;
ALTER TABLE schedules
  ADD CONSTRAINT schedules_type_check
  CHECK (type IN ('event', 'deadline', 'milestone', 'note', 'work', 'meeting'));
