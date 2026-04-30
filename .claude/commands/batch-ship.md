---
description: 기획서로부터 프론트/백엔드 코드를 동시에 생성하고 로컬 서버 테스트까지 원스톱 실행
---

1. 입력된 기획서(또는 요구사항)를 분석하여 `Implementation Plan`을 자동 생성합니다.
2. [Sequential] 백엔드 DB 스키마 및 API 명세를 먼저 구축합니다.
3. [Parallel] 프론트엔드 UI 컴포넌트(Tailwind 디자인 토큰 준수)를 생성합니다.
4. `npm run dev`를 실행하고 `Browser Subagent`로 주요 기능을 자동 테스트합니다.
5. 테스트 결과와 함께 배포 준비 완료 상태를 `ship_log.md`로 보고합니다.
