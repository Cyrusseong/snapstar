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
│   ├── Panel/PhotoZonePanel.tsx   ← 사이드 패널 (Phase 3 완료)
│   ├── Panel/BottomSheet.tsx      ← 모바일 바텀시트 (Phase 3 완료)
│   ├── Panel/InstagramEmbed.tsx   ← 인스타 임베드 (Phase 3 완료)
│   ├── Panel/YouTubePlayer.tsx    ← 유튜브 플레이어 (Phase 3 완료)
│   ├── Panel/ShootingInfo.tsx     ← 촬영 정보 카드 (Phase 3 완료)
│   ├── Navigation/PhotoZoneNav.tsx ← 하단 네비바 (Phase 2 완료)
│   ├── Navigation/TourMode.tsx    ← 투어 진행바 UI (Phase 4 완료)
│   ├── UI/Header.tsx              ← TODO (미구현, 헤더는 App.tsx 인라인)
│   └── UI/ViewToggle.tsx          ← 2D/3D 토글 버튼 (Phase 2 완료)
├── hooks/
│   ├── useMap.ts                  ← 맵 ref 홀더 (Phase 2 완료)
│   ├── usePhotoZone.ts            ← 선택 상태 + viewMode 관리 (Phase 2 완료)
│   └── useTour.ts                 ← 투어 모드 로직 (Phase 4 완료)
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

**Phase 3 완료** (2026-03-30)
- 사이드 패널 (Desktop, 400px, 슬라이드 애니메이션)
- 인스타 임베드 (placeholder UI 포함)
- 유튜브 플레이어 (placeholder UI 포함, 16:9 aspect-ratio)
- 촬영 정보 카드 (팁/방향/거리/혼잡도/난이도/추천시간)
- 모바일 바텀시트 (3단계 스냅: collapsed/middle/expanded, 터치 드래그)
- 반응형 분기: 768px 기준 window.matchMedia
- 모바일 헤더: 48px + 햄버거 아이콘

**Phase 4 완료 — MVP 전체 완료** (2026-03-30)
- 투어 모드: 7곳 5초 간격 자동 순회, 일시정지/재개/건너뛰기/종료
- 투어 진행바 UI: 스텝 하이라이트 + 프로그레스 바 + 컨트롤 버튼
- 투어 중 패널/바텀시트 자동 표시, 수동 클릭 시 투어 자동 종료
- 맵 로딩 인디케이터 (타일 로드 완료 전 스피너 표시)
- OG 태그 + Twitter 카드 메타 태그 추가
- 파비콘: 카메라 아이콘 SVG로 교체
- vercel.json: buildCommand/outputDirectory/framework 필드 추가
- `npm run build` 성공 확인

## 다음 단계 (배포 전 필요 작업)

- [ ] 실제 인스타 포스트 ID 7개 교체 (`src/data/photozones.ts` > `instagramPostId`)
- [ ] 실제 유튜브 영상 ID 7개 교체 (`youtubeVideoId`)
- [ ] 썸네일 이미지 7장 준비 → `public/images/thumbnails/` 에 추가
- [ ] MapTiler API 키 설정 (Vercel 대시보드 환경변수 `VITE_MAPTILER_KEY`)
- [ ] OG 이미지 준비 → `public/images/og-image.png` (1200×630px 권장)
- [ ] Vercel 배포: `vercel` CLI 또는 GitHub 연동

## 주의사항

- `VITE_MAPTILER_KEY`가 `placeholder_replace_me`이면 OpenFreeMap 폴백으로 작동
- 인스타/유튜브 ID는 현재 placeholder (`INSTAGRAM_POST_ID_1` 형태) — 실제 ID로 교체 필요
- `docs/` 폴더의 기획 문서는 수정하지 않는다
- node 경로: `/opt/homebrew/Cellar/node@22/22.22.2/bin` (PATH에 없으면 직접 지정 필요)

## 투어 모드 주의사항

- `useTour.ts`: stale closure 방지를 위해 `currentIndexRef` + `mapRef` 사용 (useEffect 콜백 내에서 최신값 참조)
- 투어 시작 시 `mapLoaded` 상태로 map 인스턴스 준비 여부 확인 후 훅에 전달
- 투어 활성 중 `currentIndex` 변경 → App.tsx의 useEffect가 `setSelectedZone` 호출 → 패널 자동 표시
- 수동 마커/네비바 클릭 → `handleZoneSelect`에서 `tour.stop()` 먼저 호출 후 포토존 선택
- `TourMode.tsx`는 헤더 바로 아래 `shrink-0` flex 아이템으로 배치 (레이아웃 밀림 없음)

## fill-extrusion 3D 건물 소스 탐지

`Buildings3D.tsx`는 런타임에 소스 이름을 자동 탐지한다:
- OpenFreeMap liberty 스타일: `openmaptiles` (source-layer: `building`, 속성: `render_height`, `render_min_height`)
- MapTiler streets-v2: `maptiler_planet` (source-layer: `building`, 속성: `height`, `min_height`)
- 두 속성 모두 `coalesce`로 처리하므로 어느 쪽이든 작동
- 소스 탐지 실패 시 콘솔에 `[Buildings3D]` 경고 + `Object.keys(sources)` 출력

## Instagram embed.js 주의사항

- `index.html`에 `<script async defer src="https://www.instagram.com/embed.js"></script>` 추가
- `window.instgrm` 타입은 `InstagramEmbed.tsx`의 `declare global` 블록에 선언
- postId가 `'INSTAGRAM_POST_ID'`로 시작하면 실제 임베드 시도하지 않고 placeholder UI 표시
- embed.js가 async/defer로 로드되므로, 컴포넌트 마운트 시점에 `window.instgrm`이 없을 수 있음 → `window.instgrm?.Embeds.process()` 방식으로 안전하게 처리
- 실제 postId가 세팅되면 useEffect의 의존성 배열([postId])에 의해 자동 재처리됨

## 아키텍처 결정사항 (Phase 2)

- MapView는 map 인스턴스를 내부 ref로 관리, `onMapReady(map)` 콜백으로 App에 전달
- 마커/방향레이어/3D건물은 모두 MapView 안에서 map.on('load') 후 초기화
- stale closure 방지: `onZoneSelectRef`, `onMapReadyRef`로 최신 콜백 유지
- viewMode는 App의 state + ref 이중 관리 (state: 렌더링, ref: 콜백 내 최신값)
- selectedZone 변경 → useEffect로 direction layer + marker selection 갱신

## 아키텍처 결정사항 (Phase 3)

- PhotoZonePanel: `width` inline style + CSS transition으로 슬라이드 애니메이션 (Tailwind 동적 클래스 purge 이슈 회피)
- BottomSheet: snap state('collapsed'|'middle'|'expanded') + touchstart/move/end 이벤트로 드래그 구현. 드래그 중에는 `transition: none`, 드래그 종료 시 `transition: ''`로 복원 후 snap height 적용
- 반응형 분기: App.tsx에서 `window.matchMedia('(max-width: 767px)')` 로 isMobile state 관리. MediaQueryList `change` 이벤트로 리사이즈 대응
- BottomSheet는 맵 컨테이너(`relative`) 내부에 `absolute bottom-0`으로 배치
- 모바일/데스크탑 각각의 컴포넌트를 `isMobile` state로 조건부 렌더링 (CSS hidden 아닌 js 분기)
