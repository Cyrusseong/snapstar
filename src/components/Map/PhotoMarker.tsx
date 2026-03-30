import maplibregl from 'maplibre-gl';
import type { PhotoZone } from '../../types/photozone';

export interface MarkerHandle {
  marker: maplibregl.Marker;
  element: HTMLDivElement;
  zone: PhotoZone;
}

// 7개 포토존 마커를 지도에 추가하고 핸들 반환
// 썸네일 이미지가 없을 경우 이모지 fallback
export function addPhotoMarkers(
  map: maplibregl.Map,
  zones: PhotoZone[],
  onSelect: (zone: PhotoZone) => void
): MarkerHandle[] {
  return zones.map((zone) => {
    const el = document.createElement('div');

    // 기본 스타일
    el.style.width = '48px';
    el.style.height = '48px';
    el.style.borderRadius = '8px';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    el.style.transition = 'transform 0.2s, border-color 0.2s';
    el.style.overflow = 'hidden';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontSize = '24px';
    el.style.backgroundColor = '#f8f8f8';
    el.style.userSelect = 'none';

    // 썸네일 이미지 시도 — 로드 실패 시 이모지로 fallback
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url(${zone.content.thumbnailUrl})`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
    };
    img.onerror = () => {
      el.textContent = zone.meta.icon;
    };
    img.src = zone.content.thumbnailUrl;
    // 이미지 로드 전 기본값
    el.textContent = zone.meta.icon;

    // 호버 애니메이션 (선택된 마커는 scale 유지)
    el.addEventListener('mouseenter', () => {
      if (el.dataset.selected !== 'true') {
        el.style.transform = 'scale(1.3)';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (el.dataset.selected !== 'true') {
        el.style.transform = 'scale(1)';
      }
    });
    el.addEventListener('click', () => onSelect(zone));

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([zone.location.lng, zone.location.lat])
      .addTo(map);

    return { marker, element: el, zone };
  });
}

// 선택 상태에 따라 마커 시각적 상태 업데이트
export function updateMarkerSelection(handles: MarkerHandle[], selectedId: string | null) {
  handles.forEach(({ element, zone }) => {
    const isSelected = zone.id === selectedId;
    element.dataset.selected = isSelected ? 'true' : 'false';
    element.style.border = isSelected ? '3px solid #3B82F6' : '3px solid white';
    element.style.transform = isSelected ? 'scale(1.15)' : 'scale(1)';
  });
}
