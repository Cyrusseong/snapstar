import type { PhotoZone, MapViewState } from '../types/photozone';

export const TOKYO_TOWER = {
  lat: 35.6586,
  lng: 139.7454,
};

export const FALLBACK_PHOTOZONES: PhotoZone[] = [
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
      instagramPostId: 'DMpppNRTDJ_',
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
