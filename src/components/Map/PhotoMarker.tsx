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
    // 외부 컨테이너: MapLibre가 위치 제어, 크기 고정 (scale 여유 포함)
    // 48px * 1.3 = 62.4px → 64px으로 히트 영역 확보해 hover 떨림 방지
    const el = document.createElement('div');
    el.style.width = '64px';
    el.style.height = '64px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';

    // 내부 시각 요소: scale 애니메이션 적용 대상
    const inner = document.createElement('div');
    inner.style.width = '48px';
    inner.style.height = '48px';
    inner.style.borderRadius = '8px';
    inner.style.border = '3px solid white';
    inner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    inner.style.overflow = 'hidden';
    inner.style.display = 'flex';
    inner.style.alignItems = 'center';
    inner.style.justifyContent = 'center';
    inner.style.fontSize = '24px';
    inner.style.backgroundColor = '#f8f8f8';
    inner.style.userSelect = 'none';
    inner.style.transition = 'transform 0.2s, border-color 0.2s';
    el.appendChild(inner);

    // 썸네일 이미지 시도 — 로드 실패 시 이모지로 fallback
    const img = new Image();
    img.onload = () => {
      inner.style.backgroundImage = `url(${zone.content.thumbnailUrl})`;
      inner.style.backgroundSize = 'cover';
      inner.style.backgroundPosition = 'center';
      inner.textContent = '';
    };
    img.onerror = () => {
      inner.textContent = zone.meta.icon;
    };
    img.src = zone.content.thumbnailUrl;
    inner.textContent = zone.meta.icon;

    // 호버 애니메이션: el(64px) 기준으로 이벤트 감지 → inner에 transform 적용
    el.addEventListener('mouseenter', () => {
      if (el.dataset.selected !== 'true') {
        inner.style.transform = 'scale(1.3)';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (el.dataset.selected !== 'true') {
        inner.style.transform = 'scale(1)';
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
    const inner = element.firstElementChild as HTMLElement;
    const isSelected = zone.id === selectedId;
    element.dataset.selected = isSelected ? 'true' : 'false';
    inner.style.border = isSelected ? '3px solid #3B82F6' : '3px solid white';
    inner.style.transform = isSelected ? 'scale(1.15)' : 'scale(1)';
  });
}
