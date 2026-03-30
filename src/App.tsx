import { useRef } from 'react';
import maplibregl from 'maplibre-gl';
import MapView from './components/Map/MapView';
import ViewToggle from './components/UI/ViewToggle';
import PhotoZoneNav from './components/Navigation/PhotoZoneNav';
import { usePhotoZone } from './hooks/usePhotoZone';
import { useMap } from './hooks/useMap';
import { flyToPhotoZone, flyToOverview, toggle3DDirection } from './utils/camera';
import type { PhotoZone } from './types/photozone';

export default function App() {
  const mapRef = useMap();
  const { selectedZone, setSelectedZone, clearSelection, viewMode, setViewMode } = usePhotoZone();
  // viewMode를 ref로도 유지 (콜백 클로저에서 최신값 접근용)
  const viewModeRef = useRef<'2d' | '3d'>('2d');

  function handleZoneSelect(zone: PhotoZone) {
    setSelectedZone(zone);
    if (mapRef.current) {
      flyToPhotoZone(mapRef.current, zone, viewModeRef.current);
    }
  }

  function handleClearSelection() {
    clearSelection();
    setViewMode('2d');
    viewModeRef.current = '2d';
    if (mapRef.current) {
      flyToOverview(mapRef.current);
    }
  }

  function handleToggleViewMode() {
    const newMode = viewMode === '2d' ? '3d' : '2d';
    setViewMode(newMode);
    viewModeRef.current = newMode;
    if (mapRef.current) {
      toggle3DDirection(mapRef.current, newMode === '3d');
    }
  }

  function handleMapReady(map: maplibregl.Map) {
    mapRef.current = map;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 (56px) */}
      <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0">
        <div className="text-lg font-semibold">📸 SnapStar</div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearSelection}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            🗼 전체보기
          </button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded">▶ 투어</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded">KR</button>
        </div>
      </header>

      {/* 메인 영역 — 지도 + 플로팅 버튼 */}
      <main className="flex-1 relative">
        <MapView
          selectedZone={selectedZone}
          viewMode={viewMode}
          onZoneSelect={handleZoneSelect}
          onMapReady={handleMapReady}
        />
        <ViewToggle
          selectedZone={selectedZone}
          viewMode={viewMode}
          onToggle={handleToggleViewMode}
        />
      </main>

      {/* 하단 네비바 */}
      <PhotoZoneNav
        selectedZone={selectedZone}
        onSelect={handleZoneSelect}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}
