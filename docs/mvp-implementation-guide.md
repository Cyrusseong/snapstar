# 🚀 스냅스타 (SnapStar) MVP 구현 가이드 — 도쿄타워

> 검증 목표: "인스타 사진이 배치된 2D 맵에서 포토존을 발견하고, 촬영 디렉션을 확인하는 경험이 매력적인가?"

---

# 목차

1. [MVP 스코프 정의](#1-mvp-스코프-정의)
2. [기술 셋업](#2-기술-셋업)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [데이터 설계](#4-데이터-설계)
5. [컴포넌트 설계 + 레이아웃 와이어프레임](#5-컴포넌트-설계)
6. [태스크 분해 (Phase 1~4)](#6-태스크-분해)
7. [각 Phase 상세 구현 가이드](#7-각-phase-상세-구현-가이드)
8. [배포](#8-배포)

---

# 1. MVP 스코프 정의

## 만드는 것 ✅

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| 인스타 사진 2D 맵 | 지도 위에 인스타 썸네일이 마커로 배치 | P0 |
| 포토존 클릭 → 상세 패널 | 촬영 위치/방향/팁 + 인스타 임베드 + 유튜브 | P0 |
| 촬영 방향 표시 | 2D 맵에 촬영 방향 화살표 + 범위 부채꼴 | P0 |
| MapLibre 3D 디렉션 | pitch 전환으로 건물 높이 확인 (보조) | P1 |
| 포토존 네비게이션 바 | 하단 바에서 7곳 빠르게 전환 | P1 |
| 투어 모드 | 7곳 순차 슬라이드 | P2 |
| 모바일 반응형 | 바텀시트 + 플로팅 버튼 | P1 |
| Vercel 배포 | 무료 정적 호스팅 | P0 |

## 만들지 않는 것 ❌

| 기능 | 이유 | 시기 |
|------|------|------|
| 고퀄 3D 뷰어 (Three.js/가우시안 스플래팅) | MVP 범위 초과 | v2.0+ |
| AI 포토존 수집 | MVP는 수동 7곳 | v1.5 |
| 사용자 인증/UGC | MVP 불필요 | v2.0 |
| 여행 콘텐츠 (숙소/음식) | MVP 불필요 | v2.0 |
| 어필리에이션 | MVP 불필요 | v2.0 |
| 스케줄 최적화 | MVP 불필요 | v2.5 |
| 카메라 앱 | 별도 서비스 | v3.0 |
| DB (Supabase) | JSON 파일로 충분 | v1.5 |

## 검증할 가설

```
가설 1: 지도 위에 인스타 사진이 배치되면 사용자가 클릭하고 싶어한다
가설 2: 촬영 위치+방향 정보를 보면 "나도 가서 찍고 싶다"고 느낀다
가설 3: MapLibre 3D 디렉션이 촬영 방향 이해에 도움이 된다
가설 4: 7곳의 포토존만으로도 "더 많은 곳이 있으면 좋겠다"는 수요가 생긴다
```

---

# 2. 기술 셋업

## 2-1. 기술 스택

```
프레임워크:   React 18 + Vite
지도:        MapLibre GL JS (via react-map-gl)
타일:        MapTiler (무료 계정) 또는 OpenFreeMap
스타일링:     Tailwind CSS
인스타그램:   Instagram embed.js (oEmbed)
유튜브:      YouTube IFrame Player API
호스팅:      Vercel (무료)
언어:        TypeScript
```

## 2-2. 초기 프로젝트 생성

```bash
# 프로젝트 생성
npm create vite@latest snapstar -- --template react-ts
cd snapstar

# 핵심 의존성
npm install maplibre-gl react-map-gl
npm install -D tailwindcss @tailwindcss/vite

# 타입
npm install -D @types/maplibre-gl
```

## 2-3. 환경 변수

```bash
# .env.local
VITE_MAPTILER_KEY=your_maptiler_api_key

# 또는 OpenFreeMap 사용 시 키 불필요
# VITE_MAP_STYLE=https://tiles.openfreemap.org/styles/liberty
```

## 2-4. MapTiler 무료 계정 세팅

```
1. https://cloud.maptiler.com/account/ 가입
2. API Keys에서 키 복사
3. 월 100,000 맵뷰 무료 — MVP 검증에 충분
4. Streets v2 스타일 URL:
   https://api.maptiler.com/maps/streets-v2/style.json?key={YOUR_KEY}
```

---

# 3. 프로젝트 구조

```
snapstar/
├── public/
│   └── images/
│       └── thumbnails/          ← 포토존별 인스타 썸네일 (로컬 저장)
│           ├── tofuya-stairs.jpg
│           ├── zojoji-gate.jpg
│           └── ...
├── src/
│   ├── App.tsx                  ← 메인 레이아웃
│   ├── main.tsx                 ← 진입점
│   ├── index.css                ← Tailwind + 글로벌 스타일
│   │
│   ├── data/
│   │   └── photozones.ts        ← 7개 포토존 데이터 (JSON)
│   │
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapView.tsx      ← MapLibre 지도 컨테이너
│   │   │   ├── PhotoMarker.tsx  ← 인스타 썸네일 마커
│   │   │   ├── DirectionArrow.tsx ← 촬영 방향 화살표 레이어
│   │   │   └── Buildings3D.tsx  ← fill-extrusion 3D 건물
│   │   │
│   │   ├── Panel/
│   │   │   ├── PhotoZonePanel.tsx  ← 사이드 패널 (Desktop)
│   │   │   ├── BottomSheet.tsx    ← 바텀시트 (Mobile)
│   │   │   ├── InstagramEmbed.tsx ← 인스타 임베드
│   │   │   ├── YouTubePlayer.tsx  ← 유튜브 플레이어
│   │   │   └── ShootingInfo.tsx   ← 촬영 정보 (방향/팁/혼잡도)
│   │   │
│   │   ├── Navigation/
│   │   │   ├── PhotoZoneNav.tsx   ← 하단 네비게이션 바
│   │   │   └── TourMode.tsx      ← 투어 모드 컨트롤
│   │   │
│   │   └── UI/
│   │       ├── Header.tsx
│   │       └── ViewToggle.tsx    ← 2D/3D 전환 버튼
│   │
│   ├── hooks/
│   │   ├── useMap.ts            ← 맵 인스턴스 관리
│   │   ├── usePhotoZone.ts     ← 선택된 포토존 상태
│   │   └── useTour.ts          ← 투어 모드 로직
│   │
│   ├── utils/
│   │   ├── geo.ts              ← heading 계산, 거리 계산
│   │   └── camera.ts           ← flyTo 시퀀스 유틸
│   │
│   └── types/
│       └── photozone.ts        ← TypeScript 타입 정의
│
├── .env.local
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── vercel.json
```

---

# 4. 데이터 설계

## 4-1. TypeScript 타입 정의

```typescript
// src/types/photozone.ts

export interface PhotoZone {
  id: string;
  name: {
    ko: string;
    en: string;
    ja: string;
  };
  // 촬영자가 서는 위치
  location: {
    lat: number;
    lng: number;
  };
  // 카메라 파라미터
  camera: {
    heading: number;     // 촬영 방향 (0~360°)
    pitch: number;       // 촬영 각도 (-90°~+90°)
    fov: number;         // 화각 (도)
    height: number;      // 촬영자 높이 (m)
  };
  // 랜드마크 정보
  landmark: {
    lat: number;
    lng: number;
    distance: number;    // 타워까지 거리 (m)
    direction: string;   // 방향 설명 (east, north 등)
  };
  // 메타 정보
  meta: {
    description: string;
    shootingTip: string;
    bestTime: string[];         // ['morning', 'blue_hour'] 등
    crowdLevel: 1 | 2 | 3 | 4 | 5;
    difficulty: 'easy' | 'medium' | 'hard';
    icon: string;               // 이모지
    category: 'classic' | 'hidden' | 'seasonal';
  };
  // 콘텐츠
  content: {
    instagramPostId: string;    // 인스타 포스트 ID
    youtubeVideoId: string;     // 유튜브 영상 ID
    thumbnailUrl: string;       // 로컬 썸네일 경로
  };
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}
```

## 4-2. 포토존 데이터 (7곳)

```typescript
// src/data/photozones.ts

import type { PhotoZone } from '../types/photozone';

export const TOKYO_TOWER = {
  lat: 35.6586,
  lng: 139.7454,
};

export const photozones: PhotoZone[] = [
  {
    id: 'prince-shiba',
    name: { ko: '프린스 시바공원', en: 'Prince Shiba Park', ja: 'プリンス芝公園' },
    location: { lat: 35.6546, lng: 139.7477 },
    camera: { heading: 355, pitch: -5, fov: 60, height: 5 },
    landmark: { lat: 35.6586, lng: 139.7454, distance: 450, direction: 'north' },
    meta: {
      description: '넓은 잔디 위에서 도쿄타워를 정면으로 담는 클래식 스팟',
      shootingTip: '잔디에 앉아서 로우앵글로 찍으면 하늘이 넓게 담깁니다',
      bestTime: ['morning', 'afternoon'],
      crowdLevel: 2,
      difficulty: 'easy',
      icon: '🌳',
      category: 'classic',
    },
    content: {
      instagramPostId: 'INSTAGRAM_POST_ID_1',
      youtubeVideoId: 'YOUTUBE_VIDEO_ID_1',
      thumbnailUrl: '/images/thumbnails/prince-shiba.jpg',
    },
  },
  {
    id: 'shiba-park',
    name: { ko: '시바공원 잔디광장', en: 'Shiba Park Lawn', ja: '芝公園芝生広場' },
    location: { lat: 35.6539, lng: 139.7478 },
    camera: { heading: 358, pitch: -3, fov: 70, height: 3 },
    landmark: { lat: 35.6586, lng: 139.7454, distance: 530, direction: 'north' },
    meta: {
      description: '피크닉 분위기의 광각 뷰, 가족/친구 단체 사진에 최적',
      shootingTip: '광각(0.5x)으로 잔디+하늘+타워를 한 프레임에',
      bestTime: ['morning', 'afternoon'],
      crowdLevel: 3,
      difficulty: 'easy',
      icon: '🧺',
      category: 'classic',
    },
    content: {
      instagramPostId: 'INSTAGRAM_POST_ID_2',
      youtubeVideoId: 'YOUTUBE_VIDEO_ID_2',
      thumbnailUrl: '/images/thumbnails/shiba-park.jpg',
    },
  },
  {
    id: 'zojoji-gate',
    name: { ko: '조조지 삼해탈문', en: 'Zojoji Sangedatsumon', ja: '増上寺三解脱門' },
    location: { lat: 35.6553, lng: 139.7479 },
    camera: { heading: 340, pitch: -2, fov: 50, height: 5 },
    landmark: { lat: 35.6586, lng: 139.7454, distance: 320, direction: 'northwest' },
    meta: {
      description: '전통 사찰 문 너머로 보이는 도쿄타워 — 일본의 과거와 현재',
      shootingTip: '문 아치를 프레임으로 활용, 사람이 적을 때 촬영',
      bestTime: ['morning'],
      crowdLevel: 4,
      difficulty: 'medium',
      icon: '⛩️',
      category: 'classic',
    },
    content: {
      instagramPostId: 'INSTAGRAM_POST_ID_3',
      youtubeVideoId: 'YOUTUBE_VIDEO_ID_3',
      thumbnailUrl: '/images/thumbnails/zojoji-gate.jpg',
    },
  },
  {
    id: 'tofuya-stairs',
    name: { ko: '토후야우카이 계단', en: 'Tofuya-Ukai Stairs', ja: '東京タワー下階段' },
    location: { lat: 35.6563, lng: 139.7444 },
    camera: { heading: 75, pitch: 15, fov: 35, height: 2 },
    landmark: { lat: 35.6586, lng: 139.7454, distance: 150, direction: 'east' },
    meta: {
      description: '인스타 인기 1위! 계단 아래에서 올려다보는 압도적 앵글',
      shootingTip: '계단 아래 중앙에서 세로 구도, 피사체를 3번째 계단에 배치',
      bestTime: ['morning', 'blue_hour'],
      crowdLevel: 5,
      difficulty: 'medium',
      icon: '📸',
      category: 'hidden',
    },
    content: {
      instagramPostId: 'INSTAGRAM_POST_ID_4',
      youtubeVideoId: 'YOUTUBE_VIDEO_ID_4',
      thumbnailUrl: '/images/thumbnails/tofuya-stairs.jpg',
    },
  },
  {
    id: 'akabanebashi',
    name: { ko: '아카바네바시 횡단보도', en: 'Akabanebashi Crosswalk', ja: '赤羽橋横断歩道' },
    location: { lat: 35.6553, lng: 139.7457 },
    camera: { heading: 5, pitch: -3, fov: 50, height: 5 },
    landmark: { lat: 35.6586, lng: 139.7454, distance: 380, direction: 'north' },
    meta: {
      description: '도시 감성 거리뷰 — 횡단보도+타워 조합',
      shootingTip: '신호 대기 중 횡단보도 줄무늬가 타워로 이어지는 구도',
      bestTime: ['blue_hour', 'night'],
      crowdLevel: 3,
      difficulty: 'easy',
      icon: '🚶',
      category: 'classic',
    },
    content: {
      instagramPostId: 'INSTAGRAM_POST_ID_5',
      youtubeVideoId: 'YOUTUBE_VIDEO_ID_5',
      thumbnailUrl: '/images/thumbnails/akabanebashi.jpg',
    },
  },
  {
    id: 'seven-eleven-roppongi',
    name: { ko: '세븐일레븐 롯폰기5쵸메', en: '7-Eleven Roppongi 5', ja: 'セブンイレブン六本木5丁目' },
    location: { lat: 35.6584, lng: 139.7364 },
    camera: { heading: 95, pitch: -1, fov: 45, height: 5 },
    landmark: { lat: 35.6586, lng: 139.7454, distance: 820, direction: 'east' },
    meta: {
      description: '건물 사이로 보이는 먼 도쿄타워 야경 — 도시 감성 끝판왕',
      shootingTip: '야경 필수, 삼각대 추천, 건물 사이 프레이밍',
      bestTime: ['night'],
      crowdLevel: 1,
      difficulty: 'hard',
      icon: '🏙️',
      category: 'hidden',
    },
    content: {
      instagramPostId: 'INSTAGRAM_POST_ID_6',
      youtubeVideoId: 'YOUTUBE_VIDEO_ID_6',
      thumbnailUrl: '/images/thumbnails/seven-eleven.jpg',
    },
  },
  {
    id: 'kumano-shrine',
    name: { ko: '구마노신사 골목', en: 'Kumano Shrine Alley', ja: '熊野神社路地' },
    location: { lat: 35.6572, lng: 139.7463 },
    camera: { heading: 55, pitch: 0, fov: 40, height: 5 },
    landmark: { lat: 35.6586, lng: 139.7454, distance: 200, direction: 'northeast' },
    meta: {
      description: '일본풍 골목 너머로 보이는 타워 — 숨은 로컬 스팟',
      shootingTip: '골목 양쪽 건물을 프레임으로 활용, 주간/야간 모두 좋음',
      bestTime: ['afternoon', 'night'],
      crowdLevel: 1,
      difficulty: 'medium',
      icon: '🏮',
      category: 'hidden',
    },
    content: {
      instagramPostId: 'INSTAGRAM_POST_ID_7',
      youtubeVideoId: 'YOUTUBE_VIDEO_ID_7',
      thumbnailUrl: '/images/thumbnails/kumano-shrine.jpg',
    },
  },
];

// 맵 초기 뷰
export const INITIAL_VIEW: MapViewState = {
  center: [139.7454, 35.6586],
  zoom: 15,
  pitch: 0,
  bearing: 0,
};
```

---

# 5. 컴포넌트 설계

## 5-1. 컴포넌트 트리

```
<App>
  ├── <Header />
  ├── <MapView>                        ← MapLibre 지도
  │    ├── <PhotoMarker /> × 7         ← 인스타 썸네일 마커
  │    ├── <DirectionArrow />          ← 선택된 포토존의 촬영 방향
  │    └── <Buildings3D />             ← fill-extrusion (3D 모드 시)
  ├── <PhotoZonePanel />               ← Desktop: 사이드 패널
  │    ├── <InstagramEmbed />
  │    ├── <YouTubePlayer />
  │    └── <ShootingInfo />
  ├── <BottomSheet />                  ← Mobile: 바텀시트
  ├── <PhotoZoneNav />                 ← 하단 네비게이션 바
  ├── <ViewToggle />                   ← 2D/3D 전환 버튼
  └── <TourMode />                     ← 투어 모드 오버레이
```

## 5-2. 상태 관리 (React Context 또는 Zustand)

```typescript
// 핵심 상태
interface AppState {
  // 선택된 포토존
  selectedZone: PhotoZone | null;
  setSelectedZone: (zone: PhotoZone | null) => void;
  
  // 맵 뷰 모드
  viewMode: '2d' | '3d';
  setViewMode: (mode: '2d' | '3d') => void;
  
  // 투어 모드
  isTourActive: boolean;
  tourIndex: number;
  
  // 패널 상태 (모바일)
  isPanelOpen: boolean;
}
```

## 5-3. 핵심 인터랙션 플로우

```
[사용자 액션]              [시스템 반응]
─────────────             ─────────────

맵 로드                    → 7개 인스타 썸네일 마커 표시 (2D, pitch 0)
                           → 도쿄타워 중심, zoom 15

썸네일 마커 호버            → 마커 확대 애니메이션

썸네일 마커 클릭            → map.flyTo({ center, zoom:17, bearing:heading })
                           → 촬영 방향 화살표 + 부채꼴 표시
                           → 사이드 패널 오픈 (인스타+유튜브+팁)

"3D 디렉션 보기" 클릭      → map.easeTo({ pitch: 70 })
                           → fill-extrusion 건물 활성화

"2D로 돌아가기" 클릭       → map.easeTo({ pitch: 0 })

네비바에서 다른 포토존 클릭  → 기존 포토존 해제
                           → 새 포토존으로 flyTo

"전체보기" 클릭             → returnToOverview()
                           → 패널 닫기

"투어 시작" 클릭            → 5초 간격으로 7곳 순차 flyTo
                           → 각 포토존에서 패널 자동 표시
```

## 5-4. 레이아웃 와이어프레임

### 상태 A — 초기 진입 (Desktop 1440px+)

포토존 미선택 상태. 2D 맵에 인스타 썸네일 마커 7곳 표시.

```
┌─ 헤더 (56px) ──────────────────────────────────────────────────────┐
│                                                                    │
│  📸 Tokyo Tower                                                    │
│     Photo Zones     [🗼 전체보기]  [▶ 투어]  [KR|EN|JP]  [ℹ️]      │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                    2D MAP (MapLibre, pitch 0)                       │
│                                                                    │
│            ┌─────┐                                                 │
│            │📷⑥  │                                                 │
│            └─────┘                                                 │
│                          ┌─────┐                                   │
│      ┌─────┐             │📷⑤  │                                   │
│      │📷⑦  │             └─────┘                                   │
│      └─────┘    ★🗼                                                │
│                          ┌─────┐                                   │
│                          │📷③  │                                   │
│            ┌─────┐       └─────┘                                   │
│            │📷④  │                                                 │
│            │인기  │                ┌─────┐                          │
│            │ 1위  │               │📷②  │                          │
│            └─────┘               └─────┘                           │
│                                  ┌─────┐                           │
│                                  │📷①  │                           │
│                                  └─────┘                           │
│                                                                    │
│     📸 마커 = 인스타 썸네일 (48×48px, 둥근 모서리, 흰 테두리)       │
│     호버 시 1.3배 확대 애니메이션                                   │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  네비게이션 바 (64px)                                               │
│                                                                    │
│  [🌳 시바공원] [🧺 잔디광장] [⛩️ 조조지] [📸 토후야] [🚶 아카바네]  │
│  [🏙️ 롯폰기] [🏮 구마노]                                          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 상태 B — 포토존 선택됨 (Desktop)

포토존 클릭 후. 맵이 해당 위치로 flyTo, 촬영 방향 표시, 사이드 패널 오픈.

```
┌─ 헤더 (56px) ──────────────────────────────────────────────────────┐
│  📸 SnapStar · Tokyo Tower     [🗼 전체보기]  [▶ 투어]  [KR|EN|JP]│
├──────────────────────────────────────────┬─────────────────────────┤
│                                          │  CONTENT PANEL (400px)  │
│     2D MAP (zoom 17, bearing 75°)        │                         │
│                                          │  📸 토후야우카이 계단    │
│                                          │  ⭐ 인스타 인기 1위      │
│     📍촬영자 위치                         │                         │
│      ╲                                   │  ┌───────────────────┐ │
│       ╲  ← 촬영 방향 화살표              │  │                   │ │
│        ╲   (heading 75°)                 │  │  Instagram Embed  │ │
│     ╱   ╲                                │  │  (인스타 사진)      │ │
│    ╱ 부채꼴 ╲  ← fov 35° 범위            │  │                   │ │
│   ╱    🗼    ╲                           │  └───────────────────┘ │
│                                          │                         │
│                                          │  💡 촬영 팁              │
│                                          │  "계단 아래 중앙에서     │
│  ┌───────────────────────┐               │   세로 구도, 피사체를    │
│  │ [🏔️ 3D 디렉션 보기]  │               │   3번째 계단에 배치"     │
│  └───────────────────────┘               │                         │
│                                          │  📐 heading 75°         │
│                                          │  📏 타워까지 150m        │
│                                          │  🕐 추천: 오전, 블루아워  │
│                                          │  👥 혼잡도: ●●●●●        │
│                                          │  📊 난이도: 중간          │
│                                          │                         │
│                                          │  ┌───────────────────┐ │
│                                          │  │  YouTube Player   │ │
│                                          │  └───────────────────┘ │
│                                          │                         │
│                                          │  [🗺️ 길찾기 열기]       │
│                                          │  [📤 공유하기]           │
├──────────────────────────────────────────┴─────────────────────────┤
│  [🌳①] [🧺②] [⛩️③] [📸④ ← 선택됨] [🚶⑤] [🏙️⑥] [🏮⑦]           │
└────────────────────────────────────────────────────────────────────┘
```

### 상태 C — 3D 디렉션 모드 (Desktop)

"3D 디렉션 보기" 클릭 후. 같은 레이아웃, pitch만 70°로 전환.

```
┌─ 헤더 ─────────────────────────────────────────────────────────────┐
│  📸 SnapStar · Tokyo Tower     [🗼 전체보기]  [▶ 투어]            │
├──────────────────────────────────────────┬─────────────────────────┤
│                                          │                         │
│     MapLibre 3D (pitch 70°)              │  (동일 CONTENT PANEL)   │
│                                          │                         │
│         ╱╲                               │                         │
│        ╱  ╲  ← 건물 높이 표시            │                         │
│       ╱    ╲   (fill-extrusion)          │                         │
│      ╱  🗼  ╲                            │                         │
│     ╱________╲                           │                         │
│                                          │                         │
│     📍→ 촬영 방향 (3D에서도 표시)         │                         │
│                                          │                         │
│  ┌───────────────────────┐               │                         │
│  │ [🗺️ 2D로 돌아가기]   │               │                         │
│  └───────────────────────┘               │                         │
│                                          │                         │
├──────────────────────────────────────────┴─────────────────────────┤
│  [🌳①] [🧺②] [⛩️③] [📸④ ← 선택됨] [🚶⑤] [🏙️⑥] [🏮⑦]           │
└────────────────────────────────────────────────────────────────────┘
```

### 상태 D — 투어 모드 (Desktop)

투어 진행 중. 상단에 투어 진행바 오버레이.

```
┌─ 헤더 ─────────────────────────────────────────────────────────────┐
│  📸 SnapStar · Tokyo Tower                                       │
├─ 투어 진행바 ──────────────────────────────────────────────────────┤
│                                                                    │
│  ① ━━ ② ━━ ③ ━━ [④] ━━ ⑤ ━━ ⑥ ━━ ⑦     [⏸ 일시정지] [⏭ 건너뛰기] │
│               ━━━━━━●━━━━━━                [✕ 종료]                │
├──────────────────────────────────────────┬─────────────────────────┤
│                                          │                         │
│     맵 자동 flyTo 중                      │  현재 포토존 정보        │
│     (5초 간격으로 이동)                    │  자동 표시              │
│                                          │                         │
├──────────────────────────────────────────┴─────────────────────────┤
│  [🌳①] [🧺②] [⛩️③] [📸④ ← 현재] [🚶⑤] [🏙️⑥] [🏮⑦]             │
└────────────────────────────────────────────────────────────────────┘
```

### 상태 E — 모바일 초기 진입 (< 768px)

```
┌──────────────────────────┐
│ 📸 SnapStar     [≡]   │  ← 헤더 (48px)
├──────────────────────────┤
│                          │
│                          │
│    2D MAP (MapLibre)     │  ← 전체 화면
│                          │
│    인스타 썸네일 마커      │
│    7곳 표시               │
│                          │
│                          │
│                          │
│                          │
│               [▶ 투어]   │  ← 플로팅 버튼 (우하단)
├──────────────────────────┤
│  [🌳][🧺][⛩️][📸][🚶]...│  ← 하단 네비바 (가로 스크롤)
└──────────────────────────┘
```

### 상태 F — 모바일 포토존 선택 (바텀시트)

마커 클릭 후. 맵이 상단 55%로 줄어들고, 바텀시트가 올라옴.

```
┌──────────────────────────┐
│ 📸 SnapStar     [≡]   │
├──────────────────────────┤
│                          │
│  2D MAP (축소)            │  ← 상단 55%
│  촬영 방향 화살표 표시     │
│                          │
│  [🏔️ 3D]                │  ← 플로팅 버튼
├──────────────────────────┤
│  ▔▔▔ (드래그 핸들)        │  ← 바텀시트 (스와이프 업/다운)
│                          │
│  📸 토후야우카이 계단      │
│  ⭐ 인스타 인기 1위        │
│                          │
│  ┌──────┐ ┌──────────┐  │
│  │인스타 │ │ YouTube  │  │  ← 가로 스크롤
│  │      │ │          │  │
│  └──────┘ └──────────┘  │
│                          │
│  💡 계단 아래 중앙에서     │
│     세로 구도 추천         │
│                          │
│  📐 75° 📏 150m 🕐 오전   │
│  👥 ●●●●● 📊 중간         │
│                          │
│  [🗺️ 길찾기] [📤 공유]   │
├──────────────────────────┤
│  [🌳][🧺][⛩️][📸][🚶]...│
└──────────────────────────┘
```

### 상태 G — 모바일 바텀시트 확장 (풀스크린)

바텀시트를 위로 풀 스와이프 시. 맵이 숨고 콘텐츠가 전체 표시.

```
┌──────────────────────────┐
│ 📸 SnapStar  [🗺️ 맵]  │  ← 맵 복귀 버튼
├──────────────────────────┤
│  ▔▔▔                     │
│                          │
│  📸 토후야우카이 계단      │
│  ⭐ 인스타 인기 1위        │
│                          │
│  ┌──────────────────────┐│
│  │                      ││
│  │  Instagram Embed     ││  ← 큰 사이즈
│  │  (인스타 사진)         ││
│  │                      ││
│  └──────────────────────┘│
│                          │
│  💡 촬영 팁               │
│  "계단 아래 중앙에서       │
│   세로 구도, 피사체를      │
│   3번째 계단에 배치"       │
│                          │
│  📐 heading 75°           │
│  📏 타워까지 150m          │
│  🕐 추천: 오전, 블루아워    │
│  👥 혼잡도: ●●●●●          │
│                          │
│  ┌──────────────────────┐│
│  │  YouTube Player      ││
│  └──────────────────────┘│
│                          │
│  [🗺️ 길찾기] [📤 공유]   │
├──────────────────────────┤
│  [🌳][🧺][⛩️][📸][🚶]...│
└──────────────────────────┘
```

### 컴포넌트 ↔ 와이어프레임 매핑

```
┌─────────────────────────────────────────────────────┐
│ 와이어프레임 영역          → 컴포넌트               │
├─────────────────────────────────────────────────────┤
│ 헤더                       → <Header />             │
│ 2D MAP 전체                → <MapView />             │
│  └ 인스타 썸네일 마커       → <PhotoMarker /> × 7     │
│  └ 촬영 방향 화살표+부채꼴  → <DirectionArrow />      │
│  └ 3D 건물 (pitch 70 시)   → <Buildings3D />         │
│  └ 플로팅 버튼              → <ViewToggle />          │
│ CONTENT PANEL (Desktop)    → <PhotoZonePanel />      │
│  └ 인스타 임베드            → <InstagramEmbed />      │
│  └ 유튜브 플레이어          → <YouTubePlayer />       │
│  └ 촬영 정보                → <ShootingInfo />        │
│ 바텀시트 (Mobile)          → <BottomSheet />         │
│  └ (내부 구성은 Panel과 동일)                         │
│ 네비게이션 바               → <PhotoZoneNav />        │
│ 투어 진행바                 → <TourMode />            │
└─────────────────────────────┴───────────────────────┘
```

---

# 6. 태스크 분해

```
Phase 1: 뼈대 (1~2일)
━━━━━━━━━━━━━━━━━━━━━
  □ 프로젝트 생성 (Vite + React + TS)
  □ Tailwind CSS 세팅
  □ MapTiler 계정 + API 키
  □ MapLibre 지도 렌더링 (도쿄타워 중심)
  □ 기본 레이아웃 (헤더 + 맵 + 사이드패널 영역)
  ────────────────────
  완료 기준: 브라우저에서 도쿄타워 주변 지도가 보인다

Phase 2: 마커 + 카메라 (2~3일)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  □ 포토존 데이터 7곳 입력 (photozones.ts)
  □ 인스타 썸네일 이미지 7장 준비
  □ 커스텀 마커 컴포넌트 (썸네일 이미지)
  □ 마커 호버 → 확대 애니메이션
  □ 마커 클릭 → flyTo 카메라 전환
  □ 촬영 방향 화살표 (GeoJSON line 레이어)
  □ 촬영 범위 부채꼴 (GeoJSON polygon 레이어)
  □ "전체보기" 복귀 기능
  □ 3D 디렉션 토글 (pitch 0 ↔ 70)
  □ fill-extrusion 3D 건물 레이어
  ────────────────────
  완료 기준: 마커 클릭 시 해당 포토존으로 날아가고
            촬영 방향이 화살표로 표시된다

Phase 3: 콘텐츠 패널 (2~3일)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  □ Desktop 사이드 패널 레이아웃
  □ Instagram embed 연동
  □ YouTube IFrame Player 연동
  □ 촬영 정보 표시 (방향/거리/팁/혼잡도/추천시간)
  □ 하단 포토존 네비게이션 바
  □ Mobile 바텀시트 (스와이프 업/다운)
  □ 반응형 분기 (Desktop ↔ Mobile)
  ────────────────────
  완료 기준: 포토존 선택 시 인스타+유튜브+촬영정보가
            패널에 표시되고, 모바일에서도 작동한다

Phase 4: 투어 + 마무리 (1~2일)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  □ 투어 모드 (5초 간격 자동 순회)
  □ 투어 진행바 + 일시정지/건너뛰기
  □ OG 태그 + 메타 태그 (공유용)
  □ 파비콘 + 로고
  □ 로딩 상태 처리
  □ Vercel 배포 + 도메인 연결
  □ 모바일 최종 테스트
  ────────────────────
  완료 기준: 배포 완료, URL 공유 가능,
            모바일에서 전체 플로우 문제없이 동작
```

**총 예상: 6~10일 (1인 기준)**

---

# 7. 각 Phase 상세 구현 가이드

## Phase 1: 뼈대

### MapLibre 지도 초기화

```typescript
// src/components/Map/MapView.tsx
import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { INITIAL_VIEW } from '../../data/photozones';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      maxPitch: 85,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => map.current?.remove();
  }, []);

  return <div ref={mapContainer} className="w-full h-full" />;
}
```

### 기본 레이아웃

```typescript
// src/App.tsx
export default function App() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex relative">
        <MapView />
        <PhotoZonePanel />     {/* Desktop: absolute right */}
        <BottomSheet />        {/* Mobile: absolute bottom */}
      </div>
      <PhotoZoneNav />
    </div>
  );
}
```

## Phase 2: 마커 + 카메라

### 인스타 썸네일 마커

```typescript
// src/components/Map/PhotoMarker.tsx
// MapLibre Marker로 커스텀 HTML 엘리먼트 사용

export function addPhotoMarkers(map: maplibregl.Map, zones: PhotoZone[], onSelect: (zone: PhotoZone) => void) {
  zones.forEach(zone => {
    const el = document.createElement('div');
    el.className = 'photo-marker';
    el.style.backgroundImage = `url(${zone.content.thumbnailUrl})`;
    el.style.width = '48px';
    el.style.height = '48px';
    el.style.borderRadius = '8px';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';
    el.style.transition = 'transform 0.2s';

    el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.3)'; });
    el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
    el.addEventListener('click', () => onSelect(zone));

    new maplibregl.Marker({ element: el })
      .setLngLat([zone.location.lng, zone.location.lat])
      .addTo(map);
  });
}
```

### 촬영 방향 화살표 + 부채꼴

```typescript
// src/utils/geo.ts
export function createDirectionGeoJSON(zone: PhotoZone): GeoJSON.FeatureCollection {
  const { lat, lng } = zone.location;
  const heading = zone.camera.heading;
  const fov = zone.camera.fov;
  const distance = Math.min(zone.landmark.distance, 200); // 최대 200m

  // 부채꼴 (촬영 범위)
  const arcPoints = [];
  const startAngle = heading - fov / 2;
  const endAngle = heading + fov / 2;
  arcPoints.push([lng, lat]); // 중심점
  for (let angle = startAngle; angle <= endAngle; angle += 2) {
    arcPoints.push(destinationPoint(lat, lng, distance, angle));
  }
  arcPoints.push([lng, lat]); // 닫기

  // 중심 화살표 (heading 방향)
  const arrowEnd = destinationPoint(lat, lng, distance, heading);

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { type: 'arc' },
        geometry: { type: 'Polygon', coordinates: [arcPoints] },
      },
      {
        type: 'Feature',
        properties: { type: 'arrow' },
        geometry: { type: 'LineString', coordinates: [[lng, lat], arrowEnd] },
      },
    ],
  };
}
```

### flyTo 카메라 전환

```typescript
// src/utils/camera.ts
export function flyToPhotoZone(map: maplibregl.Map, zone: PhotoZone) {
  map.flyTo({
    center: [zone.location.lng, zone.location.lat],
    zoom: 17,
    bearing: zone.camera.heading,
    pitch: 0, // 2D 모드 유지
    duration: 2500,
    essential: true,
  });
}

