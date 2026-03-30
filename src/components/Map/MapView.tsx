import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { INITIAL_VIEW, photozones } from '../../data/photozones';
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
  selectedZone: PhotoZone | null;
  viewMode: '2d' | '3d';
  onZoneSelect: (zone: PhotoZone) => void;
  onMapReady?: (map: maplibregl.Map) => void;
}

export default function MapView({ selectedZone, viewMode: _viewMode, onZoneSelect, onMapReady }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<MarkerHandle[]>([]);
  // 항상 최신 콜백을 유지하는 ref (stale closure 방지)
  const onZoneSelectRef = useRef(onZoneSelect);
  const onMapReadyRef = useRef(onMapReady);

  useEffect(() => { onZoneSelectRef.current = onZoneSelect; });
  useEffect(() => { onMapReadyRef.current = onMapReady; });

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
      // 마커 추가 (onZoneSelectRef로 최신 콜백 보장)
      markersRef.current = addPhotoMarkers(map, photozones, (zone) =>
        onZoneSelectRef.current(zone)
      );

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
    };
  }, []);

  // selectedZone 변경 시 방향 레이어 + 마커 선택 상태 업데이트
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    updateDirectionLayer(map, selectedZone);
    updateMarkerSelection(markersRef.current, selectedZone?.id ?? null);
  }, [selectedZone]);

  return <div ref={containerRef} className="w-full h-full" />;
}
