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
├── App.tsx                        ← 메인 레이아웃 + 상태 관리 (Phase 2 완료)
├── main.tsx
├── index.css                      ← Tailwind + MapLibre CSS import
├── data/photozones.ts             ← 7개 포토존 데이터
├── types/photozone.ts             ← PhotoZone, MapViewState 타입
├── components/
│   ├── Map/MapView.tsx            ← MapLibre 지도 + 마커/방향/3D 통합 (Phase 2 완료)
│   ├── Map/PhotoMarker.tsx        ← 인스타 썸네일 마커 (Phase 2 완료)
│   ├── Map/DirectionArrow.tsx     ← 촬영 방향 화살표+부채꼴 레이어 (Phase 2 완료)
│   ├── Map/Buildings3D.tsx        ← fill-extrusion 3D 건물 (Phase 2 완료)
│   ├── Panel/PhotoZonePanel.tsx   ← TODO Phase 3
│   ├── Panel/BottomSheet.tsx      ← TODO Phase 3
│   ├── Panel/InstagramEmbed.tsx   ← TODO Phase 3
│   ├── Panel/YouTubePlayer.tsx    ← TODO Phase 3
│   ├── Panel/ShootingInfo.tsx     ← TODO Phase 3
│   ├── Navigation/PhotoZoneNav.tsx ← 하단 네비바 (Phase 2 완료)
│   ├── Navigation/TourMode.tsx    ← TODO Phase 4
│   ├── UI/Header.tsx              ← TODO Phase 3
│   └── UI/ViewToggle.tsx          ← 2D/3D 토글 버튼 (Phase 2 완료)
├── hooks/
│   ├── useMap.ts                  ← 맵 ref 홀더 (Phase 2 완료)
│   ├── usePhotoZone.ts            ← 선택 상태 + viewMode 관리 (Phase 2 완료)
│   └── useTour.ts                 ← TODO Phase 4
└── utils/
    ├── geo.ts                     ← destinationPoint + createDirectionGeoJSON (Phase 2 완료)
    └── camera.ts                  ← flyToPhotoZone / flyToOverview / toggle3DDirection (Phase 2 완료)
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

**Phase 2 완료** (2026-03-30)
- 7개 포토존 마커 (이모지 placeholder, 이미지 파일 추가 시 자동 전환)
- 마커 클릭/네비바 클릭 → flyTo 카메라 전환 (zoom 17, bearing=heading)
- 촬영 방향 화살표 + 부채꼴 GeoJSON 레이어
- 2D/3D 토글 버튼 (pitch 0 ↔ 70, easeTo 1000ms)
- fill-extrusion 3D 건물 레이어 (소스 자동 탐지)
- 하단 네비바 선택 하이라이트 + 전체보기 복귀

**Phase 3 대기** — 사이드 패널, 인스타 임베드, 유튜브 플레이어, 촬영 정보, 모바일 바텀시트

## 주의사항

- `VITE_MAPTILER_KEY`가 `placeholder_replace_me`이면 OpenFreeMap 폴백으로 작동
- 인스타/유튜브 ID는 현재 placeholder (`INSTAGRAM_POST_ID_1` 형태) — Phase 3에서 실제 ID로 교체 필요
- `docs/` 폴더의 기획 문서는 수정하지 않는다
- node 경로: `/opt/homebrew/Cellar/node@22/22.22.2/bin` (PATH에 없으면 직접 지정 필요)

## fill-extrusion 3D 건물 소스 탐지

`Buildings3D.tsx`는 런타임에 소스 이름을 자동 탐지한다:
- OpenFreeMap liberty 스타일: `openmaptiles` (source-layer: `building`, 속성: `render_height`, `render_min_height`)
- MapTiler streets-v2: `maptiler_planet` (source-layer: `building`, 속성: `height`, `min_height`)
- 두 속성 모두 `coalesce`로 처리하므로 어느 쪽이든 작동
- 소스 탐지 실패 시 콘솔에 `[Buildings3D]` 경고 + `Object.keys(sources)` 출력

## 아키텍처 결정사항 (Phase 2)

- MapView는 map 인스턴스를 내부 ref로 관리, `onMapReady(map)` 콜백으로 App에 전달
- 마커/방향레이어/3D건물은 모두 MapView 안에서 map.on('load') 후 초기화
- stale closure 방지: `onZoneSelectRef`, `onMapReadyRef`로 최신 콜백 유지
- viewMode는 App의 state + ref 이중 관리 (state: 렌더링, ref: 콜백 내 최신값)
- selectedZone 변경 → useEffect로 direction layer + marker selection 갱신
