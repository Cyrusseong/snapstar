# SnapStar — CLAUDE.md

## 프로젝트 개요

도쿄타워 포토존 맵 서비스 MVP. 지도 위에 인스타 썸네일 마커를 배치하고, 포토존 클릭 시 촬영 방향/팁/인스타·유튜브 콘텐츠를 제공한다.

## 기술 스택

- **프레임워크**: React 18 + Vite + TypeScript
- **지도**: MapLibre GL JS (직접 사용, react-map-gl 설치됨)
- **타일**: MapTiler Streets v2 (키 필요) / OpenFreeMap 폴백
- **스타일링**: Tailwind CSS v4 (@tailwindcss/vite 플러그인 방식)

## 폴더 구조 요약

```
src/
├── App.tsx                        ← 메인 레이아웃 (헤더 + 맵 + 하단 네비바)
├── main.tsx
├── index.css                      ← Tailwind + MapLibre CSS import
├── data/photozones.ts             ← 7개 포토존 데이터
├── types/photozone.ts             ← PhotoZone, MapViewState 타입
├── components/
│   ├── Map/MapView.tsx            ← MapLibre 지도 (구현됨)
│   ├── Map/PhotoMarker.tsx        ← TODO Phase 2
│   ├── Map/DirectionArrow.tsx     ← TODO Phase 2
│   ├── Map/Buildings3D.tsx        ← TODO Phase 3
│   ├── Panel/PhotoZonePanel.tsx   ← TODO Phase 2
│   ├── Panel/BottomSheet.tsx      ← TODO Phase 2
│   ├── Panel/InstagramEmbed.tsx   ← TODO Phase 2
│   ├── Panel/YouTubePlayer.tsx    ← TODO Phase 2
│   ├── Panel/ShootingInfo.tsx     ← TODO Phase 2
│   ├── Navigation/PhotoZoneNav.tsx ← TODO Phase 2
│   ├── Navigation/TourMode.tsx    ← TODO Phase 3
│   ├── UI/Header.tsx              ← TODO Phase 2
│   └── UI/ViewToggle.tsx          ← TODO Phase 3
├── hooks/
│   ├── useMap.ts                  ← TODO Phase 2
│   ├── usePhotoZone.ts            ← TODO Phase 2
│   └── useTour.ts                 ← TODO Phase 3
└── utils/
    ├── geo.ts                     ← TODO Phase 2
    └── camera.ts                  ← TODO Phase 2
```

## 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 환경 변수

`.env.local` 파일에 설정:

| 변수명 | 설명 |
|--------|------|
| `VITE_MAPTILER_KEY` | MapTiler API 키. placeholder 상태면 OpenFreeMap 폴백 사용 |

MapTiler 무료 계정: https://cloud.maptiler.com/account/
- 월 100,000 맵뷰 무료
- Streets v2 스타일 URL: `https://api.maptiler.com/maps/streets-v2/style.json?key={KEY}`

## 참고 문서

- `docs/mvp-implementation-guide.md` — 프로젝트 구조, 타입 정의, 포토존 데이터, 컴포넌트 설계, 와이어프레임
- `docs/final-comprehensive-plan.md` — 서비스 비전, UX 플로우, 화면 레이아웃

## 현재 진행 상태

**Phase 1 완료** (2026-03-30)
- 프로젝트 초기 세팅 완료
- MapLibre 지도 렌더링 (도쿄타워 중심, zoom 15)
- 기본 레이아웃: 헤더 + 맵 + 하단 네비바
- 7개 포토존 데이터 및 타입 정의 완료
- Phase 2~4 컴포넌트 빈 파일(TODO) 생성 완료

**Phase 2 대기** — 인스타 썸네일 마커, 사이드 패널, 촬영 방향 표시, 상태 관리

## 주의사항

- `VITE_MAPTILER_KEY`가 `placeholder_replace_me`이면 OpenFreeMap 폴백으로 작동
- 인스타/유튜브 ID는 현재 placeholder (`INSTAGRAM_POST_ID_1` 형태) — Phase 2에서 실제 ID로 교체 필요
- `docs/` 폴더의 기획 문서는 수정하지 않는다
- node 경로: `/opt/homebrew/Cellar/node@22/22.22.2/bin` (PATH에 없으면 직접 지정 필요)
