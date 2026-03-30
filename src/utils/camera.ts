import maplibregl from 'maplibre-gl';
import type { PhotoZone } from '../types/photozone';
import { INITIAL_VIEW } from '../data/photozones';

// 포토존으로 카메라 전환
export function flyToPhotoZone(
  map: maplibregl.Map,
  zone: PhotoZone,
  viewMode: '2d' | '3d' = '2d'
) {
  map.flyTo({
    center: [zone.location.lng, zone.location.lat],
    zoom: 17,
    bearing: zone.camera.heading,
    pitch: viewMode === '3d' ? 70 : 0,
    duration: 2500,
    essential: true,
  });
}

// 전체보기로 복귀
export function flyToOverview(map: maplibregl.Map) {
  map.flyTo({
    center: INITIAL_VIEW.center,
    zoom: INITIAL_VIEW.zoom,
    pitch: 0,
    bearing: 0,
    duration: 2000,
  });
}

// 2D/3D 전환 (pitch만 easeTo)
export function toggle3DDirection(map: maplibregl.Map, is3D: boolean) {
  map.easeTo({
    pitch: is3D ? 70 : 0,
    duration: 1000,
  });
}
