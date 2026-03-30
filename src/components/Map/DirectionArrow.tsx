import maplibregl from 'maplibre-gl';
import type { PhotoZone } from '../../types/photozone';
import { createDirectionGeoJSON } from '../../utils/geo';

const SOURCE_ID = 'direction-source';
const ARC_LAYER_ID = 'direction-arc';
const ARROW_LAYER_ID = 'direction-arrow';

// 맵 로드 후 방향 표시 소스/레이어 등록 (초기에는 빈 데이터)
export function addDirectionLayers(map: maplibregl.Map) {
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  // 부채꼴 fill 레이어
  map.addLayer({
    id: ARC_LAYER_ID,
    type: 'fill',
    source: SOURCE_ID,
    filter: ['==', ['get', 'type'], 'arc'],
    paint: {
      'fill-color': 'rgba(59, 130, 246, 0.15)',
      'fill-outline-color': 'rgba(59, 130, 246, 0.4)',
    },
  });

  // 중심 화살표 line 레이어
  map.addLayer({
    id: ARROW_LAYER_ID,
    type: 'line',
    source: SOURCE_ID,
    filter: ['==', ['get', 'type'], 'arrow'],
    paint: {
      'line-color': '#3B82F6',
      'line-width': 3,
    },
  });
}

// 포토존 선택 변경 시 방향 데이터 갱신 (null이면 제거)
export function updateDirectionLayer(map: maplibregl.Map, zone: PhotoZone | null) {
  const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (!source) return;

  if (zone) {
    source.setData(createDirectionGeoJSON(zone) as GeoJSON.FeatureCollection);
  } else {
    source.setData({ type: 'FeatureCollection', features: [] });
  }
}
