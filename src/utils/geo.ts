import type { PhotoZone } from '../types/photozone';

// 위도/경도에서 bearing 방향으로 distance(m)만큼 이동한 좌표를 반환
// GeoJSON 좌표 순서: [lng, lat]
export function destinationPoint(
  lat: number,
  lng: number,
  distance: number,
  bearing: number
): [number, number] {
  const R = 6371000; // 지구 반지름 (m)
  const δ = distance / R;
  const θ = (bearing * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

  return [(λ2 * 180) / Math.PI, (φ2 * 180) / Math.PI];
}

// 포토존의 촬영 방향 GeoJSON 생성
// features: 부채꼴 Polygon (arc) + 중심 화살표 LineString (arrow)
export function createDirectionGeoJSON(zone: PhotoZone): GeoJSON.FeatureCollection {
  const { lat, lng } = zone.location;
  const heading = zone.camera.heading;
  const fov = zone.camera.fov;
  const distance = Math.min(zone.landmark.distance, 200); // 최대 200m

  // 부채꼴: heading ± fov/2 범위 호
  const arcPoints: [number, number][] = [];
  const startAngle = heading - fov / 2;
  const endAngle = heading + fov / 2;
  arcPoints.push([lng, lat]);
  for (let angle = startAngle; angle <= endAngle; angle += 2) {
    arcPoints.push(destinationPoint(lat, lng, distance, angle));
  }
  arcPoints.push([lng, lat]); // polygon 닫기

  // 중심 화살표
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
        geometry: {
          type: 'LineString',
          coordinates: [[lng, lat], arrowEnd],
        },
      },
    ],
  };
}
