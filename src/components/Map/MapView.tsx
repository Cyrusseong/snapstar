import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { INITIAL_VIEW } from '../../data/photozones';
import type { PhotoZone } from '../../types/photozone';
import { addPhotoMarkers, updateMarkerSelection, type MarkerHandle } from './PhotoMarker';
import { addDirectionLayers, updateDirectionLayer } from './DirectionArrow';
import { addBuildings3D } from './Buildings3D';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE =
  MAPTILER_KEY && MAPTILER_KEY !== 'placeholder_replace_me'
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
    : 'https://tiles.openfreemap.org/styles/liberty';

interface MapViewProps {
  zones: PhotoZone[];
  selectedZone: PhotoZone | null;
  viewMode: '2d' | '3d';
  onZoneSelect: (zone: PhotoZone) => void;
  onMapReady?: (map: maplibregl.Map) => void;
}

export default function MapView({ zones, selectedZone, viewMode: _viewMode, onZoneSelect, onMapReady }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<MarkerHandle[]>([]);
  const mapLoadedRef = useRef(false);
  // 항상 최신 콜백을 유지하는 ref (stale closure 방지)
  const onZoneSelectRef = useRef(onZoneSelect);
  const onMapReadyRef = useRef(onMapReady);
  const zonesRef = useRef(zones);

  useEffect(() => { onZoneSelectRef.current = onZoneSelect; });
  useEffect(() => { onMapReadyRef.current = onMapReady; });
  useEffect(() => { zonesRef.current = zones; });

  // 마커 재생성 헬퍼
  function rebuildMarkers(map: maplibregl.Map) {
    markersRef.current.forEach((m) => m.marker.remove());
    markersRef.current = addPhotoMarkers(map, zonesRef.current, (zone) =>
      onZoneSelectRef.current(zone)
    );
  }

  // 맵 초기화 (마운트 시 1회)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      maxPitch: 85,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      mapLoadedRef.current = true;

      // zones가 이미 로드됐으면 마커 즉시 추가, 아니면 zones effect가 처리
      if (zonesRef.current.length > 0) {
        rebuildMarkers(map);
      }

      // 방향 표시 레이어 추가
      addDirectionLayers(map);

      // 3D 건물 레이어 추가
      addBuildings3D(map);

      // 맵 준비 완료 콜백
      onMapReadyRef.current?.(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      mapLoadedRef.current = false;
    };
  }, []);

  // zones 변경 시 마커 재생성 (맵 로드 완료 + zones 비어있지 않을 때)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current || zones.length === 0) return;
    rebuildMarkers(map);
  }, [zones]);

  // selectedZone 변경 시 방향 레이어 + 마커 선택 상태 업데이트
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    updateDirectionLayer(map, selectedZone);
    updateMarkerSelection(markersRef.current, selectedZone?.id ?? null);
  }, [selectedZone]);

  return <div ref={containerRef} className="w-full h-full" />;
}
