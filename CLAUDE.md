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
├── App.tsx                        ← 메인 레이아웃 + 상태 관리 (MVP 완료)
├── main.tsx
├── index.css                      ← Tailwind + MapLibre CSS + spin 키프레임
├── data/photozones.ts             ← 7개 포토존 데이터 (ID 1개 실제값 적용)
├── types/photozone.ts             ← PhotoZone, MapViewState 타입
├── lib/
│   └── api.ts                     ← engine API 클라이언트 (에디트 모드 전용)
├── components/
│   ├── Editor/
│   │   ├── EditMode.tsx           ← 에디트 모드 메인 컨테이너 (?mode=edit)
│   │   ├── EditPhotoZoneList.tsx  ← draft/published 포토존 목록 + 필터
│   │   ├── DraggablePin.tsx       ← 2핀 드래그 맵 (별도 MapLibre 인스턴스)
│   │   └── EditPanel.tsx          ← 폼 (텍스트/슬라이더/저장 버튼)
│   ├── Map/MapView.tsx            ← MapLibre 지도 + 마커/방향/3D 통합
│   ├── Map/PhotoMarker.tsx        ← 인스타 썸네일 마커 (호버 떨림 버그 수정 완료)
│   ├── Map/DirectionArrow.tsx     ← 촬영 방향 화살표+부채꼴 레이어
│   ├── Map/Buildings3D.tsx        ← fill-extrusion 3D 건물
│   ├── Panel/PhotoZonePanel.tsx   ← 사이드 패널 (Desktop)
│   ├── Panel/BottomSheet.tsx      ← 모바일 바텀시트
│   ├── Panel/InstagramEmbed.tsx   ← 인스타 임베드
│   ├── Panel/YouTubePlayer.tsx    ← 유튜브 플레이어
│   ├── Panel/ShootingInfo.tsx     ← 촬영 정보 카드
│   ├── Navigation/PhotoZoneNav.tsx ← 하단 네비바
│   ├── Navigation/TourMode.tsx    ← 투어 진행바 UI
│   ├── UI/Header.tsx              ← 미구현 (헤더는 App.tsx 인라인으로 처리)
│   └── UI/ViewToggle.tsx          ← 2D/3D 토글 버튼
├── hooks/
│   ├── useMap.ts                  ← 맵 ref 홀더
│   ├── usePhotoZone.ts            ← 선택 상태 + viewMode 관리
│   ├── useTour.ts                 ← 투어 모드 로직
│   └── usePhotozones.ts           ← JSON fetch + 폴백 훅
└── utils/
    ├── geo.ts                     ← destinationPoint + createDirectionGeoJSON + calculateHeading
    └── camera.ts                  ← flyToPhotoZone / flyToOverview / toggle3DDirection / setMapLanguage
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

**Phase 4 이후 추가 완료** (2026-03-30)
- 마커 호버 위치 이탈 버그 수정: `el.style.transform` → CSS `scale` 프로퍼티
- 마커 호버 떨림 버그 수정: 외부 컨테이너(64px 히트 영역) + 내부 시각 요소(48px) 분리
- 지도 언어 전환: 헤더 버튼으로 KR → EN → JP → KR 순환 (`setMapLanguage` in camera.ts)
- Instagram embed 실제 동작 확인 (`DMpppNRTDJ_` 샘플 포스트 테스트 완료)

**포토존 데이터 동적 로딩** (2026-03-31)
- `src/hooks/usePhotozones.ts`: `public/data/photozones.json` fetch → 빈 배열이면 `FALLBACK_PHOTOZONES` 사용
- `src/data/photozones.ts`: `photozones` 배열 → `FALLBACK_PHOTOZONES`로 이름 변경 (폴백용)
- `MapView`, `PhotoZoneNav`: `photozones` 직접 import 제거 → `zones` prop으로 받도록 변경
- engine에서 JSON export: `python export.py --output ../snapstar/public/data/photozones.json`

## 에디트 모드 (관리자)

### 진입 방법
```
http://localhost:5173/?mode=edit
```
- URL에 `?mode=edit` 파라미터 → EditMode 컴포넌트 렌더링 (뷰 모드 완전 분리)
- `[🔙 뷰]` 버튼 → `?mode` 파라미터 제거 후 뷰 모드 복귀

### 사전 조건
- `snapstar-engine` 서버 실행 필요: `python server.py` (기본 포트 8000)
- engine 서버가 꺼져 있어도 에디트 모드 UI는 표시됨 (에러 메시지 표시)

### 2핀 시스템
- **📍 촬영자 핀 (파란색)**: 포토존의 `lat`, `lng` 위치. 드래그로 이동
- **🎯 타겟 핀 (빨간색)**: 촬영 방향 끝점. 초기 위치 = `destinationPoint(lat, lng, 200m, heading)`
- 타겟 핀 드래그 → 두 핀 사이의 heading 자동 계산 (`calculateHeading`)
- 촬영자 핀 드래그 → lat/lng 변경, heading 재계산 (타겟 핀 위치 유지)
- 부채꼴 FOV 시각화 실시간 업데이트

### 저장 플로우
1. **[💾 저장 (draft)]** → PUT /api/photozones/{id} (status=draft)
2. **[✅ Published로 저장]** → PUT + POST /api/photozones/export (JSON 파일 생성)
3. **[💾 전체 Export]** → POST /api/photozones/export (published 전체 export)

