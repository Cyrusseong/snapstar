/**
 * engine API 클라이언트 (localhost:8000)
 * 에디트 모드 전용
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

/** engine DB의 포토존 raw 데이터 (flat 구조) */
export interface ApiPhotoZone {
  id: string;
  lat: number;
  lng: number;
  landmark_id: string;
  heading: number | null;
  distance_to_landmark: number | null;
  direction_to_landmark: string | null;
  pitch: number | null;
  fov: number | null;
  camera_height: number;
  name_ko: string;
  name_en: string;
  name_ja: string;
  description: string;
  shooting_tip: string;
  best_time: string[];
  crowd_level: number;
  difficulty: string;
  icon: string;
  category: string;
  instagram_post_id: string | null;
  youtube_video_id: string | null;
  thumbnail_url: string | null;
  status: string;
}

export interface PhotoZoneUpdate {
  lat?: number;
  lng?: number;
  target_lat?: number;
  target_lng?: number;
  heading?: number;
  pitch?: number;
  fov?: number;
  camera_height?: number;
  name_ko?: string;
  name_en?: string;
  name_ja?: string;
  description?: string;
  shooting_tip?: string;
  best_time?: string[];
  crowd_level?: number;
  difficulty?: string;
  icon?: string;
  category?: string;
  status?: string;
}

const ERR_MSG = 'API 연결 실패. engine 서버가 실행 중인지 확인하세요.';

/** 포토존 목록 조회 */
export async function fetchPhotozones(status?: string): Promise<ApiPhotoZone[]> {
  const url = status && status !== 'all'
    ? `${API_BASE}/api/photozones?status=${status}`
    : `${API_BASE}/api/photozones`;
  const res = await fetch(url).catch(() => { throw new Error(ERR_MSG); });
  if (!res.ok) throw new Error(`${ERR_MSG} (${res.status})`);
  return res.json();
}

/** 포토존 부분 업데이트 */
export async function updatePhotozone(id: string, data: PhotoZoneUpdate): Promise<void> {
  const res = await fetch(`${API_BASE}/api/photozones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => { throw new Error(ERR_MSG); });
  if (!res.ok) throw new Error(`저장 실패 (${res.status})`);
}

/** published 포토존 → JSON export 트리거 */
export async function triggerExport(): Promise<number> {
  const res = await fetch(`${API_BASE}/api/photozones/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  }).catch(() => { throw new Error(ERR_MSG); });
  if (!res.ok) throw new Error(`Export 실패 (${res.status})`);
  const data = await res.json();
  return data.count ?? 0;
}
