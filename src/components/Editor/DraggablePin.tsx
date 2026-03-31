/**
 * 에디트 맵 컴포넌트 — 2핀 드래그 + 부채꼴 FOV 시각화
 * 별도 MapLibre 인스턴스 사용 (뷰 모드와 완전 분리)
 */
import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { destinationPoint } from '../../utils/geo';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE =
  MAPTILER_KEY && MAPTILER_KEY !== 'placeholder_replace_me'
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
    : 'https://tiles.openfreemap.org/styles/liberty';

const DIRECTION_SOURCE = 'edit-direction';
const ARC_LAYER = 'edit-arc';
const ARROW_LAYER = 'edit-arrow';

interface Props {
  shooterLat: number;
  shooterLng: number;
  targetLat: number;
  targetLng: number;
  heading: number;
  fov: number;
  pitch: number;
  onShooterDragEnd: (lat: number, lng: number) => void;
  onTargetDragEnd: (lat: number, lng: number) => void;
  onMapReady?: (map: maplibregl.Map) => void;
}

/** 부채꼴 + 화살표 GeoJSON 생성 */
function buildDirectionGeoJSON(
  lat: number,
  lng: number,
  heading: number,
  fov: number,
  distance: number = 200
): GeoJSON.FeatureCollection {
  const arcPoints: [number, number][] = [];
  const startAngle = heading - fov / 2;
  const endAngle = heading + fov / 2;
  arcPoints.push([lng, lat]);
  for (let angle = startAngle; angle <= endAngle; angle += 2) {
    arcPoints.push(destinationPoint(lat, lng, distance, angle));
  }
  arcPoints.push([lng, lat]);

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

/** 방향 레이어 추가 */
function addDirectionLayers(map: maplibregl.Map) {
  map.addSource(DIRECTION_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addLayer({
    id: ARC_LAYER,
    type: 'fill',
    source: DIRECTION_SOURCE,
    filter: ['==', ['get', 'type'], 'arc'],
    paint: { 'fill-color': '#3B82F6', 'fill-opacity': 0.2 },
  });
  map.addLayer({
    id: ARROW_LAYER,
    type: 'line',
    source: DIRECTION_SOURCE,
    filter: ['==', ['get', 'type'], 'arrow'],
    paint: { 'line-color': '#3B82F6', 'line-width': 2 },
  });
}

/** 방향 레이어 데이터 갱신 */
function updateDirectionLayer(
  map: maplibregl.Map,
  lat: number,
  lng: number,
  heading: number,
  fov: number
) {
  const src = map.getSource(DIRECTION_SOURCE) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;
  src.setData(buildDirectionGeoJSON(lat, lng, heading, fov));
}

/** 핀 DOM 요소 생성 */
function createPinElement(color: string, label: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `
    width: 32px; height: 32px;
    background: ${color};
    border: 2px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    cursor: grab;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
  `;
  const inner = document.createElement('div');
  inner.style.cssText = `
    transform: rotate(45deg);
    font-size: 14px;
    line-height: 1;
  `;
  inner.textContent = label;
  el.appendChild(inner);
  return el;
}

export default function DraggablePin({
  shooterLat,
  shooterLng,
  targetLat,
  targetLng,
  heading,
  fov,
  onShooterDragEnd,
  onTargetDragEnd,
  onMapReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const shooterMarkerRef = useRef<maplibregl.Marker | null>(null);
  const targetMarkerRef = useRef<maplibregl.Marker | null>(null);
  const mapLoadedRef = useRef(false);

  // 최신 콜백을 ref로 유지 (stale closure 방지)
  const onShooterDragEndRef = useRef(onShooterDragEnd);
  const onTargetDragEndRef = useRef(onTargetDragEnd);
  const onMapReadyRef = useRef(onMapReady);
  useEffect(() => { onShooterDragEndRef.current = onShooterDragEnd; });
  useEffect(() => { onTargetDragEndRef.current = onTargetDragEnd; });
  useEffect(() => { onMapReadyRef.current = onMapReady; });

  // 최신 핀 위치를 ref로 유지
  const shooterRef = useRef({ lat: shooterLat, lng: shooterLng });
  const targetRef = useRef({ lat: targetLat, lng: targetLng });
  const headingRef = useRef(heading);
  const fovRef = useRef(fov);
  useEffect(() => { shooterRef.current = { lat: shooterLat, lng: shooterLng }; });
  useEffect(() => { targetRef.current = { lat: targetLat, lng: targetLng }; });
  useEffect(() => { headingRef.current = heading; });
  useEffect(() => { fovRef.current = fov; });

  // 맵 초기화 (마운트 시 1회)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [shooterRef.current.lng, shooterRef.current.lat],
      zoom: 16,
      pitch: 0,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      mapLoadedRef.current = true;
      addDirectionLayers(map);

      // 촬영자 핀 (파란색)
      const shooterEl = createPinElement('#3B82F6', '📍');
      const shooterMarker = new maplibregl.Marker({
        element: shooterEl,
        draggable: true,
        anchor: 'bottom',
      })
        .setLngLat([shooterRef.current.lng, shooterRef.current.lat])
        .addTo(map);

      shooterMarker.on('dragend', () => {
        const lngLat = shooterMarker.getLngLat();
        onShooterDragEndRef.current(lngLat.lat, lngLat.lng);
      });

      // 타겟 핀 (빨간색)
      const targetEl = createPinElement('#EF4444', '🎯');
      const targetMarker = new maplibregl.Marker({
        element: targetEl,
        draggable: true,
        anchor: 'bottom',
      })
        .setLngLat([targetRef.current.lng, targetRef.current.lat])
        .addTo(map);

      targetMarker.on('dragend', () => {
        const lngLat = targetMarker.getLngLat();
        onTargetDragEndRef.current(lngLat.lat, lngLat.lng);
      });

      shooterMarkerRef.current = shooterMarker;
      targetMarkerRef.current = targetMarker;

      // 초기 방향 표시
      updateDirectionLayer(
        map,
        shooterRef.current.lat,
        shooterRef.current.lng,
        headingRef.current,
        fovRef.current
      );

      onMapReadyRef.current?.(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      shooterMarkerRef.current = null;
      targetMarkerRef.current = null;
      mapLoadedRef.current = false;
    };
  }, []);

  // 촬영자 핀 위치 외부에서 변경 시 마커 이동
  useEffect(() => {
    shooterMarkerRef.current?.setLngLat([shooterLng, shooterLat]);
  }, [shooterLat, shooterLng]);

  // 타겟 핀 위치 외부에서 변경 시 마커 이동
  useEffect(() => {
    targetMarkerRef.current?.setLngLat([targetLng, targetLat]);
  }, [targetLat, targetLng]);

  // heading/fov 변경 시 방향 레이어 업데이트
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    updateDirectionLayer(map, shooterLat, shooterLng, heading, fov);
  }, [shooterLat, shooterLng, heading, fov]);

  return <div ref={containerRef} className="w-full h-full" />;
}