### 환경 변수
| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `VITE_API_BASE` | `http://localhost:8000` | engine API 서버 주소 |

## 배포 전 남은 작업

- [ ] 인스타 포스트 ID 나머지 6개 교체 (`src/data/photozones.ts` `FALLBACK_PHOTOZONES` 또는 engine JSON — `prince-shiba`는 완료)
- [ ] 유튜브 영상 ID 7개 교체 (`youtubeVideoId`)
- [ ] 썸네일 이미지 7장 준비 → `public/images/thumbnails/`
- [ ] OG 이미지 준비 → `public/images/og-image.png` (1200×630px 권장)
- [ ] MapTiler API 키 설정 (Vercel 대시보드 환경변수 `VITE_MAPTILER_KEY`)
- [ ] 모바일 헤더 언어 버튼 노출 여부 결정 (현재 데스크탑 전용)
- [ ] Vercel 배포

## 알려진 제약사항

- **인스타 캐러셀 슬라이드 감지 불가**: Instagram embed는 cross-origin iframe이므로 현재 슬라이드를 JS로 감지할 수 없음. 슬라이드별 포토존 연동이 필요하면 Instagram Graph API로 이미지를 직접 fetch해서 자체 캐러셀로 구현해야 함
- **모바일 언어 버튼 미노출**: 현재 언어 전환 버튼이 데스크탑 헤더에만 있고 모바일에는 없음

## 주의사항

- `VITE_MAPTILER_KEY`가 `placeholder_replace_me`이면 OpenFreeMap 폴백으로 작동
- `docs/` 폴더의 기획 문서는 수정하지 않는다
- node 경로: `/opt/homebrew/Cellar/node@22/22.22.2/bin` (PATH에 없으면 직접 지정 필요)

## 마커 호버 구조 (PhotoMarker.tsx)

호버 떨림 방지를 위해 2중 구조 사용:
- `el` (64px): MapLibre가 위치 제어 + 마우스 이벤트 감지 (히트 영역)
- `inner` (48px): 시각적 마커 요소, `transform: scale()` 적용 대상
- 48px * 1.3(최대 scale) = 62.4px < 64px(el) → 마우스가 항상 el 안에 유지

## 지도 언어 전환 (camera.ts > setMapLanguage)

- OpenMapTiles 스키마 공통: 모든 symbol 레이어의 `text-field` 교체
- `ko`: `['coalesce', ['get', 'name:ko'], ['get', 'name:ja'], ['get', 'name']]`
- `en`: `['coalesce', ['get', 'name:en'], ['get', 'name:ja'], ['get', 'name']]`
- `ja`: `['coalesce', ['get', 'name:ja'], ['get', 'name']]`
- MapTiler, OpenFreeMap 두 스타일 모두 동작

## 투어 모드 주의사항

- `useTour.ts`: stale closure 방지를 위해 `currentIndexRef` + `mapRef` 사용
- 투어 시작 시 `mapLoaded` 상태로 map 인스턴스 준비 여부 확인 후 훅에 전달
- 투어 활성 중 `currentIndex` 변경 → App.tsx의 useEffect가 `setSelectedZone` 호출 → 패널 자동 표시
- 수동 마커/네비바 클릭 → `handleZoneSelect`에서 `tour.stop()` 먼저 호출 후 포토존 선택

## fill-extrusion 3D 건물 소스 탐지

`Buildings3D.tsx`는 런타임에 소스 이름을 자동 탐지한다:
- OpenFreeMap liberty 스타일: `openmaptiles` (source-layer: `building`, 속성: `render_height`, `render_min_height`)
- MapTiler streets-v2: `maptiler_planet` (source-layer: `building`, 속성: `height`, `min_height`)
- 두 속성 모두 `coalesce`로 처리하므로 어느 쪽이든 작동
- 소스 탐지 실패 시 콘솔에 `[Buildings3D]` 경고 + `Object.keys(sources)` 출력

## thumbnailUrl 폴백 동작

`InstagramEmbed` 컴포넌트는 `thumbnailUrl` prop을 받아 폴백 이미지를 표시한다:
- postId가 placeholder(`INSTAGRAM_POST_ID`로 시작) + thumbnailUrl 있음 → 이미지 + "📷 Instagram에서 보기" 오버레이
- postId가 placeholder + thumbnailUrl 없음 → 기존 회색 박스
- 실제 postId + thumbnailUrl 있음 → 클릭 가능 썸네일 링크(IG 새탭) + 아래 embed 로드
- 실제 postId + thumbnailUrl 없음 → embed만 로드

`PhotoZonePanel`, `BottomSheet` 모두 `thumbnailUrl={zone.content.thumbnailUrl}` 전달 중.

`PhotoMarker.tsx`는 이미 thumbnailUrl 이미지 로드 → backgroundImage 설정, 실패 시 이모지 폴백 구조.

## Instagram embed.js 주의사항

- `index.html`에 `<script async defer src="https://www.instagram.com/embed.js"></script>` 추가
- `window.instgrm` 타입은 `InstagramEmbed.tsx`의 `declare global` 블록에 선언
- postId가 `'INSTAGRAM_POST_ID'`로 시작하면 실제 임베드 시도하지 않고 placeholder UI 표시
- embed.js가 async/defer로 로드되므로, 컴포넌트 마운트 시점에 `window.instgrm`이 없을 수 있음 → `window.instgrm?.Embeds.process()` 방식으로 안전하게 처리

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
