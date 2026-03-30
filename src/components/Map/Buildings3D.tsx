import maplibregl from 'maplibre-gl';

// fill-extrusion 3D 건물 레이어 추가
// 타일 소스 이름은 런타임에 탐지: OpenFreeMap=openmaptiles, MapTiler=maptiler_planet
export function addBuildings3D(map: maplibregl.Map) {
  const sources = map.getStyle().sources;

  // 알려진 소스 이름 순서대로 탐색
  const candidates = ['openmaptiles', 'maptiler_planet', 'maptiler', 'composite'];
  let buildingSource: string | null = null;
  for (const name of candidates) {
    if (sources[name]) {
      buildingSource = name;
      break;
    }
  }

  // 알려진 이름이 없으면 첫 번째 vector 소스 사용
  if (!buildingSource) {
    for (const [name, src] of Object.entries(sources)) {
      if ((src as { type: string }).type === 'vector') {
        buildingSource = name;
        break;
      }
    }
  }

  if (!buildingSource) {
    // TODO: 소스를 찾지 못한 경우 — map.getStyle().sources를 콘솔에서 확인 필요
    console.warn('[Buildings3D] 건물 소스를 찾지 못했습니다:', Object.keys(sources));
    return;
  }

  if (map.getLayer('buildings-3d')) return; // 중복 방지

  map.addLayer({
    id: 'buildings-3d',
    type: 'fill-extrusion',
    source: buildingSource,
    'source-layer': 'building',
    paint: {
      'fill-extrusion-color': '#c8c8c8',
      // render_height(OpenFreeMap) 또는 height(MapTiler) 모두 대응
      'fill-extrusion-height': [
        'coalesce',
        ['get', 'render_height'],
        ['get', 'height'],
        10,
      ],
      'fill-extrusion-base': [
        'coalesce',
        ['get', 'render_min_height'],
        ['get', 'min_height'],
        0,
      ],
      'fill-extrusion-opacity': 0.75,
    },
  });
}
