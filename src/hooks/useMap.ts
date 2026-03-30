import { useRef } from 'react';
import type maplibregl from 'maplibre-gl';

// 맵 인스턴스를 ref로 관리 — onMapReady 콜백으로 다른 컴포넌트와 공유
export function useMap() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  return mapRef;
}