export function flyToOverview(map: maplibregl.Map) {
  map.flyTo({
    center: INITIAL_VIEW.center,
    zoom: INITIAL_VIEW.zoom,
    pitch: 0,
    bearing: 0,
    duration: 2000,
  });
}

export function toggle3DDirection(map: maplibregl.Map, is3D: boolean) {
  map.easeTo({
    pitch: is3D ? 70 : 0,
    duration: 1000,
  });
}
```

## Phase 3: 콘텐츠 패널

### Instagram 임베드

```typescript
// src/components/Panel/InstagramEmbed.tsx
import { useEffect, useRef } from 'react';

export function InstagramEmbed({ postId }: { postId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !postId) return;

    containerRef.current.innerHTML = `
      <blockquote class="instagram-media" 
        data-instgrm-permalink="https://www.instagram.com/p/${postId}/"
        data-instgrm-version="14"
        style="max-width:100%;">
      </blockquote>`;

    // embed.js 리프레시
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [postId]);

  return <div ref={containerRef} />;
}
```

### YouTube 플레이어

```typescript
// src/components/Panel/YouTubePlayer.tsx
export function YouTubePlayer({ videoId }: { videoId: string }) {
  return (
    <div className="aspect-video w-full">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        allowFullScreen
      />
    </div>
  );
}
```

## Phase 4: 투어 모드

```typescript
// src/hooks/useTour.ts
import { useState, useEffect, useCallback } from 'react';

