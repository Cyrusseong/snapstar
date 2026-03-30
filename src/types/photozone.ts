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