export function useTour(map: maplibregl.Map | null, zones: PhotoZone[]) {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive || !map) return;

    const timer = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % zones.length;
      setCurrentIndex(nextIndex);
      flyToPhotoZone(map, zones[nextIndex]);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isActive, currentIndex, map, zones]);

  const start = useCallback(() => {
    setCurrentIndex(0);
    setIsActive(true);
    if (map) flyToPhotoZone(map, zones[0]);
  }, [map, zones]);

  const stop = useCallback(() => setIsActive(false), []);
  const skip = useCallback(() => {
    const next = (currentIndex + 1) % zones.length;
    setCurrentIndex(next);
    if (map) flyToPhotoZone(map, zones[next]);
  }, [currentIndex, map, zones]);

  return { isActive, currentIndex, start, stop, skip };
}
```

---

# 8. 배포

## Vercel 배포

```bash
# Vercel CLI 설치 (또는 GitHub 연동으로 자동 배포)
npm i -g vercel
vercel

# 환경 변수 설정 (Vercel 대시보드)
# VITE_MAPTILER_KEY = your_key
```

## vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## 배포 체크리스트

```
□ MapTiler API 키가 환경변수에 설정됨
□ 인스타 포스트 ID 7개가 유효함 (공개 계정)
□ 유튜브 영상 ID 7개가 유효함
□ 썸네일 이미지 7장이 /public/images/thumbnails/에 있음
□ 모바일에서 바텀시트가 정상 동작
□ OG 태그로 공유 시 미리보기 표시됨
□ Vercel에 배포 완료, URL 접속 가능
```

---

*스냅스타 (SnapStar) MVP 구현 가이드 v1.0 | 2026-03-30*
